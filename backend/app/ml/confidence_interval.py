"""Confidence interval computation for regression model predictions."""

from __future__ import annotations

from typing import Any

import numpy as np


def compute_ci(
    model: Any,
    X: np.ndarray,
    residuals: np.ndarray,
    alpha: float = 0.05,
) -> tuple[float, float]:
    """
    Compute a 95% confidence interval for the model's prediction on X.

    For tree ensembles (has `estimators_`): use std of individual tree predictions.
    For other models: use std of training residuals.

    Returns (lower, upper) rounded to 4 decimal places.
    """
    point = float(model.predict(X)[0])

    if hasattr(model, "estimators_"):
        # Tree ensemble: derive uncertainty from spread of individual trees
        tree_preds = np.array([t.predict(X)[0] for t in model.estimators_])
        std = float(np.std(tree_preds))
    else:
        std = float(np.std(residuals))

    z = 1.96  # 95% CI
    lower = round(point - z * std, 4)
    upper = round(point + z * std, 4)
    return (lower, upper)
