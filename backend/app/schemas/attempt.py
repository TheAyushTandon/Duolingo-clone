"""Lesson attempt lifecycle schemas (frontend contract)."""

from __future__ import annotations

import datetime as dt

from pydantic import BaseModel, Field

from app.core.constants import AttemptStatus
from app.schemas.achievement import AchievementOut


class AttemptCreateResponse(BaseModel):
    attempt_id: str
    lesson_id: str
    status: AttemptStatus
    current_exercise_index: int
    started_at: dt.datetime
    hearts_remaining: int


class SubmittedExerciseHistory(BaseModel):
    """Historical submission record used to reconstruct UI state after refresh."""

    exercise_id: str
    is_correct: bool
    attempt_number: int


class LessonCompleteResponse(BaseModel):
    success: bool = True
    attempt_id: str
    xp_awarded: int
    gems_awarded: int
    total_xp: int
    streak: int
    hearts_remaining: int
    skill_level: int
    is_skill_completed: bool
    new_achievements: list[AchievementOut]


class AttemptDetailResponse(BaseModel):
    attempt_id: str
    lesson_id: str
    status: AttemptStatus
    current_exercise_index: int
    hearts_remaining: int
    hearts_lost: int
    submitted_exercises: list[SubmittedExerciseHistory]
    completion_result: LessonCompleteResponse | None = None


class ExerciseSubmissionRequest(BaseModel):
    """Wraps the answer payload. Shape of ``submitted_answer`` depends on
    the exercise type (selected_option / selected_words / pairs / answer).

    Bounded sizes reject oversized payloads early (audit §14): the payload
    mirrors the backend's domain limits (500-char answers, <=20 words,
    <=20 pairs, <=50-char tokens).
    """

    submitted_answer: dict[str, object] = Field(
        description="Answer payload; shape depends on exercise type."
    )


class ExerciseSubmitResponse(BaseModel):
    is_correct: bool
    solution_text: str = Field(
        default="", description="Correct answer shown on incorrect submissions."
    )
    hearts_remaining: int
    current_exercise_index: int
    attempt_status: AttemptStatus
    message: str | None = None
