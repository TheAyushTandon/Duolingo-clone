"""Demo user seed.

Idempotent by username. The demo learner studies French (the default
course) with partial progress so the learning path shows all four skill
states: completed, in-progress, available, and locked.

If the user exists but has no completed attempts (first run, or after a
course swap wiped the old progress), the demo progress is (re-)created.
"""

from __future__ import annotations

import datetime as dt

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.constants import AttemptStatus, XPReason
from app.models.achievement import UserAchievement
from app.models.attempt import LessonAttempt
from app.models.content import Course, Exercise, Lesson, Skill, Unit
from app.models.gamification import UserActivity, XPTransaction
from app.models.progress import UserSkillProgress
from app.models.user import User
from app.seed.seed_content import DEFAULT_COURSE_CODE
from app.utils.dates import today_utc

DEMO_USERNAME = "demo_learner"


def seed_users(db: Session) -> User:
    """Create or return the demo learner with realistic partial progress."""
    user = db.scalar(select(User).where(User.username == DEMO_USERNAME))

    from app.core.auth_utils import hash_password

    if user is None:
        user = User(
            username=DEMO_USERNAME,
            password_hash=hash_password("duolingo123"),
            email=f"{DEMO_USERNAME}@example.com",
            xp=0,
            gems=100,
            hearts=5,
            max_hearts=get_settings().default_max_hearts,
            streak=3,
            last_active_date=today_utc() - dt.timedelta(days=1),
        )
        db.add(user)
        db.flush()
    elif not user.password_hash:
        user.password_hash = hash_password("duolingo123")
        db.flush()

    # The demo learner studies the default (French) course.
    course = db.scalar(select(Course).where(Course.code == DEFAULT_COURSE_CODE))
    if course is not None:
        user.active_course_id = course.id

    # (Re)seed partial progress when the user has none — first run, or after
    # the Spanish -> French course swap cascade-deleted the old attempts.
    completed = db.scalar(
        select(func.count())
        .select_from(LessonAttempt)
        .where(
            LessonAttempt.user_id == user.id,
            LessonAttempt.status == AttemptStatus.COMPLETED,
        )
    )
    if not completed:
        _reset_demo_state(db, user)
        _seed_partial_progress(db, user)

    db.commit()
    return user


def _reset_demo_state(db: Session, user: User) -> None:
    """Clear stale gamification state before re-seeding demo progress.

    After a course swap, attempts/progress rows cascade away with the old
    course, but the XP ledger, achievement unlocks, and activity survive.
    Re-seeding on top of them would desync the cached XP from the ledger,
    so the demo state is reset to a clean slate first.
    """
    db.execute(delete(XPTransaction).where(XPTransaction.user_id == user.id))
    db.execute(delete(UserAchievement).where(UserAchievement.user_id == user.id))
    db.execute(delete(UserActivity).where(UserActivity.user_id == user.id))
    db.flush()
    user.xp = 0
    user.gems = 100
    user.streak = 3
    user.last_active_date = today_utc() - dt.timedelta(days=1)


def _seed_partial_progress(db: Session, user: User) -> None:
    """Complete the first skill's lessons via recorded attempts + XP ledger.

    This mirrors what the real completion pipeline would have produced:
    COMPLETED attempts, XP transactions, skill progress, and activity rows,
    so the learning path demonstrates every state.
    """
    course = db.scalar(select(Course).where(Course.code == DEFAULT_COURSE_CODE))
    if course is None:
        return

    units = list(
        db.scalars(select(Unit).where(Unit.course_id == course.id).order_by(Unit.order_index))
    )
    if not units:
        return

    first_unit_skills = list(
        db.scalars(select(Skill).where(Skill.unit_id == units[0].id).order_by(Skill.order_index))
    )
    if not first_unit_skills:
        return

    greeting_skill = first_unit_skills[0]
    lessons = list(
        db.scalars(
            select(Lesson).where(Lesson.skill_id == greeting_skill.id).order_by(Lesson.order_index)
        )
    )
    if not lessons:
        return

    completed_at = dt.datetime.now(dt.UTC) - dt.timedelta(days=1)
    total_xp = 0
    for lesson in lessons:
        exercise_count = len(
            list(db.scalars(select(Exercise.id).where(Exercise.lesson_id == lesson.id)))
        )
        attempt = LessonAttempt(
            user_id=user.id,
            lesson_id=lesson.id,
            status=AttemptStatus.COMPLETED,
            current_exercise_index=exercise_count,
            started_at=completed_at,
            completed_at=completed_at,
            xp_earned=lesson.xp_reward,
        )
        db.add(attempt)
        db.flush()
        db.add(
            XPTransaction(
                user_id=user.id,
                amount=lesson.xp_reward,
                reason=XPReason.LESSON_COMPLETION,
                reference_type="LESSON_ATTEMPT",
                reference_id=attempt.id,
                created_at=completed_at,
            )
        )
        total_xp += lesson.xp_reward

    # Skill progress: first skill fully completed.
    db.add(
        UserSkillProgress(
            user_id=user.id,
            skill_id=greeting_skill.id,
            level=greeting_skill.total_levels,
            progress_percentage=100,
            is_completed=True,
            completed_at=completed_at,
        )
    )

    # Second skill partially in progress (one lesson done of two).
    if len(first_unit_skills) > 1:
        food_skill = first_unit_skills[1]
        food_lessons = list(
            db.scalars(
                select(Lesson).where(Lesson.skill_id == food_skill.id).order_by(Lesson.order_index)
            )
        )
        completed_food = len(food_lessons) - 1 if food_lessons else 0
        percentage = int(completed_food / len(food_lessons) * 100) if food_lessons else 0
        db.add(
            UserSkillProgress(
                user_id=user.id,
                skill_id=food_skill.id,
                level=completed_food + 1,
                progress_percentage=percentage,
                is_completed=False,
            )
        )

    user.xp = total_xp

    # Unlock achievements the real pipeline would have granted (First Steps,
    # Skill Master) plus their XP rewards — mirrored through the achievement
    # service so the seeded state matches live behavior.
    db.flush()  # make pending progress rows visible to the stats queries
    from app.services.achievement_service import AchievementService

    unlocked = AchievementService(db).evaluate_user_achievements(user)
    db.flush()
    total_xp += sum(achievement.xp_reward for achievement in unlocked)
    user.xp = total_xp

    # Activity history: one active day backing the seeded streak.
    yesterday = today_utc() - dt.timedelta(days=1)
    activity = db.scalar(
        select(UserActivity).where(
            UserActivity.user_id == user.id,
            UserActivity.activity_date == yesterday,
        )
    )
    if activity is None:
        db.add(
            UserActivity(
                user_id=user.id,
                activity_date=yesterday,
                xp_earned=total_xp,
                lessons_completed=len(lessons),
            )
        )
