"""Lesson attempt lifecycle: start, submit, complete, fail, abandon, resume.

Lesson completion is the most safety-critical flow in the backend:

1. ``claim_completion`` performs a single conditional UPDATE
   (IN_PROGRESS -> COMPLETED) and reports the affected row count.
2. Only the request whose UPDATE claimed the row runs the reward pipeline.
3. Every reward write (XP ledger, cached XP, skill progress, activity,
   streak, achievements) happens inside one database transaction that is
   committed by the caller of the service method — never per-step.
4. The full completion result is snapshotted onto the attempt so a retry
   (or concurrent duplicate request) returns the identical payload.
"""

from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.constants import AttemptStatus, XPReason
from app.core.exceptions import (
    AttemptNotInProgressError,
    InsufficientHeartsError,
    InvalidExerciseSubmissionError,
    NotFoundError,
)
from app.models.attempt import ExerciseAttempt, LessonAttempt
from app.models.base import utc_now
from app.models.content import Exercise
from app.models.user import User
from app.repositories.attempt_repository import AttemptRepository
from app.repositories.content_repository import ContentRepository
from app.repositories.progress_repository import ProgressRepository
from app.services.achievement_service import AchievementService
from app.services.exercise_validation_service import (
    ExerciseValidationService,
    ValidationResult,
)
from app.services.heart_service import HeartService
from app.services.lesson_service import LessonService
from app.services.progress_service import ProgressService
from app.services.streak_service import StreakService
from app.services.xp_service import XPService
from app.utils.dates import today_utc


