"""Structured JSON-lines audit logger for predictions and errors."""

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.schemas.prediction import PollutantInput, PredictionResponse


class AuditLogger:
    def __init__(self, log_dir: str = "logs") -> None:
        self._log_path = Path(log_dir) / "audit.jsonl"
        self._log_path.parent.mkdir(parents=True, exist_ok=True)

    def _write(self, record: dict) -> None:
        with self._log_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(record, default=str) + "\n")

    def log_prediction(
        self,
        ip: str,
        input: "PollutantInput",
        output: "PredictionResponse",
    ) -> None:
        record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": "prediction",
            "client_ip": ip,
            "path": "/api/v1/predict",
            "status": 200,
            "input": {
                "PM2.5": input.pm25,
                "PM10": input.pm10,
                "NO2": input.no2,
                "SO2": input.so2,
                "CO": input.co,
                "O3": input.o3,
            },
            "output": {
                "aqi": output.aqi,
                "aqi_category": output.aqi_category,
                "model_id": output.model_id,
                "cached": output.cached,
            },
        }
        self._write(record)

    def log_error(self, ip: str, path: str, status: int) -> None:
        record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": "error",
            "client_ip": ip,
            "path": path,
            "status": status,
        }
        self._write(record)
