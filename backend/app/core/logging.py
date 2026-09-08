"""Centralized logging configuration.

Structured ``key=value`` events for important lifecycle actions (audit §22);
stdlib logging with a uniform formatter — no third-party dependency needed
at this scale. Request IDs are attached to records via a contextvar filter
(see ``middleware.py``).
"""

from __future__ import annotations

import logging
from contextvars import ContextVar

from app.core.config import get_settings

# Correlation ID for the current request; set by middleware, read by the
# log filter so every line is attributable to a request.
request_id_var: ContextVar[str | None] = ContextVar("request_id", default=None)


class _RequestIdFilter(logging.Filter):
    """Inject the current request correlation ID into each record."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_var.get() or "-"
        return True


_FORMAT = "%(asctime)s %(levelname)s %(name)s [request_id=%(request_id)s] %(message)s"


def configure_logging() -> None:
    """Root logging setup from settings; call once at startup."""
    level = get_settings().log_level.upper()
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(_FORMAT))
    handler.addFilter(_RequestIdFilter())

    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(level)

    # Quiet noisy third-party loggers to WARNING.
    for noisy in ("uvicorn.access",):
        logging.getLogger(noisy).setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Module logger with the request-ID filter attached."""
    logger = logging.getLogger(name)
    if not any(isinstance(f, _RequestIdFilter) for f in logger.filters):
        logger.addFilter(_RequestIdFilter())
    return logger
