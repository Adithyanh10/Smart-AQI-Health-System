from __future__ import annotations

from pydantic import BaseModel


class DatasetRow(BaseModel):
    """A single row from the air quality dataset."""

    pm25: float
    pm10: float
    no2: float
    so2: float
    co: float
    o3: float
    aqi: float
    aqi_category: str

    model_config = {"populate_by_name": True}


class ColumnStats(BaseModel):
    column: str
    mean: float
    median: float
    std: float
    min: float
    max: float
    p25: float
    p75: float
    missing_count: int
    missing_pct: float
    outlier_count: int


class DatasetStats(BaseModel):
    total_rows: int
    outlier_rows: int
    outlier_pct: float
    columns: list[ColumnStats]
    correlation_matrix: dict[str, dict[str, float]]
