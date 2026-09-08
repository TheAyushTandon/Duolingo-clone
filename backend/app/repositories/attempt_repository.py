"""Lesson/exercise attempt data access."""

from __future__ import annotations

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.core.constants import AttemptStatus
from app.models.attempt import ExerciseAttempt, LessonAttempt


class AttemptRepository:
    def get_attempt(self, db: Session, attempt_id: str) -> LessonAttempt | None:
        return db.get(LessonAttempt, attempt_id)

    def get_in_progress_attempt(
        self, db: Session, user_id: str, lesson_id: str
    ) -> LessonAttempt | None:
        stmt = select(LessonAttempt).where(
            LessonAttempt.user_id == user_id,
            LessonAttempt.lesson_id == lesson_id,
            LessonAttempt.status == AttemptStatus.IN_PROGRESS,
        )
        return db.scalar(stmt)

    def add_attempt(self, db: Session, attempt: LessonAttempt) -> LessonAttempt:
        db.add(attempt)
        return attempt

    def claim_completion(self, db: Session, attempt_id: str) -> bool:
        """Atomically transition IN_PROGRESS -> COMPLETED.

        Returns True when this call performed the transition (affected row
        count = 1). A zero row count means another request already claimed
        completion — the caller must return the stored result and must NOT
        award rewards again.

        Executed with ``synchronize_session=False`` so the UPDATE is a single
        atomic statement against the current committed state, not the ORM
        session's potentially stale snapshot.
        """
        result = db.execute(
            update(LessonAttempt)
            .where(
                LessonAttempt.id == attempt_id,
                LessonAttempt.status == AttemptStatus.IN_PROGRESS,
            )
            .values(
                status=AttemptStatus.COMPLETED,
                completed_at=func.now(),
            )
            .execution_options(synchronize_session=False)
        )
        rowcount = getattr(result, "rowcount", 0) or 0
        return bool(int(rowcount))

    def set_failed(self, db: Session, attempt_id: str) -> None:
        db.execute(
            update(LessonAttempt)
            .where(
                LessonAttempt.id == attempt_id,
                LessonAttempt.status == AttemptStatus.IN_PROGRESS,
            )
            .values(status=AttemptStatus.FAILED)
            .execution_options(synchronize_session=False)
        )

    def set_abandoned(self, db: Session, attempt_id: str) -> None:
        db.execute(
            update(LessonAttempt)
            .where(
                LessonAttempt.id == attempt_id,
                LessonAttempt.status == AttemptStatus.IN_PROGRESS,
            )
            .values(status=AttemptStatus.ABANDONED)
            .execution_options(synchronize_session=False)
        )

    # ----------------------------------------------- exercise attempts ----

    def get_exercise_attempts(self, db: Session, lesson_attempt_id: str) -> list[ExerciseAttempt]:
        stmt = (
            select(ExerciseAttempt)
            .where(ExerciseAttempt.lesson_attempt_id == lesson_attempt_id)
            .order_by(ExerciseAttempt.created_at, ExerciseAttempt.attempt_number)
        )
        return list(db.scalars(stmt))

    def next_attempt_number(self, db: Session, lesson_attempt_id: str, exercise_id: str) -> int:
        stmt = select(func.coalesce(func.max(ExerciseAttempt.attempt_number), 0)).where(
            ExerciseAttempt.lesson_attempt_id == lesson_attempt_id,
            ExerciseAttempt.exercise_id == exercise_id,
        )
        return int(db.scalar(stmt) or 0) + 1

    def add_exercise_attempt(
        self, db: Session, exercise_attempt: ExerciseAttempt
    ) -> ExerciseAttempt:
        db.add(exercise_attempt)
        return exercise_attempt
