"""Lesson attempt lifecycle endpoints.

Routers stay thin: request parsing, service calls, and response shaping.
All business rules live in AttemptService.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.core.logging import get_logger
from app.models.user import User
from app.schemas.attempt import (
    AttemptCreateResponse,
    AttemptDetailResponse,
    ExerciseSubmissionRequest,
    ExerciseSubmitResponse,
    LessonCompleteResponse,
    SubmittedExerciseHistory,
)
from app.schemas.common import ErrorResponse
from app.services.attempt_service import AttemptService

router = APIRouter(tags=["Attempts"])

logger = get_logger(__name__)


@router.post(
    "/lessons/{lesson_id}/attempts",
    response_model=AttemptCreateResponse,
    status_code=201,
    summary="Start (or resume) a lesson attempt",
    responses={
        403: {"model": ErrorResponse, "description": "Lesson locked or no hearts"},
        404: {"model": ErrorResponse, "description": "Lesson not found"},
    },
)
def start_attempt(
    lesson_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AttemptCreateResponse:
    """Create an attempt, or return the existing IN_PROGRESS attempt.

    Fails with 403 when the lesson's skill is locked or hearts are empty.
    """
    service = AttemptService(db)
    attempt, _resumed = service.start_attempt(user, lesson_id)
    db.commit()
    logger.info(
        "event=attempt_started user_id=%s lesson_id=%s attempt_id=%s",
        user.id,
        lesson_id,
        attempt.id,
    )
    return AttemptCreateResponse(
        attempt_id=attempt.id,
        lesson_id=attempt.lesson_id,
        status=attempt.status,
        current_exercise_index=attempt.current_exercise_index,
        started_at=attempt.started_at,
        hearts_remaining=service.heart_service.get_current_hearts(user),
    )


@router.get(
    "/lesson-attempts/{attempt_id}",
    response_model=AttemptDetailResponse,
    summary="Get attempt state for resume",
    responses={404: {"model": ErrorResponse, "description": "Attempt not found"}},
)
def get_attempt(
    attempt_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AttemptDetailResponse:
    """Reconstruction payload after a refresh: current index, hearts, and
    every submitted exercise so far."""
    service = AttemptService(db)
    attempt = service.resume_attempt(user, attempt_id)
    history = service.get_attempt_history(attempt)
    completion = attempt.completion_result
    return AttemptDetailResponse(
        attempt_id=attempt.id,
        lesson_id=attempt.lesson_id,
        status=attempt.status,
        current_exercise_index=attempt.current_exercise_index,
        hearts_remaining=service.hearts_remaining(user, attempt),
        hearts_lost=attempt.hearts_lost,
        submitted_exercises=[
            SubmittedExerciseHistory(
                exercise_id=record.exercise_id,
                is_correct=record.is_correct,
                attempt_number=record.attempt_number,
            )
            for record in history
        ],
        completion_result=LessonCompleteResponse(**completion) if completion else None,
    )


@router.post(
    "/lesson-attempts/{attempt_id}/exercises/{exercise_id}/submit",
    response_model=ExerciseSubmitResponse,
    summary="Submit an answer for one exercise",
    responses={
        403: {"model": ErrorResponse, "description": "Out of hearts"},
        404: {"model": ErrorResponse, "description": "Attempt or exercise not found"},
        409: {"model": ErrorResponse, "description": "Attempt not IN_PROGRESS"},
        422: {"model": ErrorResponse, "description": "Malformed submission"},
    },
)
def submit_exercise(
    attempt_id: str,
    exercise_id: str,
    submission: ExerciseSubmissionRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExerciseSubmitResponse:
    """Validate an answer server-side.

    Correct answers advance the exercise index. Wrong answers deduct a heart
    (the correct answer is returned as ``solution_text``); hitting zero
    hearts fails the attempt with no XP.
    """
    service = AttemptService(db)
    attempt, _record, result = service.submit_exercise(
        user, attempt_id, exercise_id, dict(submission.submitted_answer)
    )
    db.commit()
    if not result.is_correct and user.hearts <= 0:
        logger.info(
            "event=attempt_failed user_id=%s attempt_id=%s",
            user.id,
            attempt.id,
        )
    solution = "" if result.is_correct else str(result.correct_answer or "")
    return ExerciseSubmitResponse(
        is_correct=result.is_correct,
        solution_text=solution,
        hearts_remaining=service.heart_service.get_current_hearts(user),
        current_exercise_index=attempt.current_exercise_index,
        attempt_status=attempt.status,
    )


@router.post(
    "/lesson-attempts/{attempt_id}/complete",
    response_model=LessonCompleteResponse,
    summary="Complete a lesson attempt and award rewards",
    responses={
        404: {"model": ErrorResponse, "description": "Attempt not found"},
        409: {"model": ErrorResponse, "description": "Attempt failed or abandoned"},
    },
)
def complete_attempt(
    attempt_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LessonCompleteResponse:
    """Atomically complete the attempt.

    All rewards (XP ledger, cached XP, gems, skill progress, activity,
    streak, achievements) commit in one transaction. Idempotent: a
    duplicate call returns the stored completion result unchanged.
    """
    service = AttemptService(db)
    attempt, result = service.complete_attempt(user, attempt_id)
    db.commit()
    logger.info(
        "event=lesson_completed user_id=%s attempt_id=%s xp_awarded=%s streak=%s gems_awarded=%s",
        user.id,
        attempt.id,
        result["xp_awarded"],
        result["streak"],
        result["gems_awarded"],
    )
    return LessonCompleteResponse(**result)


@router.post(
    "/lesson-attempts/{attempt_id}/abandon",
    response_model=AttemptDetailResponse,
    summary="Abandon an in-progress attempt",
    responses={
        404: {"model": ErrorResponse, "description": "Attempt not found"},
        409: {"model": ErrorResponse, "description": "Attempt not IN_PROGRESS"},
    },
)
def abandon_attempt(
    attempt_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AttemptDetailResponse:
    """Abandon the attempt. Abandoned attempts cannot be resumed; the user
    must start a fresh attempt."""
    service = AttemptService(db)
    attempt = service.abandon_attempt(user, attempt_id)
    db.commit()
    history = service.get_attempt_history(attempt)
    return AttemptDetailResponse(
        attempt_id=attempt.id,
        lesson_id=attempt.lesson_id,
        status=attempt.status,
        current_exercise_index=attempt.current_exercise_index,
        hearts_remaining=service.hearts_remaining(user, attempt),
        hearts_lost=attempt.hearts_lost,
        submitted_exercises=[
            SubmittedExerciseHistory(
                exercise_id=record.exercise_id,
                is_correct=record.is_correct,
                attempt_number=record.attempt_number,
            )
            for record in history
        ],
        completion_result=None,
    )
