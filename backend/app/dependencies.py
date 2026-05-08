"""Singleton dependency injection for FastAPI."""

from __future__ import annotations

from app.config import settings
from app.services.audit_logger import AuditLogger
from app.services.cache import InMemoryCache
from app.services.health_impact_engine import HealthImpactEngine
from app.services.model_registry import ModelRegistry
from app.services.prediction_service import PredictionService
from app.services.sse_broadcaster import SSEBroadcaster

# Module-level singletons
_cache = InMemoryCache(default_ttl=settings.CACHE_TTL_SECONDS)
_registry = ModelRegistry(models_dir=settings.MODELS_DIR)
_health_engine = HealthImpactEngine()
_audit_logger = AuditLogger(log_dir=settings.LOGS_DIR)
_sse_broadcaster = SSEBroadcaster()
_prediction_service = PredictionService(
    registry=_registry,
    cache=_cache,
    health_engine=_health_engine,
    audit_logger=_audit_logger,
)


def get_cache() -> InMemoryCache:
    return _cache


def get_registry() -> ModelRegistry:
    return _registry


def get_prediction_service() -> PredictionService:
    return _prediction_service


def get_health_engine() -> HealthImpactEngine:
    return _health_engine


def get_audit_logger() -> AuditLogger:
    return _audit_logger


def get_sse_broadcaster() -> SSEBroadcaster:
    return _sse_broadcaster
