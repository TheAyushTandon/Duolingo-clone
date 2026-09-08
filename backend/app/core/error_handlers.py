"""Centralized exception-to-HTTP mapping.

All API errors share one envelope:

    {"detail": {"code": "...", "message": "..."}, "request_id": "..."}

``detail`` keeps the FastAPI/Starlette convention so clients reading
``json.detail.message`` work unchanged. Internal details (stack traces,
SQL errors) go to logs only — never responses (audit §24-25).
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import get_settings
from app.core.exceptions import DomainError
from app.schemas.common import ErrorBody, ErrorResponse

logger = logging.getLogger("app.errors")


def _request_id(request: Request) -> str:
    return getattr(request.state, "request_id", None) or "-"


def _error_response(request: Request, status: int, code: str, message: str) -> JSONResponse:
    body = ErrorResponse(detail=ErrorBody(code=code, message=message))
    return JSONResponse(
        status_code=status,
        content={**body.model_dump(), "request_id": _request_id(request)},
    )


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainError)
    async def domain_error_handler(request: Request, exc: DomainError) -> JSONResponse:
        return _error_response(request, exc.http_status, exc.code, exc.message)

    @app.exception_handler(RequestValidationError)
    async def request_validation_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        # Compact the first pydantic error into a readable message.
        if exc.errors():
            first = exc.errors()[0]
            loc = ".".join(str(part) for part in first.get("loc", ()) if part != "body")
            msg = first.get("msg", "invalid request")
            message = f"{loc}: {msg}" if loc else msg
        else:
            message = "invalid request body"
        return _error_response(request, 422, "VALIDATION_ERROR", message)

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(request: Request, exc: IntegrityError) -> JSONResponse:
        # Constraint violations (e.g. duplicate register) — log the SQL
        # detail internally, return a generic conflict.
        logger.error(
            "event=integrity_error request_id=%s detail=%s",
            _request_id(request),
            exc.orig,
        )
        return _error_response(
            request,
            409,
            "CONFLICT",
            "The request conflicts with existing data.",
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        # Fastapi HTTPExceptions (e.g. auth 401s) carry plain-string details;
        # wrap them in the standard envelope.
        code = {
            400: "BAD_REQUEST",
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            405: "METHOD_NOT_ALLOWED",
            409: "CONFLICT",
        }.get(exc.status_code, "HTTP_ERROR")
        message = str(exc.detail)
        return _error_response(request, exc.status_code, code, message)

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        # Full stack trace to logs; generic 500 externally.
        logger.exception(
            "event=unhandled_error request_id=%s path=%s",
            _request_id(request),
            request.url.path,
        )
        if get_settings().is_production:
            message = "An unexpected error occurred."
        else:
            message = f"An unexpected error occurred: {exc}"
        return _error_response(request, 500, "INTERNAL_ERROR", message)
