"""Exercise and lesson schemas.

Internal schemas may carry validation data; public schemas must never
serialize correct answers to clients. The split is deliberate and mandatory.

Public shapes mirror the frontend contract in ``frontend/src/types/index.ts``.
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import ExerciseType

# ---------------------------------------------------------------- internal ---


class ExerciseInternal(BaseModel):
    """Full exercise including validation data. Backend use only."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    lesson_id: str
    order_index: int
    type: ExerciseType
    prompt: str
    question_audio_url: str | None
    exercise_data: dict[str, object] | None
    validation_data: dict[str, object] | None


# ------------------------------------------------------------------ public ---


class PublicExercise(BaseModel):
    """Client-safe exercise. Never contains validation data."""

    id: str
    lesson_id: str
    order_index: int
    type: ExerciseType
    prompt: str
    question_audio_url: str | None = None
    # Client-safe content only: options, word bank, pairs, blanks, hints.
    exercise_data: dict[str, object] | None = Field(
        default=None,
        description="Exercise content (options, word bank, pairs). Contains no answers.",
    )


class LessonDetail(BaseModel):
    id: str
    skill_id: str
    order_index: int
    title: str
    xp_reward: int
    estimated_duration: int
    exercises: list[PublicExercise]


class LessonSummary(BaseModel):
    id: str
    title: str
    order_index: int
    xp_reward: int
    estimated_duration: int
