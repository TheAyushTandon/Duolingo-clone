"""Shared ORM mixin columns.

Every model gets a UUID string primary key and timezone-aware UTC timestamps,
as required by the database conventions in the spec.
"""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, declared_attr, mapped_column

from app.core.database import Base


def utc_now() -> datetime:
    """Current timezone-aware UTC timestamp."""
    return datetime.now(UTC)


def new_uuid() -> str:
    """New UUID string primary key."""
    return str(uuid4())


class UUIDMixin:
    """UUID string primary key."""

    @declared_attr
    @classmethod
    def id(cls) -> Mapped[str]:
        return mapped_column(String, primary_key=True, default=new_uuid)


class TimestampMixin:
    """``created_at`` / ``updated_at`` in timezone-aware UTC."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )


class BaseModel(UUIDMixin, TimestampMixin, Base):
    """Base for all models: UUID PK + UTC timestamps.

    Subclasses MUST declare ``__tablename__`` explicitly (no derived names —
    silent pluralization bugs are worse than one extra line per model).
    """

    __abstract__ = True
