"""Heart endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import HeartsRefillResponse, HeartStatus
from app.services.heart_service import HeartService

router = APIRouter(prefix="/hearts", tags=["Hearts"])


@router.get("", response_model=HeartStatus, summary="Get heart state")
def get_hearts(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HeartStatus:
    """Current hearts with lazy regeneration applied; reports minutes until
    the next heart."""
    HeartService(db).regenerate_hearts(user)
    db.commit()
    status = HeartService(db).get_regeneration_status(user)
    return HeartStatus(**status)  # type: ignore[arg-type]


@router.post(
    "/refill",
    response_model=HeartsRefillResponse,
    summary="Refill all hearts (gems) or via practice (free)",
    responses={403: {"description": "Not enough gems"}},
)
def refill_hearts(
    is_practice: bool = Query(
        default=False,
        description="Free refill via a mocked practice session; false costs gems.",
    ),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HeartsRefillResponse:
    """Refill hearts to the maximum.

    Gem refill costs 350 gems; ``is_practice=true`` is free (mocked).
    """
    service = HeartService(db)
    hearts, gems = service.refill_hearts(user, is_practice=is_practice)
    db.commit()
    message = (
        "Hearts refilled through practice — free of charge!"
        if is_practice
        else "Hearts refilled with gems."
    )
    return HeartsRefillResponse(
        success=True,
        hearts=hearts,
        max_hearts=user.max_hearts,
        gems=gems,
        message=message,
    )
