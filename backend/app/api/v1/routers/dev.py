"""Development-only endpoints (ENABLE_DEV_TOOLS=true).

Never available in production: the router is not mounted unless the flag
is set, and startup validation fails if dev tools are enabled in a
production environment.
"""

from __future__ import annotations

import datetime as dt

from fastapi import APIRouter, Depends, Query
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.achievement import UserAchievement
from app.models.attempt import ExerciseAttempt, LessonAttempt
from app.models.gamification import UserActivity, XPTransaction
from app.models.progress import UserSkillProgress
from app.models.user import User
from app.utils.dates import today_utc

router = APIRouter(prefix="/dev", tags=["Dev Tools"])


@router.post(
    "/simulate-day",
    summary="Advance the user's last-active date (streak testing)",
)
def simulate_day(
    days: int = Query(default=1, ge=1, le=365),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    """Shift the user's last activity date forward, creating a controlled
    gap for demonstrating streak day transitions and breaks."""
    if user.last_active_date is not None:
        user.last_active_date = user.last_active_date + dt.timedelta(days=days)
    else:
        user.last_active_date = today_utc() - dt.timedelta(days=days)
    db.commit()
    return {
        "success": True,
        "streak": user.streak,
        "message": f"Simulated {days} day(s) since last activity; "
        f"last_active_date is now {user.last_active_date.isoformat()}.",
    }


@router.post(
    "/reset-progress",
    summary="Reset the demo user's progress",
)
def reset_progress(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    """Full wipe of the user's learning state for repeatable demos:
    attempts, progress, XP transactions, activity, achievement unlocks;
    XP/gems/hearts/streak reset."""
    # Child rows first (FK ordering).
    attempt_ids = select(LessonAttempt.id).where(LessonAttempt.user_id == user.id)
    db.execute(delete(ExerciseAttempt).where(ExerciseAttempt.lesson_attempt_id.in_(attempt_ids)))
    db.execute(delete(LessonAttempt).where(LessonAttempt.user_id == user.id))
    db.execute(delete(UserActivity).where(UserActivity.user_id == user.id))
    db.execute(delete(XPTransaction).where(XPTransaction.user_id == user.id))
    db.execute(delete(UserAchievement).where(UserAchievement.user_id == user.id))
    db.execute(delete(UserSkillProgress).where(UserSkillProgress.user_id == user.id))
    user.xp = 0
    user.gems = 100
    user.hearts = user.max_hearts
    user.streak = 0
    user.last_active_date = None
    db.commit()
    return {
        "success": True,
        "message": "Progress reset: attempts, XP, gems, streak, achievements cleared.",
    }
