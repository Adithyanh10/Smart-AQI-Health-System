"""Property-based tests for JSON serialization round-trips.

Properties covered:
  - Property 4:  Pollutant input JSON round-trip preserves all field values
  - Property 10: Health impact JSON round-trip preserves structure
"""

from __future__ import annotations

import pytest
from hypothesis import HealthCheck, given, settings
from hypothesis import strategies as st

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

VALID_CATEGORIES = [
    "Good",
    "Moderate",
    "Unhealthy for Sensitive Groups",
    "Unhealthy",
    "Very Unhealthy",
    "Hazardous",
]

_HEALTH_IMPACT_BASE_URL = "/api/v1/health-impact"


def _health_impact_url(category: str) -> str:
    """Build the health-impact URL, percent-encoding spaces."""
    return f"{_HEALTH_IMPACT_BASE_URL}/{category.replace(' ', '%20')}"


# ---------------------------------------------------------------------------
# Strategies
# ---------------------------------------------------------------------------

valid_pollutant = st.floats(
    min_value=0.0, max_value=5000.0, allow_nan=False, allow_infinity=False
)

valid_pollutant_dict = st.fixed_dictionaries(
    {
        "PM2.5": valid_pollutant,
        "PM10": valid_pollutant,
        "NO2": valid_pollutant,
        "SO2": valid_pollutant,
        "CO": valid_pollutant,
        "O3": valid_pollutant,
    }
)


# ===========================================================================
# Property 4: Pollutant input JSON round-trip preserves all field values
# Validates: Requirements 11.3
# ===========================================================================


@given(pollutants=valid_pollutant_dict)
@settings(max_examples=5, suppress_health_check=[HealthCheck.too_slow], deadline=None)
def test_pollutant_input_json_roundtrip_preserves_field_values(pollutants):
    """**Validates: Requirements 11.3**

    For any valid PollutantInput with values in [0, 5000], serializing to JSON
    with model_dump_json() then deserializing with model_validate_json() SHALL
    produce an object with field values equal to the original within 1e-9.
    """
    from app.schemas.prediction import PollutantInput

    obj = PollutantInput(**pollutants)
    serialized = obj.model_dump_json()
    deserialized = PollutantInput.model_validate_json(serialized)

    for field in ("pm25", "pm10", "no2", "so2", "co", "o3"):
        original_val = getattr(obj, field)
        roundtrip_val = getattr(deserialized, field)
        assert abs(original_val - roundtrip_val) < 1e-9, (
            f"Field '{field}': original={original_val}, "
            f"round-trip={roundtrip_val}, diff={abs(original_val - roundtrip_val)}"
        )


# ===========================================================================
# Property 10: Health impact JSON round-trip preserves structure
# Validates: Requirements 11.9
# ===========================================================================


@given(category=st.sampled_from(VALID_CATEGORIES))
@settings(max_examples=5, suppress_health_check=[HealthCheck.too_slow], deadline=None)
def test_health_impact_json_roundtrip_preserves_structure(category, test_client):
    """**Validates: Requirements 11.9**

    For any valid AQI category, serializing the HealthImpactResponse to JSON
    and deserializing it SHALL produce an object with identical organ names,
    identical risk_level values, and identical prevention_tips and precautions
    list lengths for each organ.
    """
    from app.schemas.health_impact import HealthImpactResponse

    response = test_client.get(_health_impact_url(category))
    assert response.status_code == 200, response.text

    # Build HealthImpactResponse from the API response body
    original = HealthImpactResponse.model_validate(response.json())

    # Serialize → deserialize round-trip
    serialized = original.model_dump_json()
    deserialized = HealthImpactResponse.model_validate_json(serialized)

    # Organ names must be identical (same order and values)
    original_names = [o.organ for o in original.organs]
    roundtrip_names = [o.organ for o in deserialized.organs]
    assert original_names == roundtrip_names, (
        f"Organ names differ after round-trip: {original_names} vs {roundtrip_names}"
    )

    # Risk levels must be identical for each organ
    for orig_organ, rt_organ in zip(original.organs, deserialized.organs):
        assert orig_organ.risk_level == rt_organ.risk_level, (
            f"Organ '{orig_organ.organ}': risk_level changed from "
            f"'{orig_organ.risk_level}' to '{rt_organ.risk_level}' after round-trip"
        )

        # Tip list lengths must be identical
        assert len(orig_organ.prevention_tips) == len(rt_organ.prevention_tips), (
            f"Organ '{orig_organ.organ}': prevention_tips length changed from "
            f"{len(orig_organ.prevention_tips)} to {len(rt_organ.prevention_tips)}"
        )
        assert len(orig_organ.precautions) == len(rt_organ.precautions), (
            f"Organ '{orig_organ.organ}': precautions length changed from "
            f"{len(orig_organ.precautions)} to {len(rt_organ.precautions)}"
        )

