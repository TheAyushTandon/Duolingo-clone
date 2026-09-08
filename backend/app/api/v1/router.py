"""API v1 router aggregation.

All v1 routers are collected here; ``app.main`` mounts this single object
under both ``/api`` (frontend contract) and ``/api/v1`` (versioned
convention). Future breaking changes get a v2 package — never edits here.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.routers import (
    achievements,
    attempts,
    auth,
    courses,
    hearts,
    leaderboard,
    learning_path,
    lessons,
    profile,
)
from app.api.v1.routers import health as health_router

api_v1_router = APIRouter()

_PUBLIC_ROUTERS = (
    health_router.router,
    auth.router,
    learning_path.router,
    courses.router,
    lessons.router,
    attempts.router,
    profile.router,
    hearts.router,
    leaderboard.router,
    achievements.router,
)


def include_all(parent: APIRouter, include_dev: bool, dev_router=None) -> None:
    """Mount all v1 routers on ``parent`` (an app or prefix router)."""
    for router in _PUBLIC_ROUTERS:
        parent.include_router(router)
    if include_dev and dev_router is not None:
        parent.include_router(dev_router.router)
