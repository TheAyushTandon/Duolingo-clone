"""Shared response schemas: error envelope and cursor pagination wrapper."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ErrorBody(BaseModel):
    code: str = Field(examples=["ATTEMPT_NOT_IN_PROGRESS"])
    message: str = Field(examples=["This attempt is not in progress."])


class ErrorResponse(BaseModel):
    """FastAPI-style envelope: errors live under ``detail`` so clients using
    ``json.detail?.message`` (the frontend's handler) find them. A
    ``request_id`` field is attached by the error handlers."""

    detail: ErrorBody
    request_id: str | None = None


class PaginatedResponse[ItemT](BaseModel):
    """Cursor pagination envelope. ``next_cursor`` is null when exhausted."""

    items: list[ItemT]
    next_cursor: str | None = Field(
        default=None, description="Opaque cursor for the next page; null when done."
    )
