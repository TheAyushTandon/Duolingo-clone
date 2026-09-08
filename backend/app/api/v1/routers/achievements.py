"""Achievements endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.repositories.progress_repository import ProgressRepository
from app.schemas.achievement import AchievementOut

router = APIRouter(prefix="/achievements", tags=["Achievements"])


@router.get("", response_model=list[AchievementOut], summary="List achievements")
def get_achievements(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[AchievementOut]:
    """All achievements with the current user's unlock state."""
    repo = ProgressRepository()
    unlocked = repo.get_unlocked_achievements(db, user.id)
    return [
        AchievementOut(
            id=achievement.id,
            name=achievement.name,
            description=achievement.description,
            icon=achievement.icon,
            xp_reward=achievement.xp_reward,
            is_unlocked=achievement.id in unlocked,
            unlocked_at=(
                unlocked[achievement.id].unlocked_at if achievement.id in unlocked else None
            ),
        )
        for achievement in repo.get_achievements(db)
    ]
