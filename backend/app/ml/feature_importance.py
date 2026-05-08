"""Feature importance extraction for trained ML models."""

from __future__ import annotations

from typing import Any

import numpy as np

from app.schemas.prediction import FeatureImportanceItem


def extract_feature_importance(
    model: Any,
    feature_names: list[str],
) -> list[FeatureImportanceItem]:
    """
    Extract and return feature importances sorted descending.

    Handles:
    - Tree models with `feature_importances_` attribute
    - Linear models with `coef_` attribute
    - Fallback: uniform weights
    """
    if hasattr(model, "feature_importances_"):
        raw = np.array(model.feature_importances_, dtype=float)
    elif hasattr(model, "coef_"):
        coef = np.array(model.coef_, dtype=float)
        raw = np.abs(coef.flatten())
    else:
        raw = np.ones(len(feature_names), dtype=float)

    # Normalize so importances sum to 1 (if non-zero)
    total = raw.sum()
    if total > 0:
        raw = raw / total

    items = [
        FeatureImportanceItem(
            feature=name,
            importance=round(float(imp), 4),
        )
        for name, imp in zip(feature_names, raw)
    ]

    # Sort descending by importance
    items.sort(key=lambda x: x.importance, reverse=True)
    return items
