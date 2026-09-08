"""AchievementService unit tests: unlocks, thresholds, idempotent rewards."""

from __future__ import annotations

import datetime as dt

from sqlalchemy import select

from app.core.constants import AttemptStatus
from app.models.achievement import UserAchievement
from app.models.attempt import LessonAttempt
from app.models.content import Lesson, Skill
from app.models.progress import UserSkillProgress
from app.models.user import User
from app.services.achievement_service import AchievementService


def _make_user(xp: int = 0, streak: int = 0) -> User:
    return User(
        username=f"ach_test_{dt.datetime.now().timestamp()}",
        xp=xp,
        streak=streak,
    )


def _real_lesson(db) -> Lesson:
    lesson = db.scalar(select(Lesson))
    assert lesson is not None
    return lesson


def _real_skill(db) -> Skill:
    skill = db.scalar(select(Skill))
    assert skill is not None
    return skill


def _record_completed_lesson(db, user: User) -> None:
    """Simulate one completed lesson with a real (FK-valid) lesson id."""
    db.add(
        LessonAttempt(
            user_id=user.id,
            lesson_id=_real_lesson(db).id,
            status=AttemptStatus.COMPLETED,
            current_exercise_index=1,
            started_at=dt.datetime.now(dt.UTC),
        )
    )
    db.flush()


class TestAchievementUnlock:
    def test_first_lesson_unlocks(self, db) -> None:
        user = _make_user()
        db.add(user)
        db.flush()
        _record_completed_lesson(db, user)

        unlocked = AchievementService(db).evaluate_user_achievements(user)
        db.flush()
        assert len(unlocked) == 1  # First Steps

        rows = list(db.scalars(select(UserAchievement).where(UserAchievement.user_id == user.id)))
        assert len(rows) == 1

    def test_no_qualifying_achievements(self, db) -> None:
        user = _make_user(xp=0, streak=0)
        db.add(user)
        db.flush()
        unlocked = AchievementService(db).evaluate_user_achievements(user)
        assert unlocked == []

    def test_already_unlocked_not_reawarded(self, db) -> None:
        user = _make_user()
        db.add(user)
        db.flush()
        _record_completed_lesson(db, user)

        service = AchievementService(db)
        first = service.evaluate_user_achievements(user)
        db.flush()
        xp_after_first = user.xp
        assert len(first) == 1  # First Steps

        second = service.evaluate_user_achievements(user)
        assert second == []
        assert user.xp == xp_after_first  # no duplicate reward

    def test_xp_threshold_unlocks_and_awards(self, db) -> None:
        user = _make_user(xp=100)
        db.add(user)
        db.flush()

        unlocked = AchievementService(db).evaluate_user_achievements(user)
        assert len(unlocked) == 1  # XP Explorer (100 XP)
        assert user.xp == 110  # 100 + 10 reward

    def test_multiple_qualifying_at_once(self, db) -> None:
        """A completed skill grants Skill Master."""
        user = _make_user()
        db.add(user)
        db.flush()

        db.add(
            UserSkillProgress(
                user_id=user.id,
                skill_id=_real_skill(db).id,
                level=2,
                progress_percentage=100,
                is_completed=True,
                completed_at=dt.datetime.now(dt.UTC),
            )
        )
        db.flush()

        unlocked = AchievementService(db).evaluate_user_achievements(user)
        assert len(unlocked) == 1  # Skill Master
        assert user.xp == 10

    def test_streak_threshold(self, db) -> None:
        user = _make_user(streak=7)
        db.add(user)
        db.flush()
        unlocked = AchievementService(db).evaluate_user_achievements(user)
        assert len(unlocked) == 1  # Week Warrior
        assert user.xp == 15
