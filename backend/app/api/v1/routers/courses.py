"""Course catalog endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.repositories.content_repository import ContentRepository
from app.schemas.learning_path import CourseSummary

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get(
    "",
    response_model=list[CourseSummary],
    summary="List active courses",
)
def list_courses(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[CourseSummary]:
    """All active courses with their narration locale."""
    return [
        CourseSummary(
            id=course.id,
            title=course.title,
            code=course.code,
            description=course.description,
            flag_icon=course.flag_icon,
            speech_locale=course.speech_locale,
        )
        for course in ContentRepository().get_active_courses(db)
    ]
