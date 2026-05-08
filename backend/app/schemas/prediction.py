from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from .enums import AQICategory, ModelType
from .health_impact import OrganImpact


class PollutantInput(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    pm25: float = Field(..., alias="PM2.5", ge=0, le=5000, description="PM2.5 µg/m³")
    pm10: float = Field(..., alias="PM10", ge=0, le=5000, description="PM10 µg/m³")
    no2: float = Field(..., alias="NO2", ge=0, le=5000, description="NO2 µg/m³")
    so2: float = Field(..., alias="SO2", ge=0, le=5000, description="SO2 µg/m³")
    co: float = Field(..., alias="CO", ge=0, le=5000, description="CO µg/m³")
    o3: float = Field(..., alias="O3", ge=0, le=5000, description="O3 µg/m³")


class ConfidenceInterval(BaseModel):
    lower: float
    upper: float


class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float


class PredictionResponse(BaseModel):
    aqi: float
    aqi_category: AQICategory
    confidence_interval: ConfidenceInterval
    model_id: str
    model_type: ModelType
    feature_importance: list[FeatureImportanceItem]
    organs: list[OrganImpact]
    timestamp: datetime
    cached: bool


class BatchPredictionRow(BaseModel):
    row_index: int
    input: PollutantInput
    aqi: float
    aqi_category: AQICategory


class BatchRowError(BaseModel):
    row_index: int
    error_message: str


class BatchPredictionResponse(BaseModel):
    predictions: list[BatchPredictionRow]
    errors: list[BatchRowError]
    total_rows: int
    processed_rows: int
    error_rows: int
