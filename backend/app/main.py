"""FastAPI application entry point."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.dependencies import get_registry
from app.middleware.api_key_auth import APIKeyAuthMiddleware
from app.middleware.rate_limiter import RateLimiterMiddleware
from app.middleware.request_sanitizer import RequestSanitizerMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.routers import aqi_live, cache, dataset, health_impact, models, predict, report, network
from app.schemas.enums import ModelType

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """On startup: train a default model if no active model exists."""
    registry = get_registry()
    active_file = Path(settings.MODELS_DIR) / "active.json"

    if not active_file.exists():
        logger.info("No active model found. Training default random_forest model...")
        try:
            version = registry.train(settings.DATASET_PATH, ModelType.RANDOM_FOREST)
            registry.set_active(version.model_id)
            logger.info("Default model trained: %s", version.model_id)
        except Exception:
            logger.exception("Failed to train default model on startup")

    yield


app = FastAPI(
    title="Smart AQI Health Impact Analysis System",
    version="1.0.0",
    lifespan=lifespan,
)

# ── Middleware (registered in reverse order — last added = outermost) ──
# Desired order: CORS → RateLimit → SecurityHeaders → RequestSanitizer → APIKeyAuth
# FastAPI/Starlette applies middleware in LIFO order, so we add in reverse:
# app.add_middleware(APIKeyAuthMiddleware)  # disabled in dev
app.add_middleware(RequestSanitizerMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimiterMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────
app.include_router(predict.router, prefix="/api/v1")
app.include_router(health_impact.router, prefix="/api/v1")
app.include_router(models.router, prefix="/api/v1")
app.include_router(aqi_live.router, prefix="/api/v1")
app.include_router(dataset.router, prefix="/api/v1")
app.include_router(cache.router, prefix="/api/v1")
app.include_router(report.router, prefix="/api/v1")
app.include_router(network.router, prefix="/api/v1")

# ── Static files ───────────────────────────────────────────────────────
_static_dir = Path("static")
if _static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(_static_dir)), name="static")
