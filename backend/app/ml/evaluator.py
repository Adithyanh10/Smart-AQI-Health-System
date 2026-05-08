"""Model evaluation: MAE, RMSE, R², and classification accuracy."""

from __future__ import annotations

import math
from typing import Any

import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from app.schemas.model import ModelMetrics


def _classify_aqi(aqi: float) -> str:
    """Classify a numeric AQI value into a category string."""
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"


class ModelEvaluator:
    def evaluate(
        self,
        model: Any,
        X_test: np.ndarray,
        y_test: np.ndarray,
        cv_mean: float = 0.0,
        cv_std: float = 0.0,
    ) -> ModelMetrics:
        """Evaluate a trained model and return ModelMetrics."""
        y_pred = model.predict(X_test)

        mae = float(mean_absolute_error(y_test, y_pred))
        rmse = float(math.sqrt(mean_squared_error(y_test, y_pred)))
        r2 = float(r2_score(y_test, y_pred))

        # Classification accuracy: compare AQI category of predictions vs actuals
        pred_cats = [_classify_aqi(v) for v in y_pred]
        true_cats = [_classify_aqi(v) for v in y_test]
        correct = sum(p == t for p, t in zip(pred_cats, true_cats))
        accuracy = correct / len(true_cats) if true_cats else 0.0

        return ModelMetrics(
            mae=mae,
            rmse=rmse,
            r2=r2,
            accuracy=accuracy,
            cv_mean_accuracy=cv_mean,
            cv_std_accuracy=cv_std,
        )
