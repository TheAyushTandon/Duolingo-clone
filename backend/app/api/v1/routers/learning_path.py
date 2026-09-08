"""Learning path endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.learning_path import LearningPathResponse
from app.services.learning_path_service import LearningPathService

router = APIRouter(prefix="/learning-path", tags=["Learning Path"])


@router.get(
    "",
    response_model=LearningPathResponse,
    summary="Get the user's learning path",
    response_description="Course units, skills, and server-resolved unlock states.",
)
def get_learning_path(
    course_id: str | None = Query(
        default=None, description="Course id; defaults to the user's active course."
    ),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LearningPathResponse:
    """Aggregated course -> units -> skills with LOCKED / AVAILABLE /
    IN_PROGRESS / COMPLETED states resolved server-side."""
    return LearningPathService(db).get_learning_path(user, course_id)
