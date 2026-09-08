"""User model.

``xp`` is a cached aggregate for fast reads; ``xp_transactions`` is the source
of truth for XP history.
"""

from __future__ import annotations

from datetime import UTC, date, datetime

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("hearts >= 0", name="ck_users_hearts_non_negative"),
        CheckConstraint("hearts <= max_hearts", name="ck_users_hearts_lte_max"),
        CheckConstraint("xp >= 0", name="ck_users_xp_non_negative"),
        CheckConstraint("streak >= 0", name="ck_users_streak_non_negative"),
        CheckConstraint("gems >= 0", name="ck_users_gems_non_negative"),
    )

    username: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # The course the learner is currently studying (drives the default
    # learning path). Nullable: falls back to the first active course.
    active_course_id: Mapped[str | None] = mapped_column(
        ForeignKey("courses.id", ondelete="SET NULL"), nullable=True
    )

    xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    gems: Mapped[int] = mapped_column(Integer, default=100, nullable=False)

    hearts: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    max_hearts: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    hearts_updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_active_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Daily XP goal (Duolingo-style: 50 XP / "Casual" default).
    daily_goal_xp: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
