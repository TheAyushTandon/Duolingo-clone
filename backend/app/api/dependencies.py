"""Shared FastAPI dependencies.

``get_current_user`` is the single auth seam: every route resolves the
acting user through it. Today it returns the seeded demo user; swapping in
JWT/session auth later means changing only this function.
"""

from __future__ import annotations

from fastapi import Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth_utils import decode_access_token
from app.core.database import get_db
from app.models.user import User


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    """Resolve acting user through the Bearer token in the Authorization header."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()
        user_id = decode_access_token(token)
        if user_id:
            user = db.get(User, user_id)
            if user is not None:
                return user
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or session revoked.",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token.",
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required. Please log in.",
    )


def pagination_params(
    limit: int | None = Query(default=None, ge=1, le=100, description="Page size"),
    cursor: str | None = Query(default=None, description="Opaque cursor from a prior page"),
) -> dict[str, int | str | None]:
    return {"limit": limit, "cursor": cursor}
