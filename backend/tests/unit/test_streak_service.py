"""StreakService unit tests: day transitions and boundaries."""

from __future__ import annotations

import datetime as dt

from app.models.user import User
from app.services.streak_service import StreakService
from app.utils.dates import today_utc


def _make_user(streak: int, last_active: dt.date | None) -> User:
    return User(
        username=f"streak_test_{dt.datetime.now().timestamp()}",
        streak=streak,
        last_active_date=last_active,
    )


class TestRecordDailyActivity:
    def test_first_activity_sets_streak_one(self, db) -> None:
        user = _make_user(0, None)
        assert StreakService(db).record_daily_activity(user) == 1
        assert user.last_active_date == today_utc()

    def test_consecutive_day_increments(self, db) -> None:
        user = _make_user(3, today_utc() - dt.timedelta(days=1))
        assert StreakService(db).record_daily_activity(user) == 4

    def test_same_day_no_increment(self, db) -> None:
        user = _make_user(5, today_utc())
        assert StreakService(db).record_daily_activity(user) == 5

    def test_gap_resets_to_one(self, db) -> None:
        for gap in (2, 5, 30):
            user = _make_user(10, today_utc() - dt.timedelta(days=gap))
            assert StreakService(db).record_daily_activity(user) == 1, f"gap={gap}"


class TestCalculateStreak:
    def test_projection_no_mutation(self, db) -> None:
        user = _make_user(3, today_utc() - dt.timedelta(days=1))
        assert StreakService(db).calculate_streak(user) == 4
        assert user.streak == 3  # unchanged


class TestStreakStatus:
    def test_at_risk_after_gap(self, db) -> None:
        user = _make_user(4, today_utc() - dt.timedelta(days=2))
        status = StreakService(db).get_streak_status(user)
        assert status["at_risk"] is True
        assert status["active_today"] is False

    def test_not_at_risk_when_yesterday(self, db) -> None:
        user = _make_user(4, today_utc() - dt.timedelta(days=1))
        status = StreakService(db).get_streak_status(user)
        assert status["at_risk"] is False
