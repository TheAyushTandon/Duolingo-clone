"""Reusable cursor pagination.

Cursors are opaque: the encoded ``last <sort key>`` of the final row of a
page. This module only builds/decodes cursors; queries themselves live in
repositories. Keyset pagination avoids the cost and drift of OFFSET for
growing histories.
"""

from __future__ import annotations

import base64

from pydantic import BaseModel

MAX_LIMIT = 100
DEFAULT_LIMIT = 20


class PageParams(BaseModel):
    limit: int = DEFAULT_LIMIT
    cursor: str | None = None


def clamp_limit(limit: int | None) -> int:
    if limit is None or limit < 1:
        return DEFAULT_LIMIT
    return min(limit, MAX_LIMIT)


def encode_cursor(sort_key: str) -> str:
    """Encode a sort key into an opaque cursor string."""
    return base64.urlsafe_b64encode(sort_key.encode("utf-8")).decode("ascii")


def decode_cursor(cursor: str) -> str | None:
    """Decode a cursor back to its sort key. Returns None if malformed."""
    try:
        return base64.urlsafe_b64decode(cursor.encode("ascii")).decode("utf-8")
    except (ValueError, UnicodeDecodeError):
        return None


def next_cursor_for(has_more: bool, last_sort_key: str | None) -> str | None:
    """Build the next-page cursor, or None when the page is exhausted."""
    if not has_more or last_sort_key is None:
        return None
    return encode_cursor(last_sort_key)
