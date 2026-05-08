"""Model registry: versioned model storage, activation, and async retraining."""

from __future__ import annotations

import json
import logging
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib

from app.ml.trainer import ModelTrainer
from app.schemas.enums import ModelType
from app.schemas.model import (
    HyperparameterResult,
    ModelMetrics,
    ModelVersion,
    RetrainStatus,
    TuningResult,
)

logger = logging.getLogger(__name__)

MODELS_DIR = Path("models")


class ModelRegistry:
    def __init__(self, models_dir: str | Path = MODELS_DIR) -> None:
        self._models_dir = Path(models_dir)
        self._models_dir.mkdir(parents=True, exist_ok=True)
        self._trainer = ModelTrainer(models_dir=self._models_dir)
        self._retrain_jobs: dict[str, RetrainStatus] = {}
        self._lock = threading.Lock()

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def train(self, dataset_path: str, model_type: ModelType) -> ModelVersion:
        """Train a new model and return its ModelVersion."""
        return self._trainer.train(dataset_path, model_type)

    # ------------------------------------------------------------------
    # Active model management
    # ------------------------------------------------------------------

    def get_active_model(self) -> tuple[Any, ModelVersion]:
        """Load and return (artifact, ModelVersion) for the active model."""
        active_file = self._models_dir / "active.json"
        if not active_file.exists():
            raise FileNotFoundError("No active model set. Train a model first.")

        with active_file.open(encoding="utf-8") as f:
            data = json.load(f)
        model_id = data["model_id"]

        version = self._load_version(model_id)
        artifact = joblib.load(version.artifact_path)
        return artifact, version

    def set_active(self, model_id: str) -> None:
        """Write models/active.json to point to the given model_id."""
        # Verify the model exists
        self._load_version(model_id)

        active_file = self._models_dir / "active.json"
        with active_file.open("w", encoding="utf-8") as f:
            json.dump({"model_id": model_id}, f)

        logger.info("Active model set to %s", model_id)

    # ------------------------------------------------------------------
    # Listing / metrics
    # ------------------------------------------------------------------

    def list_versions(self) -> list[ModelVersion]:
        """Return all ModelVersion objects found in the models directory."""
        versions: list[ModelVersion] = []
        for meta_path in self._models_dir.glob("*/metadata.json"):
            try:
                with meta_path.open(encoding="utf-8") as f:
                    data = json.load(f)
                versions.append(ModelVersion(**data))
            except Exception as exc:
                logger.warning("Failed to load metadata at %s: %s", meta_path, exc)
        return versions

    def get_metrics(self, model_id: str) -> ModelMetrics:
        """Return ModelMetrics for the given model_id."""
        return self._load_version(model_id).metrics

    # ------------------------------------------------------------------
    # Async retraining
    # ------------------------------------------------------------------

    def retrain_async(self, dataset_path: str, model_type: ModelType) -> str:
        """Start background retraining; return job_id."""
        job_id = str(uuid.uuid4())
        status = RetrainStatus(
            job_id=job_id,
            status="pending",
            started_at=None,
            completed_at=None,
        )
        with self._lock:
            self._retrain_jobs[job_id] = status

        thread = threading.Thread(
            target=self._run_retrain,
            args=(job_id, dataset_path, model_type),
            daemon=True,
        )
        thread.start()
        return job_id

    def get_retrain_status(self, job_id: str) -> RetrainStatus:
        with self._lock:
            status = self._retrain_jobs.get(job_id)
        if status is None:
            raise KeyError(f"Unknown job_id: {job_id}")
        return status

    def _run_retrain(
        self, job_id: str, dataset_path: str, model_type: ModelType
    ) -> None:
        with self._lock:
            self._retrain_jobs[job_id] = RetrainStatus(
                job_id=job_id,
                status="running",
                started_at=datetime.now(timezone.utc),
            )
        try:
            version = self._trainer.train(dataset_path, model_type)
            with self._lock:
                self._retrain_jobs[job_id] = RetrainStatus(
                    job_id=job_id,
                    status="completed",
                    started_at=self._retrain_jobs[job_id].started_at,
                    completed_at=datetime.now(timezone.utc),
                    metrics=version.metrics,
                )
        except Exception as exc:
            logger.exception("Retraining job %s failed", job_id)
            with self._lock:
                self._retrain_jobs[job_id] = RetrainStatus(
                    job_id=job_id,
                    status="failed",
                    started_at=self._retrain_jobs[job_id].started_at,
                    completed_at=datetime.now(timezone.utc),
                    error=str(exc),
                )

    # ------------------------------------------------------------------
    # Hyperparameter tuning
    # ------------------------------------------------------------------

    def tune_hyperparameters(
        self, model_type: ModelType, param_grid: dict
    ) -> TuningResult:
        """Run GridSearchCV and return TuningResult."""
        from sklearn.model_selection import GridSearchCV, StratifiedKFold

        from app.ml.trainer import FEATURES, REQUIRED_COLUMNS, _make_aqi_bins, _instantiate_model

        # Load the active dataset
        active_file = self._models_dir / "active.json"
        if active_file.exists():
            with active_file.open(encoding="utf-8") as f:
                data = json.load(f)
            version = self._load_version(data["model_id"])
            # Derive dataset path from artifact path
            dataset_path = str(
                Path(version.artifact_path).parent.parent.parent / "dataset" / "air_quality.csv"
            )
        else:
            dataset_path = "dataset/air_quality.csv"

        import pandas as pd
        df = pd.read_csv(dataset_path).dropna(subset=REQUIRED_COLUMNS)
        X = df[FEATURES].values
        y = df["AQI"].values
        bins = _make_aqi_bins(df["AQI"])

        base_model = _instantiate_model(model_type)
        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        gs = GridSearchCV(
            base_model,
            param_grid,
            cv=skf.split(X, bins),
            scoring="r2",
            n_jobs=-1,
        )
        gs.fit(X, y)

        all_results = [
            HyperparameterResult(
                params=dict(params),
                cv_score=float(score),
            )
            for params, score in zip(
                gs.cv_results_["params"], gs.cv_results_["mean_test_score"]
            )
        ]

        return TuningResult(
            best_params=gs.best_params_,
            best_score=float(gs.best_score_),
            all_results=all_results,
        )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _load_version(self, model_id: str) -> ModelVersion:
        meta_path = self._models_dir / model_id / "metadata.json"
        if not meta_path.exists():
            raise FileNotFoundError(f"Model not found: {model_id}")
        with meta_path.open(encoding="utf-8") as f:
            data = json.load(f)
        return ModelVersion(**data)
