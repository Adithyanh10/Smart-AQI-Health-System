"""AQI live router: latest reading and SSE stream."""

from __future__ import annotations

import asyncio
import time
from datetime import datetime, timezone

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Request
from sse_starlette.sse import EventSourceResponse

from app.config import settings
from app.dependencies import get_prediction_service, get_sse_broadcaster
from app.schemas.enums import AQICategory
from app.schemas.model import LiveAQIResponse
from app.schemas.prediction import PollutantInput
from app.services.prediction_service import PredictionService
from app.services.sse_broadcaster import SSEBroadcaster

router = APIRouter(tags=["AQI Live"])


@router.get("/aqi/live", response_model=LiveAQIResponse)
async def get_live_aqi(
    request: Request,
    service: PredictionService = Depends(get_prediction_service),
) -> LiveAQIResponse:
    try:
        df = pd.read_csv(settings.DATASET_PATH)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not read dataset: {exc}") from exc

    if df.empty:
        raise HTTPException(status_code=500, detail="Dataset is empty.")

    last_row = df.iloc[-1]

    pollutants = PollutantInput(**{
        "PM2.5": float(last_row["PM2.5"]),
        "PM10": float(last_row["PM10"]),
        "NO2": float(last_row["NO2"]),
        "SO2": float(last_row["SO2"]),
        "CO": float(last_row["CO"]),
        "O3": float(last_row["O3"]),
    })

    client_ip = request.client.host if request.client else "unknown"
    t0 = time.monotonic()
    prediction = service.predict(pollutants, client_ip=client_ip)
    latency_ms = int((time.monotonic() - t0) * 1000)

    return LiveAQIResponse(
        aqi=prediction.aqi,
        aqi_category=prediction.aqi_category,
        pollutants=pollutants,
        timestamp=datetime.now(timezone.utc),
        latency_ms=latency_ms,
    )


@router.get("/aqi/stream")
async def stream_aqi(
    request: Request,
    broadcaster: SSEBroadcaster = Depends(get_sse_broadcaster),
) -> EventSourceResponse:
    return EventSourceResponse(broadcaster.stream(request))


@router.get("/aqi/location")
async def get_aqi_by_location(lat: float, lng: float) -> dict:
    """
    Proxy endpoint: fetches real air quality data from Open-Meteo for given
    coordinates and returns pollutant values ready for prediction.
    Also reverse-geocodes the coordinates via Nominatim.
    No API key required — Open-Meteo is free for non-commercial use.
    """
    import httpx

    aq_url = (
        "https://air-quality-api.open-meteo.com/v1/air-quality"
        f"?latitude={lat:.4f}&longitude={lng:.4f}"
        "&hourly=pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,ozone"
        "&timezone=auto&forecast_days=1"
    )

    geo_url = (
        f"https://nominatim.openstreetmap.org/reverse"
        f"?lat={lat:.6f}&lon={lng:.6f}&format=json&addressdetails=1"
    )

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            aq_resp, geo_resp = await asyncio.gather(
                client.get(aq_url),
                client.get(geo_url, headers={
                    "User-Agent": "AQIHealthApp/1.0 (educational project)",
                    "Accept-Language": "en",
                }),
            )
            aq_resp.raise_for_status()
            aq_data  = aq_resp.json()
            geo_data = geo_resp.json() if geo_resp.status_code == 200 else {}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch data: {exc}") from exc

    hourly = aq_data.get("hourly", {})

    from datetime import datetime
    hour_index = datetime.now().hour

    def pick(arr: list, idx: int) -> float:
        if not arr:
            return 0.0
        val = arr[idx] if idx < len(arr) else arr[0]
        return max(0.0, round(float(val or 0), 2))

    # Parse address
    addr    = geo_data.get("address", {})
    city    = (addr.get("city") or addr.get("town") or addr.get("village") or
               addr.get("suburb") or addr.get("county") or addr.get("district") or "Unknown")
    state   = addr.get("state") or addr.get("state_district") or ""
    country = addr.get("country") or ""

    return {
        "PM2.5": pick(hourly.get("pm2_5", []), hour_index),
        "PM10":  pick(hourly.get("pm10", []), hour_index),
        "NO2":   pick(hourly.get("nitrogen_dioxide", []), hour_index),
        "SO2":   pick(hourly.get("sulphur_dioxide", []), hour_index),
        "CO":    pick(hourly.get("carbon_monoxide", []), hour_index),
        "O3":    pick(hourly.get("ozone", []), hour_index),
        "city":    city,
        "state":   state,
        "country": country,
    }
