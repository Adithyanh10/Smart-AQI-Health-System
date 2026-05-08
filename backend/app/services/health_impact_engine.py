"""Health impact engine: maps AQI categories to organ-level risk data."""

from app.data.health_impact_data import (
    CONDITION_ORGAN_AFFINITY,
    HEALTH_IMPACT_DATA,
    RISK_ORDER,
)
from app.schemas.enums import AQICategory, RiskLevel
from app.schemas.health_impact import (
    ComparisonResult,
    HealthImpactResponse,
    OrganComparison,
    OrganImpact,
    SensitiveGroupNotes,
)

_ORGANS = ["Lungs", "Heart", "Brain", "Skin", "Eyes", "Immune System"]


class HealthImpactEngine:
    def get_impact(
        self,
        category: AQICategory,
        conditions: list[str] | None = None,
    ) -> list[OrganImpact]:
        """Return a list of 6 OrganImpact objects for the given AQI category."""
        cat_data = HEALTH_IMPACT_DATA[category.value]
        impacts: list[OrganImpact] = []

        for organ in _ORGANS:
            entry = cat_data[organ]
            base_risk = RiskLevel(entry["risk_level"])
            elevated_risk = self._elevate_risk(base_risk, organ, conditions or [])
            notes = self._get_sensitive_group_notes(organ, category)

            impacts.append(
                OrganImpact(
                    organ=organ,
                    risk_level=elevated_risk,
                    severity_score=entry["severity_score"],
                    description=entry["description"],
                    prevention_tips=entry["prevention_tips"],
                    precautions=entry["precautions"],
                    action_urgency=entry["action_urgency"],
                    sensitive_group_notes=notes,
                )
            )

        return impacts

    def get_comparison(
        self,
        from_cat: AQICategory,
        to_cat: AQICategory,
    ) -> ComparisonResult:
        """Compare organ risks between two AQI categories."""
        from_impacts = {o.organ: o for o in self.get_impact(from_cat)}
        to_impacts = {o.organ: o for o in self.get_impact(to_cat)}

        worsened: list[OrganComparison] = []
        improved: list[OrganComparison] = []
        unchanged: list[OrganComparison] = []

        for organ in _ORGANS:
            from_risk = from_impacts[organ].risk_level
            to_risk = to_impacts[organ].risk_level
            from_idx = RISK_ORDER.index(from_risk.value)
            to_idx = RISK_ORDER.index(to_risk.value)

            comparison = OrganComparison(
                organ=organ,
                from_risk=from_risk,
                to_risk=to_risk,
                worsened=to_idx > from_idx,
            )

            if to_idx > from_idx:
                worsened.append(comparison)
            elif to_idx < from_idx:
                improved.append(comparison)
            else:
                unchanged.append(comparison)

        return ComparisonResult(
            from_category=from_cat,
            to_category=to_cat,
            worsened_organs=worsened,
            improved_organs=improved,
            unchanged_organs=unchanged,
        )

    def _elevate_risk(
        self,
        base_risk: RiskLevel,
        organ: str,
        conditions: list[str],
    ) -> RiskLevel:
        """Elevate risk by one tier if any condition has affinity for this organ."""
        if not conditions:
            return base_risk

        should_elevate = any(
            organ in CONDITION_ORGAN_AFFINITY.get(condition, [])
            for condition in conditions
        )

        if not should_elevate:
            return base_risk

        current_idx = RISK_ORDER.index(base_risk.value)
        elevated_idx = min(current_idx + 1, len(RISK_ORDER) - 1)
        return RiskLevel(RISK_ORDER[elevated_idx])

    def _get_sensitive_group_notes(
        self,
        organ: str,
        category: AQICategory,
    ) -> SensitiveGroupNotes:
        """Retrieve sensitive group notes for a given organ and category."""
        notes = HEALTH_IMPACT_DATA[category.value][organ]["sensitive_group_notes"]
        return SensitiveGroupNotes(**notes)
