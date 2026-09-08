"""Security middleware: response headers and request correlation IDs.

Headers (audit §12):
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: minimal defaults
CSP is deliberately left to the reverse-proxy/frontend layer.

Correlation (audit §23): every request gets an X-Request-ID (accepted from
the client if present, generated otherwise); it flows into logs via
``logging.request_id_var`` and onto every response.
"""

from __future__ import annotations

import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import request_id_var

_REQUEST_ID_HEADER = "X-Request-ID"

_SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
}

_request_logger = logging.getLogger("app.request")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Assign a correlation ID, log the request line, add security headers.

    Also strips the ``Server`` header so no framework version leaks.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = request.headers.get(_REQUEST_ID_HEADER) or uuid.uuid4().hex[:12]
        request_id_var.set(request_id)
        request.state.request_id = request_id

        start = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            duration_ms = (time.perf_counter() - start) * 1000
            _request_logger.error(
                "event=http_request request_id=%s method=%s path=%s status=500 duration_ms=%.1f",
                request_id,
                request.method,
                request.url.path,
                duration_ms,
            )
            request_id_var.set(None)
            raise

        duration_ms = (time.perf_counter() - start) * 1000
        _request_logger.info(
            "event=http_request request_id=%s method=%s path=%s status=%s duration_ms=%.1f",
            request_id,
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )

        response.headers[_REQUEST_ID_HEADER] = request_id
        for header, value in _SECURITY_HEADERS.items():
            response.headers.setdefault(header, value)
        if "Server" in response.headers:
            del response.headers["Server"]
        request_id_var.set(None)
        return response
