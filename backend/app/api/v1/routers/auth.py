"""Authentication endpoints: register, login, and current user identity.

Security properties:
- Passwords hashed with PBKDF2-HMAC-SHA256 (100k iterations, per-user salt).
- Tokens are HMAC-SHA256 signed with the configured secret and expire.
- Login failures return a generic 401 (no user-enumeration oracle).
- Rate limited to blunt brute-force attempts.
"""

from __future__ import annotations

import re

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.api.v1.routers.profile import build_user_profile
from app.core.auth_utils import create_access_token, hash_password, verify_password
from app.core.config import get_settings
from app.core.database import get_db
from app.core.exceptions import ConflictError, ValidationError
from app.core.logging import get_logger
from app.models.content import Course
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest
from app.schemas.user import UserProfile

router = APIRouter(tags=["Authentication"])

logger = get_logger(__name__)

_USERNAME_PATTERN = re.compile(r"^[a-z0-9_.@+-]{3,50}$")


def _register_user(payload: RegisterRequest, db: Session) -> AuthResponse:
    username = payload.username.strip().lower()

    if not _USERNAME_PATTERN.match(username):
        raise ValidationError(
            "Username must be 3-50 characters: letters, numbers, dots, underscores, or + - @ ."
        )

    existing = db.scalar(select(User).where(User.username == username))
    if existing is not None:
        raise ConflictError("That username is taken — try logging in instead.")

    default_course = db.scalar(select(Course).where(Course.code == "fr"))
    if default_course is None:
        default_course = db.scalar(select(Course))

    user = User(
        username=username,
        password_hash=hash_password(payload.password),
        active_course_id=default_course.id if default_course else None,
        xp=0,
        gems=100,
        hearts=get_settings().default_max_hearts,
        max_hearts=get_settings().default_max_hearts,
        streak=0,
        last_active_date=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    logger.info("event=user_registered user_id=%s", user.id)
    return AuthResponse(
        access_token=create_access_token(user.id),
        # OAuth token-type literal, not a credential.
        token_type="bearer",  # nosec B106
        user=build_user_profile(db, user),
    )


def _login_user(payload: LoginRequest, db: Session) -> AuthResponse:
    username = payload.username.strip().lower()
    user = db.scalar(select(User).where(User.username == username))

    # Same generic error for unknown user and wrong password: no oracle.
    if user is None or not verify_password(payload.password, user.password_hash):
        logger.info("event=login_failed username=%s", username)
        raise _invalid_credentials()

    logger.info("event=login_success user_id=%s", user.id)
    return AuthResponse(
        access_token=create_access_token(user.id),
        # OAuth token-type literal, not a credential.
        token_type="bearer",  # nosec B106
        user=build_user_profile(db, user),
    )


def _invalid_credentials() -> Exception:
    """Unauthorized error with a non-revealing message."""
    from fastapi import HTTPException, status

    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid username or password.",
    )


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=201,
    summary="Register a new learner with username and password",
    responses={
        400: {"description": "Invalid username"},
        409: {"description": "Username already taken"},
    },
)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    return _register_user(payload, db)


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Log in with existing username and password",
    responses={401: {"description": "Invalid credentials"}},
)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    return _login_user(payload, db)


@router.get(
    "/me",
    response_model=UserProfile,
    summary="Get profile of currently logged-in learner",
)
def get_me(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfile:
    return build_user_profile(db, user)
