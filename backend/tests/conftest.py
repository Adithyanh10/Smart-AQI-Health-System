"""Pytest fixtures for the Smart AQI Health Impact Analysis System backend tests."""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

import pandas as pd
import pytest
from starlette.testclient import TestClient

# Resolve paths relative to this file so tests work regardless of cwd
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_DATASET_PATH = _BACKEND_DIR.parent / "dataset" / "air_quality.csv"


@pytest.fixture(scope="session")
def test_client():
    """Starlette TestClient wrapping the FastAPI app.

    Uses a temporary models directory so tests don't pollute the real models/
    folder and don't trigger the full startup training pipeline.
    """
    with tempfile.TemporaryDirectory() as tmp_models_dir:
        # Point the app at a temp models dir and the real dataset
        os.environ["MODELS_DIR"] = tmp_models_dir
        os.environ["DATASET_PATH"] = str(_DATASET_PATH)

        # Import app *after* setting env vars so Settings picks them up
        from app.main import app

        with TestClient(app, raise_server_exceptions=True) as client:
            yield client


@pytest.fixture(scope="session")
def trained_model_fixture():
    """Train a RandomForest model on a 100-row subset of the dataset.

    Returns the ModelVersion produced by ModelTrainer.train().
    The model artifact is written to a temporary directory that is cleaned up
    after the test session.
    """
    with tempfile.TemporaryDirectory() as tmp_models_dir:
        # Load and subset the dataset
        df = pd.read_csv(_DATASET_PATH)
        subset = df.head(100)

        # Write the subset to a temp CSV
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".csv", delete=False
        ) as tmp_csv:
            subset.to_csv(tmp_csv, index=False)
            tmp_csv_path = tmp_csv.name

        try:
            from app.ml.trainer import ModelTrainer
            from app.schemas.enums import ModelType

            trainer = ModelTrainer(models_dir=tmp_models_dir)
            version = trainer.train(tmp_csv_path, ModelType.RANDOM_FOREST)
            yield version
        finally:
            os.unlink(tmp_csv_path)


@pytest.fixture
def sample_pollutant_input() -> dict:
    """A valid dict of pollutant values using the alias field names expected by PollutantInput."""
    return {
        "PM2.5": 55.0,
        "PM10": 110.0,
        "NO2": 45.0,
        "SO2": 20.0,
        "CO": 1.5,
        "O3": 60.0,
    }
