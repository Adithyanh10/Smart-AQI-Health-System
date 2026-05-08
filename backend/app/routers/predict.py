"""Prediction router: single and batch AQI predictions."""

from __future__ import annotations

import io

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from pydantic import ValidationError

from app.dependencies import get_prediction_service
from app.schemas.prediction import (
    BatchPredictionResponse,
    BatchRowError,
    PollutantInput,
    PredictionResponse,
)
from app.services.prediction_service import PredictionService

router = APIRouter(tags=["Prediction"])

_MAX_CSV_BYTES = 50 * 1024 * 1024  # 50 MB
_REQUIRED_COLUMNS = {"PM2.5", "PM10", "NO2", "SO2", "CO", "O3"}


@router.post("/predict", response_model=PredictionResponse)
async def predict(
    body: PollutantInput,
    request: Request,
    service: PredictionService = Depends(get_prediction_service),
) -> PredictionResponse:
    client_ip = request.client.host if request.client else "unknown"
    return service.predict(body, client_ip=client_ip)


@router.post("/predict/csv", response_model=BatchPredictionResponse)
async def predict_csv(
    request: Request,
    file: UploadFile = File(...),
    service: PredictionService = Depends(get_prediction_service),
) -> BatchPredictionResponse:
    # Size check
    content = await file.read()
    if len(content) > _MAX_CSV_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds the 50 MB size limit.")

    # Parse CSV
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid CSV file: {exc}") from exc

    if df.empty:
        raise HTTPException(status_code=400, detail="CSV file is empty.")

    # Validate required columns
    missing = _REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"CSV is missing required columns: {sorted(missing)}",
        )

    # Build PollutantInput rows — collect validation errors instead of crashing
    rows: list[PollutantInput] = []
    pre_errors: list[BatchRowError] = []
    for idx, row in df.iterrows():
        try:
            rows.append(
                PollutantInput(**{
                    "PM2.5": float(row["PM2.5"]),
                    "PM10": float(row["PM10"]),
                    "NO2": float(row["NO2"]),
                    "SO2": float(row["SO2"]),
                    "CO": float(row["CO"]),
                    "O3": float(row["O3"]),
                })
            )
        except (ValidationError, ValueError) as exc:
            pre_errors.append(
                BatchRowError(row_index=int(idx), error_message=str(exc))
            )

    client_ip = request.client.host if request.client else "unknown"
    result = service.predict_batch(rows, client_ip=client_ip)

    # Merge pre-validation errors with any errors from predict_batch
    if pre_errors:
        result = result.model_copy(
            update={
                "errors": pre_errors + result.errors,
                "error_rows": len(pre_errors) + result.error_rows,
                "total_rows": result.total_rows + len(pre_errors),
            }
        )
    return result
