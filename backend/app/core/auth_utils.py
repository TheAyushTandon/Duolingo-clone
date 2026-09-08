"""Lightweight authentication utilities.

Uses Python's standard library hashlib/hmac for robust password hashing and
tamper-proof signed session tokens without requiring external C libraries.
"""

from __future__ import annotations

import hashlib
import hmac
import secrets
import time

from app.core.config import get_settings

TOKEN_EXPIRATION_SECONDS = 30 * 24 * 60 * 60  # 30 days
_PBKDF2_ITERATIONS = 100_000


def _get_secret_key() -> bytes:
    """Signing key from settings (required to be a real secret in prod)."""
    return get_settings().secret_key.encode("utf-8")


def hash_password(password: str) -> str:
    """Generate a salted PBKDF2-HMAC-SHA256 password hash."""
    salt = secrets.token_bytes(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, _PBKDF2_ITERATIONS)
    return f"{salt.hex()}${key.hex()}"


def verify_password(password: str, stored_hash: str | None) -> bool:
    """Verify a plain-text password against a stored salted hash."""
    if not stored_hash or "$" not in stored_hash:
        return False
    try:
        salt_hex, key_hex = stored_hash.split("$", 1)
        salt = bytes.fromhex(salt_hex)
        expected_key = bytes.fromhex(key_hex)
        calculated_key = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), salt, _PBKDF2_ITERATIONS
        )
    except (ValueError, TypeError):
        # Malformed stored hash — fail closed, never raise.
        return False
    return hmac.compare_digest(expected_key, calculated_key)


def create_access_token(user_id: str) -> str:
    """Create a tamper-evident signed bearer token with user_id and expiration."""
    timestamp = int(time.time())
    message = f"{user_id}:{timestamp}".encode()
    sig = hmac.new(_get_secret_key(), message, hashlib.sha256).hexdigest()
    return f"{user_id}:{timestamp}:{sig}"


def decode_access_token(token: str) -> str | None:
    """Validate signature and expiration; return user_id if valid, else None."""
    parts = token.split(":")
    if len(parts) != 3:
        return None
    user_id, ts_str, sig = parts
    try:
        timestamp = int(ts_str)
    except ValueError:
        return None

    # Check expiration
    now = int(time.time())
    if now - timestamp > TOKEN_EXPIRATION_SECONDS:
        return None

    # Check signature
    message = f"{user_id}:{ts_str}".encode()
    expected_sig = hmac.new(_get_secret_key(), message, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, expected_sig):
        return None

    return user_id
