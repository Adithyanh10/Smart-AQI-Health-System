"""Models router: metrics, retraining, activation, and hyperparameter tuning."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from starlette.responses import JSONResponse

from app.config import settings
from app.dependencies import get_registry
from app.schemas.enums import ModelType
from app.schemas.model import ModelMetrics, ModelVersion, RetrainStatus, TuningResult
from app.services.model_registry import ModelRegistry

router = APIRouter(tags=["Models"])


@router.get("/model/metrics", response_model=ModelMetrics)
async def get_model_metrics(
    registry: ModelRegistry = Depends(get_registry),
) -> ModelMetrics:
    try:
        _, version = registry.get_active_model()
        return version.metrics
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/model/retrain", status_code=202)
async def retrain_model(
    model_type: ModelType = ModelType.RANDOM_FOREST,
    registry: ModelRegistry = Depends(get_registry),
) -> JSONResponse:
    job_id = registry.retrain_async(settings.DATASET_PATH, model_type)
    return JSONResponse(status_code=202, content={"job_id": job_id})


@router.get("/model/retrain/status", response_model=RetrainStatus)
async def get_retrain_status(
    job_id: str = Query(...),
    registry: ModelRegistry = Depends(get_registry),
) -> RetrainStatus:
    try:
        return registry.get_retrain_status(job_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/models", response_model=list[ModelVersion])
async def list_models(
    registry: ModelRegistry = Depends(get_registry),
) -> list[ModelVersion]:
    return registry.list_versions()


@router.post("/models/{model_id}/activate", response_model=ModelVersion)
async def activate_model(
    model_id: str,
    registry: ModelRegistry = Depends(get_registry),
) -> ModelVersion:
    try:
        registry.set_active(model_id)
        return registry._load_version(model_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/models/tune", response_model=TuningResult)
async def tune_model(
    body: dict,
    registry: ModelRegistry = Depends(get_registry),
) -> TuningResult:
    model_type_str = body.get("model_type", "random_forest")
    param_grid = body.get("param_grid", {})

    try:
        model_type = ModelType(model_type_str)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid model_type '{model_type_str}'.",
        )

    try:
        return registry.tune_hyperparameters(model_type, param_grid)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
