"""Leaderboard bot data access."""

from __future__ import annotations

import datetime as dt

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.leaderboard import LeaderboardEntry


class LeaderboardRepository:
    def get_bot_entries_for_week(self, db: Session, week_start: dt.date) -> list[LeaderboardEntry]:
        stmt = select(LeaderboardEntry).where(LeaderboardEntry.week_start == week_start)
        return list(db.scalars(stmt))
