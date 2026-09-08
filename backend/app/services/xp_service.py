"""XP awarding with idempotency.

Every award is keyed by (user, reason, reference_type, reference_id) — a
database unique constraint plus an explicit pre-check. ``users.xp`` is a
cached aggregate updated in the same transaction as the ledger insert.
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.constants import XPReason
from app.core.exceptions import DuplicateXPError
from app.models.gamification import XPTransaction
from app.models.user import User
from app.repositories.progress_repository import ProgressRepository


class XPService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.progress_repo = ProgressRepository()

    def award_xp(
        self,
        user: User,
        amount: int,
        reason: XPReason,
        reference_type: str | None = None,
        reference_id: str | None = None,
    ) -> XPTransaction:
        """Record an XP transaction and bump the cached user XP.

        Raises:
            DuplicateXPError: an identical (reason, reference) transaction
                already exists — the reward must not be granted twice.
        """
        if amount <= 0:
            raise ValueError("XP amount must be positive.")

        existing = self.progress_repo.get_xp_transaction_by_reference(
            self.db, user.id, reason.value, reference_type, reference_id
        )
        if existing is not None:
            raise DuplicateXPError(
                f"XP for {reason.value}/{reference_type}/{reference_id} already awarded."
            )

        transaction = XPTransaction(
            user_id=user.id,
            amount=amount,
            reason=reason,
            reference_type=reference_type,
            reference_id=reference_id,
        )
        self.progress_repo.add_xp_transaction(self.db, transaction)
        user.xp += amount
        return transaction

    def has_been_awarded(
        self,
        user: User,
        reason: XPReason,
        reference_type: str | None,
        reference_id: str | None,
    ) -> bool:
        return (
            self.progress_repo.get_xp_transaction_by_reference(
                self.db, user.id, reason.value, reference_type, reference_id
            )
            is not None
        )
