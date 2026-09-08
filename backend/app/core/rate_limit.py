"""Application-level rate limiting (audit §11, §35).

slowapi in-memory limiter, per-IP (user-based once sessions carry identity
everywhere). Limits are configurable and can be disabled for development.
Routes opt in via ``@limiter.limit(...)`` decorators; a shared middleware
applies the general limit to everything else.

Policies (defaults):
- general:    every /api route          100/minute
- submission: exercise submit           30/minute
- completion: attempt complete          10/minute
- auth:       login/register            20/minute
- dev:        dev-only endpoints        20/minute
"""

from __future__ import annotations

from fastapi import FastAPI
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.config import get_settings

limiter = Limiter(key_func=get_remote_address)


async def _rate_limit_exceeded_handler(request: Request, exc: Exception) -> JSONResponse:
    """Standard error envelope for 429 responses."""
    request_id = getattr(request.state, "request_id", "-")
    return JSONResponse(
        status_code=429,
        content={
            "detail": {
                "code": "RATE_LIMITED",
                "message": "Too many requests — slow down and try again shortly.",
            },
            "request_id": request_id,
        },
    )


def configure_rate_limiting(app: FastAPI) -> None:
    """Attach the limiter, 429 handler, and middleware to the app."""
    settings = get_settings()
    app.state.limiter = limiter

    limiter.enabled = settings.rate_limit_enabled
    limiter.reset()

    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]
    app.add_middleware(SlowAPIMiddleware)


def submission_limit() -> str:
    return get_settings().rate_limit_submission


def completion_limit() -> str:
    return get_settings().rate_limit_completion


def auth_limit() -> str:
    return get_settings().rate_limit_auth


def dev_limit() -> str:
    return get_settings().rate_limit_dev
