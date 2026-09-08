"""Lesson and exercise attempt models."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.constants import AttemptStatus
from app.models.base import BaseModel


class LessonAttempt(BaseModel):
    __tablename__ = "lesson_attempts"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    lesson_id: Mapped[str] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"), index=True, nullable=False
    )
    status: Mapped[AttemptStatus] = mapped_column(String(16), nullable=False, index=True)
    current_exercise_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    xp_earned: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    hearts_lost: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    # Full completion result snapshot so retries return the identical payload.
    completion_result: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)


class ExerciseAttempt(BaseModel):
    __tablename__ = "exercise_attempts"
    __table_args__ = (
        UniqueConstraint(
            "lesson_attempt_id",
            "exercise_id",
            "attempt_number",
            name="uq_exercise_attempt_number",
        ),
    )

    lesson_attempt_id: Mapped[str] = mapped_column(
        ForeignKey("lesson_attempts.id", ondelete="CASCADE"), index=True, nullable=False
    )
    exercise_id: Mapped[str] = mapped_column(
        ForeignKey("exercises.id", ondelete="CASCADE"), index=True, nullable=False
    )
    # Raw submission exactly as received; history is never overwritten.
    submitted_answer: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    attempt_number: Mapped[int] = mapped_column(Integer, nullable=False)
