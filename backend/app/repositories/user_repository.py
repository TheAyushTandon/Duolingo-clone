"""User data access."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import NotFoundError
from app.models.user import User


class UserRepository:
    def get_by_id(self, db: Session, user_id: str) -> User | None:
        return db.get(User, user_id)

    def get_by_username(self, db: Session, username: str) -> User | None:
        stmt = select(User).where(User.username == username)
        return db.scalar(stmt)

    def get_demo_user(self, db: Session) -> User:
        """Placeholder identity for the get_current_user dependency."""
        username = get_settings().demo_username
        user = self.get_by_username(db, username)
        if user is None:
            raise NotFoundError(
                "Demo user",
                f"'{username}' not found — run the seed script (python -m app.seed.seed_database).",
            )
        return user

    def save(self, db: Session, user: User) -> User:
        db.add(user)
        return user
