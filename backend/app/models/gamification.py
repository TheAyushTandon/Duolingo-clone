"""Gamification models: XP transactions and daily user activity."""

from __future__ import annotations

from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.constants import XPReason
from app.models.base import BaseModel


class XPTransaction(BaseModel):
    __tablename__ = "xp_transactions"
    __table_args__ = (
        # Idempotency guard: the same reward can never be recorded twice.
        UniqueConstraint(
            "user_id",
            "reason",
            "reference_type",
            "reference_id",
            name="uq_xp_transaction_idempotent",
        ),
    )

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[XPReason] = mapped_column(String(32), nullable=False)
    reference_type: Mapped[str | None] = mapped_column(String(32), nullable=True)
    reference_id: Mapped[str | None] = mapped_column(String(64), nullable=True)

    @property
    def occurred_on(self) -> date:
        """Calendar date (UTC) of the transaction, for weekly aggregation."""
        return self.created_at.date()


class UserActivity(BaseModel):
    __tablename__ = "user_activity"
    __table_args__ = (UniqueConstraint("user_id", "activity_date", name="uq_user_activity_daily"),)

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    activity_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    xp_earned: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    lessons_completed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
