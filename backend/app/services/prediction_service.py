"""Prediction service: single and batch AQI predictions with caching."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import numpy as np

from app.ml.confidence_interval import compute_ci
from app.ml.feature_importance import extract_feature_importance
from app.ml.trainer import FEATURES, classify_aqi
from app.schemas.enums import AQICategory
from app.schemas.prediction import (
    BatchPredictionResponse,
    BatchPredictionRow,
    BatchRowError,
    ConfidenceInterval,
    FeatureImportanceItem,
    PollutantInput,
    PredictionResponse,
)
from app.services.audit_logger import AuditLogger
from app.services.cache import InMemoryCache
from app.services.health_impact_engine import HealthImpactEngine
from app.services.model_registry import ModelRegistry

logger = logging.getLogger(__name__)


class PredictionService:
    def __init__(
        self,
        registry: ModelRegistry,
        cache: InMemoryCache,
        health_engine: HealthImpactEngine,
        audit_logger: AuditLogger,
    ) -> None:
        self._registry = registry
        self._cache = cache
        self._health_engine = health_engine
        self._audit_logger = audit_logger

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def predict(
        self,
        input: PollutantInput,
        model_id: str | None = None,
        client_ip: str = "unknown",
    ) -> PredictionResponse:
        """Single prediction with cache, CI, feature importance, and health impact."""

        cache_key = self._build_cache_key(input)
        cached = self._cache.get(cache_key)
        if cached is not None:
            # Return a copy with cached=True to signal this was a cache hit
            return cached.model_copy(update={"cached": True})

        model, version = self._get_model(model_id)

        X = self._input_to_array(input)

        # Run prediction
        raw_aqi = float(model.predict(X)[0])
        aqi = self._round_floats(raw_aqi)

        # Compute residuals from training data (approximated as zeros for inference)
        residuals = np.array([0.0])
        lower, upper = compute_ci(model, X, residuals)

        # Feature importance
        fi_items: list[FeatureImportanceItem] = extract_feature_importance(model, FEATURES)

        # AQI category
        category_str = classify_aqi(aqi)
        aqi_category = AQICategory(category_str)

        # Health impact
        organs = self._health_engine.get_impact(aqi_category)

        response = PredictionResponse(
            aqi=aqi,
            aqi_category=aqi_category,
            confidence_interval=ConfidenceInterval(lower=lower, upper=upper),
            model_id=version.model_id,
            model_type=version.model_type,
            feature_importance=fi_items,
            organs=organs,
            timestamp=datetime.now(timezone.utc),
            cached=False,
        )

        # Cache and log
        self._cache.set(cache_key, response)
        try:
            self._audit_logger.log_prediction(client_ip, input, response)
        except Exception:
            logger.warning("Audit logging failed", exc_info=True)

        return response

    def predict_batch(
        self,
        rows: list[PollutantInput],
        client_ip: str = "unknown",
    ) -> BatchPredictionResponse:
        """Batch prediction; collects per-row errors without aborting."""
        predictions: list[BatchPredictionRow] = []
        errors: list[BatchRowError] = []

        for idx, row in enumerate(rows):
            try:
                result = self.predict(row, client_ip=client_ip)
                predictions.append(
                    BatchPredictionRow(
                        row_index=idx,
                        input=row,
                        aqi=result.aqi,
                        aqi_category=result.aqi_category,
                    )
                )
            except Exception as exc:
                errors.append(
                    BatchRowError(row_index=idx, error_message=str(exc))
                )

        return BatchPredictionResponse(
            predictions=predictions,
            errors=errors,
            total_rows=len(rows),
            processed_rows=len(predictions),
            error_rows=len(errors),
        )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _get_model(self, model_id: str | None) -> tuple[Any, Any]:
        """Return (artifact, ModelVersion) for the requested or active model."""
        if model_id is not None:
            from app.services.model_registry import ModelRegistry
            # Load specific model by id
            version = self._registry._load_version(model_id)
            import joblib
            artifact = joblib.load(version.artifact_path)
            return artifact, version
        return self._registry.get_active_model()

    def _input_to_array(self, input: PollutantInput) -> np.ndarray:
        """Convert PollutantInput to a 2-D numpy array matching FEATURES order."""
        values = [input.pm25, input.pm10, input.no2, input.so2, input.co, input.o3]
        return np.array([values], dtype=float)

    def _build_cache_key(self, input: PollutantInput) -> str:
        """Delegate to InMemoryCache._build_key using pollutant values."""
        data = {
            "PM2.5": input.pm25,
            "PM10": input.pm10,
            "NO2": input.no2,
            "SO2": input.so2,
            "CO": input.co,
            "O3": input.o3,
        }
        return self._cache._build_key(data)

    def _round_floats(self, value: float, decimals: int = 4) -> float:
        return round(value, decimals)
