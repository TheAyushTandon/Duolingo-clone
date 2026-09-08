"""Leaderboard endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.gamification import LeaderboardUser
from app.services.leaderboard_service import LeaderboardService

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get(
    "",
    response_model=list[LeaderboardUser],
    summary="Weekly league leaderboard",
)
def get_leaderboard(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[LeaderboardUser]:
    """Seeded bot competitors plus the current user's live weekly XP,
    ranked descending. The user's row updates as they earn XP."""
    return LeaderboardService(db).get_weekly_leaderboard(user)
