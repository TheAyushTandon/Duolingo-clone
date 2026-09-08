"""HeartService unit tests: deduction, regeneration, caps, timestamps."""

from __future__ import annotations

import datetime as dt

from app.models.user import User
from app.services.heart_service import HeartService

INTERVAL_MINUTES = 30


def _make_user(hearts: int = 5, max_hearts: int = 5, updated_at: dt.datetime | None = None) -> User:
    return User(
        username=f"heart_test_{dt.datetime.now().timestamp()}",
        hearts=hearts,
        max_hearts=max_hearts,
        hearts_updated_at=updated_at or dt.datetime.now(dt.UTC),
    )


class TestDeductHeart:
    def test_deduct_reduces_count(self, db) -> None:
        user = _make_user(hearts=5)
        HeartService(db).deduct_heart(user)
        assert user.hearts == 4

    def test_cannot_go_negative(self, db) -> None:
        user = _make_user(hearts=0)
        from app.core.exceptions import InsufficientHeartsError

        try:
            HeartService(db).deduct_heart(user)
            raise AssertionError("expected InsufficientHeartsError")
        except InsufficientHeartsError:
            pass


class TestRegeneration:
    def test_no_elapse_changes_nothing(self, db) -> None:
        now = dt.datetime.now(dt.UTC)
        user = _make_user(hearts=3, updated_at=now)
        HeartService(db).regenerate_hearts(user, now=now + dt.timedelta(seconds=10))
        assert user.hearts == 3

    def test_full_interval_restores_one(self, db) -> None:
        now = dt.datetime.now(dt.UTC)
        user = _make_user(hearts=3, updated_at=now)
        HeartService(db).regenerate_hearts(
            user, now=now + dt.timedelta(minutes=INTERVAL_MINUTES, seconds=1)
        )
        assert user.hearts == 4

    def test_capped_at_max(self, db) -> None:
        now = dt.datetime.now(dt.UTC)
        user = _make_user(hearts=1, updated_at=now)
        HeartService(db).regenerate_hearts(user, now=now + dt.timedelta(hours=10))
        assert user.hearts == user.max_hearts

    def test_partial_progress_preserved(self, db) -> None:
        """Elapsed 1.5 intervals -> one heart, timestamp carries the half."""
        now = dt.datetime.now(dt.UTC)
        user = _make_user(hearts=3, updated_at=now)
        elapsed = dt.timedelta(minutes=INTERVAL_MINUTES * 1.5)
        HeartService(db).regenerate_hearts(user, now=now + elapsed)
        assert user.hearts == 4
        # The reference moved exactly one interval forward.
        assert user.hearts_updated_at == now + dt.timedelta(minutes=INTERVAL_MINUTES)

    def test_timestamp_reset_when_full(self, db) -> None:
        """At max hearts the clock resets so no phantom credit accumulates."""
        now = dt.datetime.now(dt.UTC)
        user = _make_user(hearts=5, updated_at=now - dt.timedelta(hours=5))
        HeartService(db).regenerate_hearts(user, now=now)
        assert user.hearts == 5
        assert user.hearts_updated_at == now

    def test_only_whole_intervals_count(self, db) -> None:
        now = dt.datetime.now(dt.UTC)
        user = _make_user(hearts=2, updated_at=now)
        HeartService(db).regenerate_hearts(
            user, now=now + dt.timedelta(minutes=INTERVAL_MINUTES - 1)
        )
        assert user.hearts == 2


class TestRefill:
    def test_refill_with_gems_costs_350(self, db) -> None:
        user = _make_user(hearts=0)
        user.gems = 400
        hearts, gems = HeartService(db).refill_hearts(user)
        assert hearts == user.max_hearts
        assert gems == 400 - 350

    def test_refill_without_gems_rejected(self, db) -> None:
        from app.core.exceptions import InsufficientGemsError

        user = _make_user(hearts=0)
        user.gems = 100
        try:
            HeartService(db).refill_hearts(user)
            raise AssertionError("expected InsufficientGemsError")
        except InsufficientGemsError:
            pass
        assert user.hearts == 0  # unchanged

    def test_practice_refill_is_free(self, db) -> None:
        user = _make_user(hearts=0)
        user.gems = 0
        hearts, gems = HeartService(db).refill_hearts(user, is_practice=True)
        assert hearts == user.max_hearts
        assert gems == 0


class TestRegenerationStatus:
    def test_status_full(self, db) -> None:
        user = _make_user(hearts=5)
        status = HeartService(db).get_regeneration_status(user)
        assert status["full"] is True
        assert status["next_heart_in_minutes"] is None

    def test_status_partial(self, db) -> None:
        now = dt.datetime.now(dt.UTC)
        user = _make_user(hearts=3, updated_at=now)
        status = HeartService(db).get_regeneration_status(user)
        assert status["full"] is False
        assert status["next_heart_in_minutes"] is not None
        assert 0 <= status["next_heart_in_minutes"] <= INTERVAL_MINUTES