class AttemptService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.attempt_repo = AttemptRepository()
        self.content_repo = ContentRepository()
        self.progress_repo = ProgressRepository()
        self.lesson_service = LessonService(db)
        self.validation_service = ExerciseValidationService()
        self.heart_service = HeartService(db)
        self.streak_service = StreakService(db)
        self.xp_service = XPService(db)
        self.progress_service = ProgressService(db)
        self.achievement_service = AchievementService(db)

    # ------------------------------------------------------------- start ---

    def start_attempt(self, user: User, lesson_id: str) -> tuple[LessonAttempt, bool]:
        """Create or resume the user's in-progress attempt for a lesson.

        Returns (attempt, resumed). Raises if hearts are empty or the
        lesson's skill is locked.
        """
        lesson = self.lesson_service.get_lesson(lesson_id)
        exercises = self.lesson_service.get_lesson_exercises(lesson)
        if not exercises:
            raise InvalidExerciseSubmissionError("Lesson has no exercises.")

        self.lesson_service.check_lesson_accessibility(user, lesson)

        self.heart_service.regenerate_hearts(user)
        if user.hearts <= 0:
            raise InsufficientHeartsError("No hearts remaining — wait for regeneration or refill.")

        existing = self.attempt_repo.get_in_progress_attempt(self.db, user.id, lesson.id)
        if existing is not None:
            return existing, True

        attempt = LessonAttempt(
            user_id=user.id,
            lesson_id=lesson.id,
            status=AttemptStatus.IN_PROGRESS,
            current_exercise_index=0,
            started_at=utc_now(),
        )
        self.attempt_repo.add_attempt(self.db, attempt)
        return attempt, False

    def resume_attempt(self, user: User, attempt_id: str) -> LessonAttempt:
        """Fetch an attempt with reconstruction data for the client.

        Read-only: returns any status. Abandoned attempts surface their
        status so the client knows to start a fresh attempt; continuing
        (submitting) is rejected in ``submit_exercise``.
        """
        return self._get_user_attempt(user, attempt_id)

    # ----------------------------------------------------------- submit ---

    def submit_exercise(
        self,
        user: User,
        attempt_id: str,
        exercise_id: str,
        submitted_answer: dict[str, Any],
    ) -> tuple[LessonAttempt, ExerciseAttempt, ValidationResult]:
        """Validate and record one exercise submission.

        Wrong answers deduct a heart; reaching zero hearts fails the
        attempt (no XP). Advancing behavior: the index moves forward only
        on a correct answer; a wrong answer lets the learner retry the
        same exercise.
        """
        attempt = self._get_user_attempt(user, attempt_id)
        if attempt.status != AttemptStatus.IN_PROGRESS:
            raise AttemptNotInProgressError(
                f"Attempt is {attempt.status}; only IN_PROGRESS attempts accept submissions."
            )

        exercise = self._get_lesson_exercise(attempt, exercise_id)

        result = self.validation_service.validate(exercise, submitted_answer)

        attempt_number = self.attempt_repo.next_attempt_number(self.db, attempt.id, exercise.id)
        exercise_attempt = ExerciseAttempt(
            lesson_attempt_id=attempt.id,
            exercise_id=exercise.id,
            submitted_answer=submitted_answer,
            is_correct=result.is_correct,
            attempt_number=attempt_number,
        )
        self.attempt_repo.add_exercise_attempt(self.db, exercise_attempt)

        if result.is_correct:
            attempt.current_exercise_index = max(
                attempt.current_exercise_index, exercise.order_index + 1
            )
        else:
            self.heart_service.deduct_heart(user)
            attempt.hearts_lost += 1
            if user.hearts <= 0:
                self.attempt_repo.set_failed(self.db, attempt.id)
                self.db.flush()
                self._refresh_after_status_change(attempt)

        return attempt, exercise_attempt, result

    def _refresh_after_status_change(self, attempt: LessonAttempt) -> None:
        """Reload fields mutated by a synchronize_session=False UPDATE."""
        self.db.refresh(attempt)

    def _get_lesson_exercise(self, attempt: LessonAttempt, exercise_id: str) -> Exercise:
        """Fetch the exercise, verifying it belongs to the attempt's lesson."""
        exercise = self.content_repo.get_exercise(self.db, exercise_id)
        if exercise is None:
            raise NotFoundError("Exercise", exercise_id)
        if exercise.lesson_id != attempt.lesson_id:
            raise InvalidExerciseSubmissionError("Exercise does not belong to this lesson attempt.")
        return exercise

    # --------------------------------------------------------- complete ---

    def complete_attempt(self, user: User, attempt_id: str) -> tuple[LessonAttempt, dict[str, Any]]:
        """Complete an attempt and run the full reward pipeline atomically.

        Returns (attempt, completion_result). Idempotent: a second call
        returns the stored result without awarding anything again.
        """
        attempt = self._get_user_attempt(user, attempt_id)

        if attempt.status == AttemptStatus.FAILED:
            raise AttemptNotInProgressError("Failed attempts cannot be completed.")
        if attempt.status == AttemptStatus.ABANDONED:
            raise AttemptNotInProgressError("Abandoned attempts cannot be completed.")

        if attempt.status == AttemptStatus.COMPLETED:
            # Someone already completed it (possibly this same request retried).
            stored = attempt.completion_result or self._fallback_result(user)
            return attempt, stored

        claimed = self.attempt_repo.claim_completion(self.db, attempt.id)
        if not claimed:
            # Another concurrent request claimed completion first.
            self.db.flush()
            self.db.refresh(attempt)
            stored = attempt.completion_result or self._fallback_result(user)
            return attempt, stored
        self.db.flush()
        self.db.refresh(attempt)

        # This request owns completion from here on.
        lesson = self.content_repo.get_lesson(self.db, attempt.lesson_id)
        xp_amount = lesson.xp_reward if lesson else 0

        lesson_transaction = self.xp_service.award_xp(
            user,
            xp_amount,
            XPReason.LESSON_COMPLETION,
            "LESSON_ATTEMPT",
            attempt.id,
        )
        attempt.xp_earned = lesson_transaction.amount

        # Gem reward for finishing a lesson.
        gems_awarded = get_settings().lesson_completion_gem_reward
        user.gems += gems_awarded

        # Skill progress.
        skill_completed = False
        skill_level = 1
        if lesson is not None:
            skill = self.content_repo.get_skill(self.db, lesson.skill_id)
            if skill is not None:
                progress = self.progress_service.update_skill_progress(user, skill)
                skill_completed = progress.is_completed
                skill_level = progress.level

        # Daily activity (idempotent per date via UNIQUE(user_id, date)).
        today = today_utc()
        activity = self.progress_repo.upsert_activity(self.db, user.id, today)
        activity.xp_earned += lesson_transaction.amount
        activity.lessons_completed += 1

        # Streak.
        streak = self.streak_service.record_daily_activity(user)

        # Flush pending writes (progress/activity rows) so the achievement
        # stats queries below see them — autoflush is off.
        self.db.flush()

        # Achievements (may award additional XP and gems).
        unlocks = self.achievement_service.evaluate_user_achievements(user)

        result: dict[str, Any] = {
            "success": True,
            "attempt_id": attempt.id,
            "xp_awarded": attempt.xp_earned,
            "gems_awarded": gems_awarded
            + sum(get_settings().achievement_gem_reward for _ in unlocks),
            "total_xp": user.xp,
            "streak": streak,
            "hearts_remaining": user.hearts,
            "skill_level": skill_level,
            "is_skill_completed": skill_completed,
            "new_achievements": [
                {
                    "id": achievement.id,
                    "name": achievement.name,
                    "description": achievement.description,
                    "icon": achievement.icon,
                    "xp_reward": achievement.xp_reward,
                    "is_unlocked": True,
                    "unlocked_at": None,
                }
                for achievement in unlocks
            ],
        }
        attempt.completion_result = result
        return attempt, result

    def _fallback_result(self, user: User) -> dict[str, Any]:
        """Minimal result when a completed attempt lacks a stored snapshot."""
        return {
            "success": True,
            "attempt_id": "",
            "xp_awarded": 0,
            "gems_awarded": 0,
            "total_xp": user.xp,
            "streak": user.streak,
            "hearts_remaining": user.hearts,
            "skill_level": 1,
            "is_skill_completed": False,
            "new_achievements": [],
        }

    # ------------------------------------------------- fail / abandon ------

    def abandon_attempt(self, user: User, attempt_id: str) -> LessonAttempt:
        """Mark an in-progress attempt abandoned. It cannot be resumed."""
        attempt = self._get_user_attempt(user, attempt_id)
        if attempt.status != AttemptStatus.IN_PROGRESS:
            raise AttemptNotInProgressError(
                f"Only IN_PROGRESS attempts can be abandoned (current: {attempt.status})."
            )
        self.attempt_repo.set_abandoned(self.db, attempt.id)
        self.db.flush()
        self.db.refresh(attempt)
        return attempt

    # ------------------------------------------------------------ helpers ---

    def _get_user_attempt(self, user: User, attempt_id: str) -> LessonAttempt:
        attempt = self.attempt_repo.get_attempt(self.db, attempt_id)
        if attempt is None:
            raise NotFoundError("Lesson attempt", attempt_id)
        if attempt.user_id != user.id:
            # Do not leak existence of other users' attempts.
            raise NotFoundError("Lesson attempt", attempt_id)
        return attempt

    def get_attempt_history(self, attempt: LessonAttempt) -> list[ExerciseAttempt]:
        return self.attempt_repo.get_exercise_attempts(self.db, attempt.id)

    def hearts_remaining(self, user: User, attempt: LessonAttempt) -> int:
        """Hearts the user had at submission time, for resume payloads."""
        if attempt.status == AttemptStatus.IN_PROGRESS:
            return self.heart_service.get_current_hearts(user)
        return max(user.max_hearts - attempt.hearts_lost, 0)
