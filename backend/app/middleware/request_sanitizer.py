"""Request sanitizer middleware: blocks SQL injection, script tags, and null bytes."""

import re

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

# SQL injection keywords (word-boundary match, case-insensitive)
_SQL_PATTERN = re.compile(
    r"\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC)\b",
    re.IGNORECASE,
)
_SCRIPT_PATTERN = re.compile(r"<script", re.IGNORECASE)
_NULL_BYTE = b"\x00"

_DISALLOWED_RESPONSE = JSONResponse(
    status_code=400,
    content={"detail": "Request contains disallowed content."},
)


class RequestSanitizerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        # Only inspect requests that may carry a body
        if request.method in ("POST", "PUT", "PATCH"):
            body: bytes = await request.body()

            if _NULL_BYTE in body:
                return _DISALLOWED_RESPONSE

            try:
                text = body.decode("utf-8", errors="replace")
            except Exception:
                text = ""

            if _SQL_PATTERN.search(text) or _SCRIPT_PATTERN.search(text):
                return _DISALLOWED_RESPONSE

        return await call_next(request)
