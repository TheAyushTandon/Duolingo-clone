"""Heart management with lazy regeneration.

No background job: every access first replays elapsed time since
``hearts_updated_at`` and persists the restored hearts. When hearts reach
the maximum the timestamp is reset to "now" so credit does not accumulate.
"""

from __future__ import annotations

import datetime as dt

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import InsufficientGemsError, InsufficientHeartsError
from app.models.base import utc_now
from app.models.user import User


class HeartService:
    def __init__(self, db: Session) -> None:
        self.db = db

    # ------------------------------------------------------- regeneration ---

    def _regeneration_interval_seconds(self) -> int:
        return get_settings().heart_regeneration_minutes * 60

    def regenerate_hearts(self, user: User, now: dt.datetime | None = None) -> User:
        """Persist any hearts earned since ``hearts_updated_at``.

        Idempotent: calling with no elapsed time changes nothing. When the
        user is already full the timestamp is refreshed so that future
        regeneration starts from "now" rather than accumulating phantom
        intervals.
        """
        now = now or utc_now()
        reference = user.hearts_updated_at
        if reference is None:
            user.hearts_updated_at = now
            return user

        if reference.tzinfo is None:
            reference = reference.replace(tzinfo=dt.UTC)

        if user.hearts >= user.max_hearts:
            # Full: reset the clock so no regeneration credit accumulates.
            if reference != now:
                user.hearts_updated_at = now
            return user

        elapsed_seconds = (now - reference).total_seconds()
        interval = self._regeneration_interval_seconds()
        restored = int(elapsed_seconds // interval) if interval > 0 else 0

        if restored <= 0:
            # Partial progress toward the next heart is preserved by keeping
            # the original timestamp; do not touch it.
            return user

        new_hearts = min(user.max_hearts, user.hearts + restored)
        hearts_gained = new_hearts - user.hearts
        user.hearts = new_hearts
        if user.hearts >= user.max_hearts:
            user.hearts_updated_at = now
        else:
            # Advance the reference only by whole intervals consumed, keeping
            # partial progress toward the next heart intact.
            consumed = dt.timedelta(seconds=hearts_gained * interval)
            user.hearts_updated_at = reference + consumed
        return user

    # ------------------------------------------------------------ queries ---

    def get_current_hearts(self, user: User) -> int:
        self.regenerate_hearts(user)
        return user.hearts

    def get_regeneration_status(self, user: User) -> dict[str, int | bool | None]:
        """Heart counts plus minutes until the next heart regenerates."""
        self.regenerate_hearts(user)
        minutes_to_next: int | None = None
        if user.hearts < user.max_hearts:
            reference = user.hearts_updated_at
            if reference is not None:
                if reference.tzinfo is None:
                    reference = reference.replace(tzinfo=dt.UTC)
                elapsed = (utc_now() - reference).total_seconds()
                interval = self._regeneration_interval_seconds()
                remaining = max(0.0, interval - (elapsed % interval if interval > 0 else 0))
                minutes_to_next = max(0, int(remaining // 60))
        return {
            "hearts": user.hearts,
            "max_hearts": user.max_hearts,
            "missing_hearts": user.max_hearts - user.hearts,
            "next_heart_in_minutes": minutes_to_next,
            "full": user.hearts >= user.max_hearts,
        }

    # ----------------------------------------------------------- mutations ---

    def deduct_heart(self, user: User) -> int:
        """Deduct one heart. Raises when the user has none left.

        Returns the hearts remaining after the deduction.
        """
        self.regenerate_hearts(user)
        if user.hearts <= 0:
            raise InsufficientHeartsError("No hearts remaining.")
        user.hearts -= 1
        # Fix the regeneration clock at the moment of loss so a full heart
        # takes a full interval from now.
        if user.hearts == user.max_hearts - 1:
            user.hearts_updated_at = utc_now()
        return user.hearts

    def refill_hearts(self, user: User, is_practice: bool = False) -> tuple[int, int]:
        """Refill all hearts. Returns (hearts, gems_remaining).

        Gem refill costs ``heart_refill_gem_cost`` (350); the practice
        variant is free (mocked practice session).
        """
        if not is_practice:
            cost = get_settings().heart_refill_gem_cost
            if user.gems < cost:
                raise InsufficientGemsError(f"Refill costs {cost} gems (you have {user.gems}).")
            user.gems -= cost
        user.hearts = user.max_hearts
        user.hearts_updated_at = utc_now()
        return user.hearts, user.gems
