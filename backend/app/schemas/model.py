from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel

from .enums import AQICategory, ModelType
from .prediction import PollutantInput


class ModelMetrics(BaseModel):
    mae: float
    rmse: float
    r2: float
    accuracy: float
    cv_mean_accuracy: float
    cv_std_accuracy: float


class ModelVersion(BaseModel):
    model_id: str
    model_type: ModelType
    trained_at: datetime
    dataset_rows: int
    metrics: ModelMetrics
    is_active: bool
    artifact_path: str


class RetrainStatus(BaseModel):
    job_id: str
    status: Literal["pending", "running", "completed", "failed"]
    started_at: datetime | None = None
    completed_at: datetime | None = None
    metrics: ModelMetrics | None = None
    error: str | None = None


class HyperparameterResult(BaseModel):
    params: dict[str, Any]
    cv_score: float


class TuningResult(BaseModel):
    best_params: dict[str, Any]
    best_score: float
    all_results: list[HyperparameterResult]


class LiveAQIResponse(BaseModel):
    aqi: float
    aqi_category: AQICategory
    pollutants: PollutantInput
    timestamp: datetime
    latency_ms: int
