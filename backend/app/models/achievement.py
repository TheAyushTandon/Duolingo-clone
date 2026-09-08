"""Achievement models: definitions and per-user unlocks."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import (
    JSON,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class Achievement(BaseModel):
    __tablename__ = "achievements"

    name: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon: Mapped[str | None] = mapped_column(String(64), nullable=True)
    # {"type": "TOTAL_XP", "value": 100}
    criteria: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    xp_reward: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class UserAchievement(BaseModel):
    __tablename__ = "user_achievements"
    __table_args__ = (
        # An achievement can only be unlocked once per user.
        UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),
    )

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    achievement_id: Mapped[str] = mapped_column(
        ForeignKey("achievements.id", ondelete="CASCADE"), index=True, nullable=False
    )
    unlocked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
