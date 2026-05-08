"""Tests for RateLimiterMiddleware — sliding window, 429 response, retry-after."""
import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from app.middleware.rate_limiter import RateLimiterMiddleware


def make_app(max_requests: int = 5, window: int = 60) -> FastAPI:
    """Create a minimal FastAPI app with rate limiter for testing."""
    app = FastAPI()
    app.add_middleware(RateLimiterMiddleware, max_requests=max_requests, window_seconds=window)

    @app.get("/ping")
    async def ping():
        return JSONResponse({"ok": True})

    return app


@pytest.mark.asyncio
async def test_requests_within_limit_succeed():
    app = make_app(max_requests=5)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        for _ in range(5):
            r = await client.get("/ping")
            assert r.status_code == 200


@pytest.mark.asyncio
async def test_request_over_limit_returns_429():
    app = make_app(max_requests=3)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        for _ in range(3):
            await client.get("/ping")
        r = await client.get("/ping")
        assert r.status_code == 429


@pytest.mark.asyncio
async def test_429_response_has_retry_after_header():
    app = make_app(max_requests=2)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.get("/ping")
        await client.get("/ping")
        r = await client.get("/ping")
        assert r.status_code == 429
        assert "retry-after" in r.headers or "Retry-After" in r.headers


@pytest.mark.asyncio
async def test_429_response_body_has_detail():
    app = make_app(max_requests=1)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.get("/ping")
        r = await client.get("/ping")
        assert r.status_code == 429
        body = r.json()
        assert "detail" in body


@pytest.mark.asyncio
async def test_different_ips_have_separate_limits():
    """Two different IPs should each get their own quota."""
    app = make_app(max_requests=2)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # IP 1 — exhaust limit
        for _ in range(2):
            await client.get("/ping", headers={"X-Forwarded-For": "1.2.3.4"})
        r_blocked = await client.get("/ping", headers={"X-Forwarded-For": "1.2.3.4"})
        assert r_blocked.status_code == 429

        # IP 2 — should still work
        r_ok = await client.get("/ping", headers={"X-Forwarded-For": "5.6.7.8"})
        assert r_ok.status_code == 200
