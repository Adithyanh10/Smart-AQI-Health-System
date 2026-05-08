from __future__ import annotations

from pydantic import BaseModel, Field

from .enums import AQICategory, RiskLevel, ActionUrgency


class SensitiveGroupNotes(BaseModel):
    children: str
    elderly: str
    pregnant: str
    asthma: str
    cardiovascular: str


class OrganImpact(BaseModel):
    organ: str
    risk_level: RiskLevel
    severity_score: int = Field(..., ge=0, le=100)
    description: str
    prevention_tips: list[str]
    precautions: list[str]
    action_urgency: ActionUrgency
    sensitive_group_notes: SensitiveGroupNotes


class HealthImpactResponse(BaseModel):
    aqi_category: AQICategory
    organs: list[OrganImpact]


class OrganComparison(BaseModel):
    organ: str
    from_risk: RiskLevel
    to_risk: RiskLevel
    worsened: bool


class ComparisonResult(BaseModel):
    from_category: AQICategory
    to_category: AQICategory
    worsened_organs: list[OrganComparison]
    improved_organs: list[OrganComparison]
    unchanged_organs: list[OrganComparison]
