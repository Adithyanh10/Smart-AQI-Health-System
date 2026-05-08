"""Rate limiter middleware: sliding window counter per IP, 100 req/60s."""

import time
from collections import deque
from typing import Deque

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.config import settings


class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int | None = None, window_seconds: int | None = None) -> None:
        super().__init__(app)
        self._max_requests = max_requests or settings.RATE_LIMIT_MAX
        self._window_seconds = window_seconds or settings.RATE_LIMIT_WINDOW
        self._buckets: dict[str, Deque[float]] = {}

    def _get_client_ip(self, request: Request) -> str:
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        if request.client:
            return request.client.host
        return "unknown"

    def _is_rate_limited(self, ip: str) -> tuple[bool, int]:
        now = time.monotonic()
        window_start = now - self._window_seconds

        if ip not in self._buckets:
            self._buckets[ip] = deque()

        bucket = self._buckets[ip]

        # Evict timestamps outside the window
        while bucket and bucket[0] < window_start:
            bucket.popleft()

        if len(bucket) >= self._max_requests:
            # Retry-After = time until oldest request falls out of window
            retry_after = int(bucket[0] - window_start) + 1
            return True, retry_after

        bucket.append(now)
        return False, 0

    async def dispatch(self, request: Request, call_next) -> Response:
        ip = self._get_client_ip(request)
        limited, retry_after = self._is_rate_limited(ip)

        if limited:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded. Maximum 100 requests per minute.",
                    "retry_after": retry_after,
                },
                headers={"Retry-After": str(retry_after)},
            )

        return await call_next(request)
