"""ML model training pipeline."""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split

from app.ml.evaluator import ModelEvaluator
from app.schemas.enums import ModelType
from app.schemas.model import ModelMetrics, ModelVersion

logger = logging.getLogger(__name__)

# AQI category boundaries (upper inclusive)
AQI_BOUNDARIES: list[tuple[float, str]] = [
    (50.0, "Good"),
    (100.0, "Moderate"),
    (150.0, "Unhealthy for Sensitive Groups"),
    (200.0, "Unhealthy"),
    (300.0, "Very Unhealthy"),
    (float("inf"), "Hazardous"),
]

FEATURES = ["PM2.5", "PM10", "NO2", "SO2", "CO", "O3"]
REQUIRED_COLUMNS = FEATURES + ["AQI"]

MODELS_DIR = Path("models")


def classify_aqi(aqi: float) -> str:
    """Classify a numeric AQI value into a category string."""
    for boundary, label in AQI_BOUNDARIES:
        if aqi <= boundary:
            return label
    return "Hazardous"


def _make_aqi_bins(series: pd.Series) -> pd.Series:
    """Convert AQI values to category labels for stratification."""
    return series.apply(classify_aqi)


def _instantiate_model(model_type: ModelType) -> Any:
    if model_type == ModelType.RANDOM_FOREST:
        return RandomForestRegressor(n_estimators=100, random_state=42)
    elif model_type == ModelType.GRADIENT_BOOSTING:
        return GradientBoostingRegressor(n_estimators=100, random_state=42)
    elif model_type == ModelType.XGBOOST:
        try:
            from xgboost import XGBRegressor
            return XGBRegressor(n_estimators=100, random_state=42, eval_metric="rmse")
        except ImportError as exc:
            raise ImportError("xgboost is not installed") from exc
    elif model_type == ModelType.LINEAR_REGRESSION:
        return LinearRegression()
    else:
        raise ValueError(f"Unsupported model type: {model_type}")


class ModelTrainer:
    def __init__(self, models_dir: str | Path = MODELS_DIR) -> None:
        self._models_dir = Path(models_dir)
        self._evaluator = ModelEvaluator()

    def train(self, dataset_path: str, model_type: ModelType) -> ModelVersion:
        """Full training pipeline: load → validate → split → fit → evaluate → persist."""

        # 1. Load CSV
        df = pd.read_csv(dataset_path)

        # 2. Validate required columns
        missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
        if missing:
            raise ValueError(f"Dataset missing required columns: {missing}")

        # 3. Drop NaN rows
        before = len(df)
        df = df.dropna(subset=REQUIRED_COLUMNS)
        dropped = before - len(df)
        if dropped:
            logger.info("Dropped %d rows with NaN values", dropped)

        X = df[FEATURES].values
        y = df["AQI"].values

        # 4. 80/20 stratified split on AQI category bins
        aqi_bins = _make_aqi_bins(df["AQI"])
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=aqi_bins
        )

        # 5 & 6. Instantiate and fit model
        model = _instantiate_model(model_type)
        model.fit(X_train, y_train)

        # 7. Evaluate
        residuals = y_train - model.predict(X_train)

        # 8. StratifiedKFold cross-validation (5 folds)
        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        cv_scores = cross_val_score(
            model, X, y,
            cv=skf.split(X, _make_aqi_bins(df["AQI"])),
            scoring="r2",
        )
        cv_mean = float(np.mean(cv_scores))
        cv_std = float(np.std(cv_scores))

        metrics = self._evaluator.evaluate(
            model, X_test, y_test, cv_mean=cv_mean, cv_std=cv_std
        )

        # 9. Assign UUID and persist artifact
        model_id = str(uuid.uuid4())
        model_dir = self._models_dir / model_id
        model_dir.mkdir(parents=True, exist_ok=True)

        artifact_path = model_dir / "artifact.pkl"
        joblib.dump(model, artifact_path)

        # 10. Write metadata.json
        trained_at = datetime.now(timezone.utc)
        version = ModelVersion(
            model_id=model_id,
            model_type=model_type,
            trained_at=trained_at,
            dataset_rows=len(df),
            metrics=metrics,
            is_active=False,
            artifact_path=str(artifact_path),
        )

        metadata = version.model_dump(mode="json")
        with (model_dir / "metadata.json").open("w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2, default=str)

        logger.info(
            "Trained %s model %s — MAE=%.4f RMSE=%.4f R²=%.4f acc=%.4f",
            model_type.value,
            model_id,
            metrics.mae,
            metrics.rmse,
            metrics.r2,
            metrics.accuracy,
        )

        return version
