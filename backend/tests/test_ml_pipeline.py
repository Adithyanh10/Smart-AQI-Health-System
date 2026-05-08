"""Tests for ML training pipeline — all 4 model types, metrics, AQI classification."""
import numpy as np
import pandas as pd
import pytest
from hypothesis import given, settings
from hypothesis import strategies as st
from app.ml.trainer import ModelTrainer, classify_aqi, AQI_BOUNDARIES
from app.schemas.enums import ModelType, AQICategory


# ── Fixtures ──────────────────────────────────────────────────────────────────

def make_dataset(n: int = 200) -> pd.DataFrame:
    """Generate a synthetic but realistic AQI dataset."""
    rng = np.random.default_rng(42)
    pm25 = rng.uniform(0, 300, n)
    pm10 = pm25 * rng.uniform(1.2, 2.5, n)
    no2  = rng.uniform(0, 200, n)
    so2  = rng.uniform(0, 100, n)
    co   = rng.uniform(0, 50, n)
    o3   = rng.uniform(0, 200, n)
    aqi  = (pm25 * 0.5 + pm10 * 0.2 + no2 * 0.1 + so2 * 0.05 + co * 0.1 + o3 * 0.05).clip(0, 500)
    cats = [classify_aqi(v) for v in aqi]
    return pd.DataFrame({
        "PM2.5": pm25, "PM10": pm10, "NO2": no2,
        "SO2": so2, "CO": co, "O3": o3,
        "AQI": aqi, "AQI_Category": cats,
    })


@pytest.fixture(scope="module")
def tmp_dataset(tmp_path_factory):
    tmp = tmp_path_factory.mktemp("data")
    path = str(tmp / "test_data.csv")
    make_dataset(300).to_csv(path, index=False)
    return path


# ── classify_aqi boundary tests ───────────────────────────────────────────────

@pytest.mark.parametrize("aqi,expected", [
    (0,   "Good"),
    (50,  "Good"),
    (51,  "Moderate"),
    (100, "Moderate"),
    (101, "Unhealthy for Sensitive Groups"),
    (150, "Unhealthy for Sensitive Groups"),
    (151, "Unhealthy"),
    (200, "Unhealthy"),
    (201, "Very Unhealthy"),
    (300, "Very Unhealthy"),
    (301, "Hazardous"),
    (500, "Hazardous"),
])
def test_classify_aqi_boundaries(aqi, expected):
    assert classify_aqi(aqi) == expected


def test_classify_aqi_covers_all_values():
    """classify_aqi must return a valid category for any non-negative value."""
    valid = {c.value for c in AQICategory}
    for v in range(0, 501, 10):
        assert classify_aqi(v) in valid


# ── Training smoke tests ──────────────────────────────────────────────────────

@pytest.mark.parametrize("model_type", [
    ModelType.RANDOM_FOREST,
    ModelType.GRADIENT_BOOSTING,
    ModelType.LINEAR_REGRESSION,
])
def test_all_model_types_train_without_error(tmp_dataset, model_type):
    trainer = ModelTrainer()
    version = trainer.train(tmp_dataset, model_type)
    assert version.model_id
    assert version.model_type == model_type
    assert version.dataset_rows > 0


def test_trained_model_metrics_are_valid(tmp_dataset):
    trainer = ModelTrainer()
    version = trainer.train(tmp_dataset, ModelType.RANDOM_FOREST)
    m = version.metrics
    assert m.mae >= 0
    assert m.rmse >= 0
    assert m.r2 <= 1.0
    assert 0.0 <= m.accuracy <= 1.0
    assert 0.0 <= m.cv_mean_accuracy <= 1.0
    assert m.cv_std_accuracy >= 0.0


def test_trained_model_accuracy_above_threshold(tmp_dataset):
    """Random forest on clean synthetic data should achieve >70% accuracy."""
    trainer = ModelTrainer()
    version = trainer.train(tmp_dataset, ModelType.RANDOM_FOREST)
    assert version.metrics.accuracy >= 0.70, f"Accuracy too low: {version.metrics.accuracy}"


def test_training_on_real_dataset():
    """Smoke test on the actual project dataset."""
    import os
    dataset_path = "dataset.csv"
    if not os.path.exists(dataset_path):
        pytest.skip("dataset.csv not found")
    trainer = ModelTrainer()
    version = trainer.train(dataset_path, ModelType.RANDOM_FOREST)
    assert version.metrics.accuracy >= 0.80


# ── Property-based test ───────────────────────────────────────────────────────

@settings(max_examples=15, deadline=30000)
@given(st.integers(min_value=100, max_value=500))
def test_property_training_always_produces_valid_metrics(n_rows):
    """Property: training on any valid dataset always produces all 4 required metrics."""
    import tempfile, os
    df = make_dataset(n_rows)
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
        df.to_csv(f, index=False)
        path = f.name
    try:
        trainer = ModelTrainer()
        version = trainer.train(path, ModelType.RANDOM_FOREST)
        m = version.metrics
        assert m.mae >= 0
        assert m.rmse >= 0
        assert m.r2 <= 1.0
        assert 0.0 <= m.accuracy <= 1.0
    finally:
        os.unlink(path)
