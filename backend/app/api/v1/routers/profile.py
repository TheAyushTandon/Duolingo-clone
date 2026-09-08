"""Profile endpoints: identity, stats, activity history."""

from __future__ import annotations

import datetime as dt

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.repositories.content_repository import ContentRepository
from app.repositories.progress_repository import ProgressRepository
from app.schemas.achievement import AchievementOut
from app.schemas.user import ActivityEntry, ActivityPage, UserProfile, UserStats
from app.utils.dates import is_same_day, today_utc
from app.utils.pagination import clamp_limit, decode_cursor, next_cursor_for

router = APIRouter(prefix="/profile", tags=["Profile"])


class SetActiveCourseRequest(BaseModel):
    course_id: str = Field(min_length=1, max_length=64)


def _achievements_for(db: Session, user: User) -> list[AchievementOut]:
    repo = ProgressRepository()
    unlocked = repo.get_unlocked_achievements(db, user.id)
    return [
        AchievementOut(
            id=achievement.id,
            name=achievement.name,
            description=achievement.description,
            icon=achievement.icon,
            xp_reward=achievement.xp_reward,
            is_unlocked=achievement.id in unlocked,
            unlocked_at=(
                unlocked[achievement.id].unlocked_at if achievement.id in unlocked else None
            ),
        )
        for achievement in repo.get_achievements(db)
    ]


def build_user_profile(db: Session, user: User) -> UserProfile:
    """Public profile schema from a User ORM instance (never return the ORM
    object itself)."""
    return UserProfile(
        id=user.id,
        username=user.username,
        email=user.email or "",
        avatar_url=user.avatar_url or "",
        xp=user.xp,
        gems=user.gems,
        hearts=user.hearts,
        max_hearts=user.max_hearts,
        streak=user.streak,
        streak_active_today=user.last_active_date is not None
        and is_same_day(user.last_active_date, today_utc()),
        achievements=_achievements_for(db, user),
        created_at=user.created_at,
    )


@router.get("", response_model=UserProfile, summary="Get the current user's profile")
def get_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfile:
    """Identity, gamification snapshot, and achievement list."""
    return build_user_profile(db, user)


@router.get("/stats", response_model=UserStats, summary="Get aggregate user stats")
def get_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserStats:
    """Lifetime aggregates: XP, streak, counts of lessons/skills/achievements."""
    repo = ProgressRepository()
    return UserStats(
        xp=user.xp,
        gems=user.gems,
        streak=user.streak,
        hearts=user.hearts,
        total_lessons_completed=repo.count_completed_attempts(db, user.id),
        skills_completed=repo.count_completed_skills(db, user.id),
        achievements_count=repo.count_unlocked_achievements(db, user.id),
    )


@router.post(
    "/course",
    response_model=UserProfile,
    summary="Set the user's active course",
    responses={404: {"description": "Course not found"}},
)
def set_active_course(
    payload: SetActiveCourseRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfile:
    """Switch the course the learner is studying (drives the default
    learning path). Progress in each course is independent."""
    course = ContentRepository().get_course(db, payload.course_id)
    if course is None:
        raise NotFoundError("Course", payload.course_id)
    user.active_course_id = course.id
    db.commit()
    return build_user_profile(db, user)


@router.get(
    "/activity",
    response_model=ActivityPage,
    summary="Daily activity history (cursor paginated)",
)
def get_activity(
    limit: int | None = Query(default=20, ge=1, le=100),
    cursor: str | None = Query(
        default=None, max_length=100, description="Opaque cursor from a prior page"
    ),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ActivityPage:
    """One row per active day, newest first. Cursor is the activity date."""
    repo = ProgressRepository()
    page_limit = clamp_limit(limit)
    before: dt.date | None = None
    if cursor:
        decoded = decode_cursor(cursor)
        if decoded:
            try:
                before = dt.date.fromisoformat(decoded)
            except ValueError:
                before = None

    rows = repo.list_activity_page(db, user.id, page_limit, before)

    has_more = len(rows) == page_limit
    last_key = rows[-1].activity_date.isoformat() if rows else None
    return ActivityPage(
        items=[
            ActivityEntry(
                activity_date=row.activity_date,
                xp_earned=row.xp_earned,
                lessons_completed=row.lessons_completed,
            )
            for row in rows
        ],
        next_cursor=next_cursor_for(has_more, last_key),
    )
