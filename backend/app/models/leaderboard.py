"""Bot leaderboard entries.

Bot weekly XP is seeded and static; the real user's weekly XP is derived
from ``xp_transactions`` at request time (see LeaderboardService).
"""

from __future__ import annotations

import datetime as dt

from sqlalchemy import Boolean, Date, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class LeaderboardEntry(BaseModel):
    __tablename__ = "leaderboard_entries"

    display_name: Mapped[str] = mapped_column(String(64), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    league: Mapped[str] = mapped_column(String(32), nullable=False, default="Bronze")
    weekly_xp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    week_start: Mapped[dt.date] = mapped_column(Date, nullable=False, index=True)
    is_bot: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
