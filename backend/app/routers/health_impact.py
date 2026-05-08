"""Health impact router: organ-level risk by AQI category."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from app.dependencies import get_health_engine
from app.schemas.enums import AQICategory
from app.schemas.health_impact import ComparisonResult, HealthImpactResponse
from app.services.health_impact_engine import HealthImpactEngine

router = APIRouter(tags=["Health Impact"])

_VALID_CATEGORIES = [c.value for c in AQICategory]


def _parse_category(value: str) -> AQICategory:
    try:
        return AQICategory(value)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid AQI category '{value}'. Valid values: {_VALID_CATEGORIES}",
        )


@router.get("/health-impact/compare", response_model=ComparisonResult)
async def compare_health_impact(
    from_cat: str = Query(..., alias="from_cat"),
    to_cat: str = Query(..., alias="to_cat"),
    engine: HealthImpactEngine = Depends(get_health_engine),
) -> ComparisonResult:
    from_category = _parse_category(from_cat)
    to_category = _parse_category(to_cat)
    return engine.get_comparison(from_category, to_category)


@router.get("/health-impact/{aqi_category}", response_model=HealthImpactResponse)
async def get_health_impact(
    aqi_category: str,
    engine: HealthImpactEngine = Depends(get_health_engine),
) -> HealthImpactResponse:
    category = _parse_category(aqi_category)
    organs = engine.get_impact(category)
    return HealthImpactResponse(aqi_category=category, organs=organs)
