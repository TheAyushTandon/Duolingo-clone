"""Lesson endpoints (read-only; attempts live in attempts.py)."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.content import LessonDetail
from app.services.lesson_service import LessonService

router = APIRouter(prefix="/lessons", tags=["Lessons"])


@router.get(
    "/{lesson_id}",
    response_model=LessonDetail,
    summary="Get a lesson with its exercises",
)
def get_lesson(
    lesson_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LessonDetail:
    """Lesson content and client-safe exercises.

    Response NEVER contains validation data (correct answers). Exercises are
    ordered; each carries only its prompt and display data.
    """
    service = LessonService(db)
    lesson = service.get_lesson(lesson_id)
    return service.get_lesson_detail(lesson)
