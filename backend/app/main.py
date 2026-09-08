"""FastAPI application factory.

Routers are mounted under both ``/api`` (used by the Next.js frontend) and
``/api/v1`` (the versioned convention). Startup validates configuration and
fails fast on insecure production settings (audit §45).
"""

from __future__ import annotations

import sys

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import include_all
from app.api.v1.routers import dev as dev_router
from app.core.config import DEV, get_settings
from app.core.error_handlers import register_error_handlers
from app.core.logging import configure_logging, get_logger
from app.core.rate_limit import configure_rate_limiting
from app.core.security import RequestLoggingMiddleware

API_PREFIXES = ("/api", "/api/v1")

_DEV_CORS_ORIGINS = (
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
)


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging()
    logger = get_logger(__name__)

    # Fail early on insecure configuration (audit §45).
    problems = settings.validate_for_startup()
    if problems:
        for problem in problems:
            logger.error("event=startup_config_invalid problem=%s", problem)
        if settings.is_production:
            sys.exit(1)

    app = FastAPI(
        title=settings.app_name,
        version="1.1.0",
        description=(
            "Backend for a Duolingo-inspired language learning platform.\n\n"
            "**Backend is authoritative**: answer correctness, XP, gems, hearts, "
            "streaks, unlock states, and achievements are all computed and "
            "persisted server-side. This API is the contract consumed by the "
            "Next.js frontend (`frontend/src/types/index.ts`)."
        ),
        # Swagger stays enabled in production deliberately: the API is
        # read-only documentation and protected by CORS + rate limits.
        docs_url="/docs" if (settings.debug or not settings.is_production) else None,
    )

    # CORS: explicit origins only. Development defaults are local hosts;
    # production requires CORS_ORIGINS (validated above).
    origins = settings.cors_origin_list or (
        list(_DEV_CORS_ORIGINS) if settings.environment == DEV else []
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    )

    # Security headers + request correlation IDs.
    app.add_middleware(RequestLoggingMiddleware)

    register_error_handlers(app)
    configure_rate_limiting(app)

    for prefix in API_PREFIXES:
        prefix_router = APIRouter()
        include_all(
            prefix_router,
            include_dev=settings.enable_dev_tools,
            dev_router=dev_router,
        )
        app.include_router(prefix_router, prefix=prefix)

    logger.info(
        "event=app_started environment=%s rate_limiting=%s dev_tools=%s",
        settings.environment,
        settings.rate_limit_enabled,
        settings.enable_dev_tools,
    )
    return app


app = create_app()
