"""Health and readiness endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.database import get_db

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    status: str


class ReadinessResponse(BaseModel):
    status: str
    database: str


@router.get("/health", response_model=HealthResponse, summary="Liveness check")
def health() -> HealthResponse:
    """Liveness probe: the process is up. No infrastructure details."""
    return HealthResponse(status="healthy")


@router.get("/health/ready", response_model=ReadinessResponse, summary="Readiness check")
def readiness(db: Session = Depends(get_db)) -> ReadinessResponse:
    """Readiness probe: verifies database connectivity only."""
    db.execute(text("SELECT 1"))
    return ReadinessResponse(status="ready", database="connected")
