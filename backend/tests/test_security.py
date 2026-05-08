"""Tests for security middleware — injection detection, API key auth."""
import pytest
from hypothesis import given, settings
from hypothesis import strategies as st
from httpx import AsyncClient, ASGITransport
from app.main import app


INJECTION_PATTERNS = ["SELECT", "INSERT", "DROP", "UNION", "<script", "\x00", "'; DROP", "--"]


@pytest.mark.asyncio
async def test_clean_predict_request_passes():
    """A valid prediction request should not be blocked by the sanitizer."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post("/api/v1/predict", json={
            "PM2.5": 25.0, "PM10": 50.0, "NO2": 30.0,
            "SO2": 10.0, "CO": 1.5, "O3": 40.0
        })
        assert r.status_code in (200, 422)  # 422 if model not loaded, not 400


@pytest.mark.asyncio
@pytest.mark.parametrize("pattern", INJECTION_PATTERNS)
async def test_injection_pattern_in_body_returns_400(pattern: str):
    """Requests containing injection patterns should be rejected with HTTP 400."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post(
            "/api/v1/predict",
            content=f'{{"PM2.5": "{pattern}", "PM10": 50}}',
            headers={"Content-Type": "application/json"},
        )
        assert r.status_code == 400


@pytest.mark.asyncio
async def test_security_headers_present():
    """All responses must include required security headers."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/v1/aqi/live")
        assert "x-content-type-options" in r.headers or "X-Content-Type-Options" in r.headers
        assert "x-frame-options" in r.headers or "X-Frame-Options" in r.headers


@pytest.mark.asyncio
async def test_cache_flush_without_api_key_returns_401():
    """Cache flush endpoint requires API key."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.delete("/api/v1/cache/flush")
        assert r.status_code == 401


@pytest.mark.asyncio
async def test_cache_flush_with_invalid_api_key_returns_401():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.delete("/api/v1/cache/flush", headers={"X-API-Key": "wrong-key-xyz"})
        assert r.status_code == 401


@pytest.mark.asyncio
async def test_public_endpoints_accessible_without_api_key():
    """Public endpoints should not require API key."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/v1/models")
        assert r.status_code != 401

        r2 = await client.get("/api/v1/aqi/live")
        assert r2.status_code != 401


# ── Property-based test ───────────────────────────────────────────────────────
@settings(max_examples=20, deadline=5000)
@given(st.sampled_from(INJECTION_PATTERNS))
def test_property_injection_always_rejected(pattern: str):
    """Property: any injection pattern in request body must return HTTP 400."""
    import asyncio

    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            r = await client.post(
                "/api/v1/predict",
                content=f'{{"PM2.5": "{pattern}", "PM10": 50}}',
                headers={"Content-Type": "application/json"},
            )
            assert r.status_code == 400

    asyncio.get_event_loop().run_until_complete(_run())
