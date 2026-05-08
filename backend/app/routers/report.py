"""Report router: generate and stream PDF reports."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from starlette.responses import StreamingResponse

from app.dependencies import get_prediction_service
from app.schemas.enums import AQICategory
from app.schemas.prediction import PollutantInput
from app.services.pdf_generator import PDFGenerator
from app.services.prediction_service import PredictionService

router = APIRouter(tags=["Report"])


@router.get("/report/pdf")
async def get_pdf_report(
    aqi: float = Query(..., description="AQI value"),
    category: str = Query(..., description="AQI category string"),
    model_id: str | None = Query(None, description="Model ID to use"),
    service: PredictionService = Depends(get_prediction_service),
) -> StreamingResponse:
    # Validate category
    try:
        aqi_category = AQICategory(category)
    except ValueError:
        valid = [c.value for c in AQICategory]
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category '{category}'. Valid values: {valid}",
        )

    # Build a synthetic PollutantInput with zeros (report is based on provided AQI)
    dummy_input = PollutantInput(**{
        "PM2.5": 0.0, "PM10": 0.0, "NO2": 0.0,
        "SO2": 0.0, "CO": 0.0, "O3": 0.0,
    })

    try:
        prediction = service.predict(dummy_input, model_id=model_id)
        # Override with the requested values
        prediction = prediction.model_copy(update={"aqi": aqi, "aqi_category": aqi_category})
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    pdf_bytes = PDFGenerator.generate(prediction)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"AQI_Report_{timestamp}.pdf"

    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
