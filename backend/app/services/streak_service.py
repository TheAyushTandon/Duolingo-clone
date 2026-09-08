"""Streak calculation.

All day math goes through ``app.utils.dates`` so streak boundaries are
defined in exactly one place. Dates (not timestamps) are compared.
"""

from __future__ import annotations

import datetime as dt

from sqlalchemy.orm import Session

from app.models.user import User
from app.utils.dates import is_consecutive_day, is_same_day, today_utc


class StreakService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def calculate_streak(self, user: User, today: dt.date | None = None) -> int:
        """Streak the user would have if active ``today`` (no mutation)."""
        today = today or today_utc()
        if user.last_active_date is None:
            return 1
        if is_same_day(user.last_active_date, today):
            return user.streak
        if is_consecutive_day(user.last_active_date, today):
            return user.streak + 1
        return 1

    def record_daily_activity(self, user: User) -> int:
        """Update the user's streak for activity today. Returns the streak.

        Rules:
        * active already today -> no change
        * last active yesterday -> streak + 1
        * last active older -> streak resets to 1
        * first ever activity -> streak = 1
        """
        today = today_utc()
        if user.last_active_date is None:
            user.streak = 1
            user.last_active_date = today
        elif is_same_day(user.last_active_date, today):
            pass  # Already recorded today.
        elif is_consecutive_day(user.last_active_date, today):
            user.streak += 1
            user.last_active_date = today
        else:
            user.streak = 1
            user.last_active_date = today
        return user.streak

    def get_streak_status(self, user: User) -> dict[str, int | bool]:
        today = today_utc()
        active_today = user.last_active_date is not None and is_same_day(
            user.last_active_date, today
        )
        return {
            "streak": user.streak,
            "active_today": active_today,
            "at_risk": user.last_active_date is not None
            and not active_today
            and not (is_consecutive_day(user.last_active_date, today)),
        }
