"""Per-user skill progress model."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class UserSkillProgress(BaseModel):
    __tablename__ = "user_skill_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", name="uq_user_skill_progress"),
        CheckConstraint("level >= 1", name="ck_usp_level_min"),
        CheckConstraint(
            "progress_percentage >= 0 AND progress_percentage <= 100",
            name="ck_usp_progress_range",
        ),
    )

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    skill_id: Mapped[str] = mapped_column(
        ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False
    )
    level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    progress_percentage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
