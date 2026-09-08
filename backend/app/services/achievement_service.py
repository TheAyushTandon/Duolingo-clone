"""Achievement evaluation with a generic criteria dispatcher.

All criteria handling is centralized in ``_CRITERIA_EVALUATORS``; adding a
new achievement type means adding one function, not scattering conditionals
through the codebase.
"""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.constants import AchievementCriteriaType, XPReason
from app.models.achievement import Achievement
from app.models.user import User
from app.repositories.progress_repository import ProgressRepository
from app.services.xp_service import XPService

# Stats snapshot shape handed to each evaluator.
Stats = dict[str, int]
Evaluator = Callable[[Stats, int], bool]


def _evaluator_for(criteria_type: str) -> Evaluator | None:
    evaluators: dict[AchievementCriteriaType, Evaluator] = {
        AchievementCriteriaType.FIRST_LESSON: (
            lambda stats, value: stats["lessons_completed"] >= max(value, 1)
        ),
        AchievementCriteriaType.TOTAL_XP: lambda stats, value: stats["total_xp"] >= value,
        AchievementCriteriaType.STREAK_THRESHOLD: lambda stats, value: stats["streak"] >= value,
        AchievementCriteriaType.SKILLS_COMPLETED: (
            lambda stats, value: stats["skills_completed"] >= value
        ),
        AchievementCriteriaType.LESSONS_COMPLETED: (
            lambda stats, value: stats["lessons_completed"] >= value
        ),
    }
    try:
        return evaluators[AchievementCriteriaType(criteria_type)]
    except ValueError:
        return None


class AchievementService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.progress_repo = ProgressRepository()
        self.xp_service = XPService(db)

    def _build_stats(self, user: User) -> Stats:
        return {
            "total_xp": user.xp,
            "streak": user.streak,
            "lessons_completed": self.progress_repo.count_completed_attempts(self.db, user.id),
            "skills_completed": self.progress_repo.count_completed_skills(self.db, user.id),
        }

    def _is_already_unlocked(self, user_id: str, achievement_id: str) -> bool:
        unlocked = self.progress_repo.get_unlocked_achievements(self.db, user_id)
        return achievement_id in unlocked

    def evaluate_user_achievements(self, user: User) -> list[Achievement]:
        """Unlock every qualifying, not-yet-unlocked achievement.

        Each unlock awards the achievement's XP reward and a gem reward,
        both idempotently (reason=ACHIEVEMENT, reference_type=ACHIEVEMENT,
        reference_id=<id>). Returns only the NEWLY unlocked definitions.
        """
        stats = self._build_stats(user)
        achievements = self.progress_repo.get_achievements(self.db)
        already = self.progress_repo.get_unlocked_achievements(self.db, user.id)

        newly_unlocked: list[Achievement] = []
        gem_reward = get_settings().achievement_gem_reward
        for achievement in achievements:
            if achievement.id in already:
                continue

            criteria: dict[str, Any] = achievement.criteria or {}
            evaluator = _evaluator_for(str(criteria.get("type", "")))
            if evaluator is None:
                continue
            if not evaluator(stats, int(criteria.get("value", 0))):
                continue

            self.progress_repo.add_user_achievement(self.db, user.id, achievement.id)
            newly_unlocked.append(achievement)

            # DuplicateXPError cannot occur: the unlock row above was
            # not in ``already``, so no prior reward exists.
            self.xp_service.award_xp(
                user,
                achievement.xp_reward,
                XPReason.ACHIEVEMENT,
                "ACHIEVEMENT",
                achievement.id,
            )
            user.gems += gem_reward
            # Keep the stats snapshot current for chained achievements
            # (e.g. an XP achievement unlocked by this reward).
            stats["total_xp"] = user.xp

        return newly_unlocked
