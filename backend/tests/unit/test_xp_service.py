"""XPService unit tests: idempotency and cached aggregate updates."""

from __future__ import annotations

import pytest

from app.core.constants import XPReason
from app.core.exceptions import DuplicateXPError
from app.models.user import User
from app.services.xp_service import XPService


def _make_user() -> User:
    import datetime as dt

    return User(username=f"xp_test_{dt.datetime.now().timestamp()}", xp=0)


class TestAwardXP:
    def test_creates_transaction_and_updates_cache(self, db) -> None:
        user = _make_user()
        db.add(user)
        db.flush()

        XPService(db).award_xp(user, 15, XPReason.LESSON_COMPLETION, "LESSON_ATTEMPT", "a1")
        db.flush()

        assert user.xp == 15
        from sqlalchemy import select
        from app.models.gamification import XPTransaction

        rows = list(db.scalars(select(XPTransaction).where(XPTransaction.user_id == user.id)))
        assert len(rows) == 1
        assert rows[0].amount == 15

    def test_duplicate_prevented(self, db) -> None:
        user = _make_user()
        db.add(user)
        db.flush()

        service = XPService(db)
        service.award_xp(user, 15, XPReason.LESSON_COMPLETION, "LESSON_ATTEMPT", "a1")
        db.flush()

        with pytest.raises(DuplicateXPError):
            service.award_xp(user, 15, XPReason.LESSON_COMPLETION, "LESSON_ATTEMPT", "a1")

        # Cached XP reflects only one award.
        assert user.xp == 15

    def test_different_references_allowed(self, db) -> None:
        user = _make_user()
        db.add(user)
        db.flush()

        service = XPService(db)
        service.award_xp(user, 10, XPReason.LESSON_COMPLETION, "LESSON_ATTEMPT", "a1")
        service.award_xp(user, 10, XPReason.LESSON_COMPLETION, "LESSON_ATTEMPT", "a2")
        db.flush()
        assert user.xp == 20

    def test_non_positive_amount_rejected(self, db) -> None:
        user = _make_user()
        with pytest.raises(ValueError):
            XPService(db).award_xp(user, 0, XPReason.ADMIN)


class TestHasBeenAwarded:
    def test_flag(self, db) -> None:
        user = _make_user()
        db.add(user)
        db.flush()
        service = XPService(db)
        assert not service.has_been_awarded(user, XPReason.PRACTICE, "SESSION", "s1")
        service.award_xp(user, 5, XPReason.PRACTICE, "SESSION", "s1")
        db.flush()
        assert service.has_been_awarded(user, XPReason.PRACTICE, "SESSION", "s1")
