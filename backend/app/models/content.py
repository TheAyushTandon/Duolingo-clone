"""Course content models: courses, units, skills, lessons, exercises.

``exercise_data`` is safe to expose to clients; ``validation_data`` holds
correct answers and must NEVER leave the backend through public APIs.
"""

from __future__ import annotations

from typing import Any

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.constants import ExerciseType
from app.models.base import BaseModel


class Course(BaseModel):
    __tablename__ = "courses"

    title: Mapped[str] = mapped_column(String(128), nullable=False)
    code: Mapped[str] = mapped_column(String(8), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    flag_icon: Mapped[str | None] = mapped_column(String(16), nullable=True)
    # BCP-47 locale for native-tongue narration of target words, e.g. fr-FR.
    speech_locale: Mapped[str | None] = mapped_column(String(16), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Unit(BaseModel):
    __tablename__ = "units"
    __table_args__ = (UniqueConstraint("course_id", "order_index", name="uq_units_course_order"),)

    course_id: Mapped[str] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), index=True, nullable=False
    )
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    banner_color: Mapped[str | None] = mapped_column(String(16), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Skill(BaseModel):
    __tablename__ = "skills"
    __table_args__ = (UniqueConstraint("unit_id", "order_index", name="uq_skills_unit_order"),)

    unit_id: Mapped[str] = mapped_column(
        ForeignKey("units.id", ondelete="CASCADE"), index=True, nullable=False
    )
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    icon: Mapped[str | None] = mapped_column(String(64), nullable=True)
    total_levels: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Lesson(BaseModel):
    __tablename__ = "lessons"
    __table_args__ = (
        UniqueConstraint("skill_id", "order_index", name="uq_lessons_skill_order"),
        CheckConstraint("xp_reward >= 0", name="ck_lessons_xp_reward_non_negative"),
    )

    skill_id: Mapped[str] = mapped_column(
        ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False
    )
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(128), nullable=False)
    xp_reward: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    estimated_duration: Mapped[int] = mapped_column(Integer, default=120, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Exercise(BaseModel):
    __tablename__ = "exercises"
    __table_args__ = (
        UniqueConstraint("lesson_id", "order_index", name="uq_exercises_lesson_order"),
    )

    lesson_id: Mapped[str] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"), index=True, nullable=False
    )
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    type: Mapped[ExerciseType] = mapped_column(String(32), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    question_audio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Client-safe content (prompt data, word banks, options, distractors).
    exercise_data: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    # Correct answers. NEVER exposed through public API responses.
    validation_data: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
