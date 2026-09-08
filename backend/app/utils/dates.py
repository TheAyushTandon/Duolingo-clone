"""Single source of truth for date math.

All day comparisons (streaks, daily activity, weekly leaderboards) convert
timestamps to UTC calendar dates here, so no service implements its own
day-boundary logic.
"""

from __future__ import annotations

import datetime as dt


def today_utc() -> dt.date:
    """Current calendar date. Uses local date so user activity and streaks align with local time."""
    return dt.date.today()


def to_utc_date(timestamp: dt.datetime) -> dt.date:
    """Convert a (possibly naive) datetime to a UTC calendar date."""
    if timestamp.tzinfo is None:
        return timestamp.replace(tzinfo=dt.UTC).date()
    return timestamp.astimezone(dt.UTC).date()


def days_between(from_date: dt.date, to_date: dt.date) -> int:
    """Whole-day difference ``to_date - from_date`` (negative if from > to)."""
    return (to_date - from_date).days


def is_consecutive_day(previous: dt.date, current: dt.date) -> bool:
    """True when ``current`` is exactly one day after ``previous``."""
    return days_between(previous, current) == 1


def is_same_day(a: dt.date, b: dt.date) -> bool:
    return a == b


def add_days(date: dt.date, days: int) -> dt.date:
    return date + dt.timedelta(days=days)


def week_start(date: dt.date) -> dt.date:
    """Monday of the ISO week containing ``date`` (UTC)."""
    return date - dt.timedelta(days=date.weekday())
