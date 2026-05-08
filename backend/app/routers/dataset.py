"""Dataset router: paginated rows and statistics."""

from __future__ import annotations

import math

import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Query

from app.config import settings
from app.schemas.common import PaginatedResponse
from app.schemas.dataset import ColumnStats, DatasetRow, DatasetStats

router = APIRouter(tags=["Dataset"])

_NUMERIC_COLS = ["PM2.5", "PM10", "NO2", "SO2", "CO", "O3", "AQI"]


def _load_df() -> pd.DataFrame:
    try:
        return pd.read_csv(settings.DATASET_PATH)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not read dataset: {exc}") from exc


@router.get("/dataset", response_model=PaginatedResponse[DatasetRow])
async def get_dataset(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    filter: str | None = Query(None, description="Filter by AQI category"),
) -> PaginatedResponse[DatasetRow]:
    df = _load_df()

    if filter:
        df = df[df["AQI_Category"].str.lower() == filter.lower()]

    total = len(df)
    total_pages = max(1, math.ceil(total / page_size))
    start = (page - 1) * page_size
    end = start + page_size
    page_df = df.iloc[start:end]

    items = [
        DatasetRow(
            pm25=float(row["PM2.5"]),
            pm10=float(row["PM10"]),
            no2=float(row["NO2"]),
            so2=float(row["SO2"]),
            co=float(row["CO"]),
            o3=float(row["O3"]),
            aqi=float(row["AQI"]),
            aqi_category=str(row.get("AQI_Category", "")),
        )
        for _, row in page_df.iterrows()
    ]

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/dataset/stats", response_model=DatasetStats)
async def get_dataset_stats() -> DatasetStats:
    df = _load_df()

    numeric_df = df[[c for c in _NUMERIC_COLS if c in df.columns]].copy()
    total_rows = len(df)

    # Per-column stats with IQR outlier detection
    columns: list[ColumnStats] = []
    outlier_mask = pd.Series([False] * total_rows, index=df.index)

    for col in numeric_df.columns:
        series = numeric_df[col]
        q25 = float(series.quantile(0.25))
        q75 = float(series.quantile(0.75))
        iqr = q75 - q25
        lower_fence = q25 - 1.5 * iqr
        upper_fence = q75 + 1.5 * iqr
        col_outliers = (series < lower_fence) | (series > upper_fence)
        outlier_mask = outlier_mask | col_outliers

        columns.append(
            ColumnStats(
                column=col,
                mean=round(float(series.mean()), 4),
                median=round(float(series.median()), 4),
                std=round(float(series.std()), 4),
                min=round(float(series.min()), 4),
                max=round(float(series.max()), 4),
                p25=round(q25, 4),
                p75=round(q75, 4),
                missing_count=int(series.isna().sum()),
                missing_pct=round(float(series.isna().mean()) * 100, 4),
                outlier_count=int(col_outliers.sum()),
            )
        )

    outlier_rows = int(outlier_mask.sum())

    # Correlation matrix (numeric columns only)
    corr = numeric_df.corr()
    correlation_matrix: dict[str, dict[str, float]] = {
        col: {c: round(float(v), 4) for c, v in row.items()}
        for col, row in corr.to_dict().items()
    }

    return DatasetStats(
        total_rows=total_rows,
        outlier_rows=outlier_rows,
        outlier_pct=round(outlier_rows / total_rows * 100, 4) if total_rows else 0.0,
        columns=columns,
        correlation_matrix=correlation_matrix,
    )
