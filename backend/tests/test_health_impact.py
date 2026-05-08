"""Property-based and unit tests for GET /api/v1/health-impact endpoints.

Properties covered:
  - Property 8:  Health impact response contains all 6 organs with all required fields
  - Property 9:  Adjacent AQI categories produce distinct organ descriptions
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

ADJACENT_PAIRS = [
    (VALID_CATEGORIES[i], VALID_CATEGORIES[i + 1])
    for i in range(len(VALID_CATEGORIES) - 1)
]

EXPECTED_ORGANS = {"Lungs", "Heart", "Brain", "Skin", "Eyes", "Immune System"}

_BASE_URL = "/api/v1/health-impact"


def _url(category: str) -> str:
    """Build the health-impact URL, percent-encoding spaces."""
    return f"{_BASE_URL}/{category.replace(' ', '%20')}"


# ===========================================================================
# Property 8: Health impact response contains all 6 organs with all required fields
# Validates: Requirements 4.1, 4.2
# ===========================================================================


@given(category=st.sampled_from(VALID_CATEGORIES))
@settings(max_examples=5, suppress_health_check=[HealthCheck.too_slow], deadline=None)
def test_health_impact_contains_all_organs_with_required_fields(category, test_client):
    """**Validates: Requirements 4.1, 4.2**

    For any valid AQI category, the health-impact endpoint SHALL return exactly
    6 organs, each with non-empty required fields, prevention_tips >= 2,
    precautions >= 2, and severity_score in [0, 100].
    """
    response = test_client.get(_url(category))
    assert response.status_code == 200, response.text
    data = response.json()

    organs = data["organs"]
    assert len(organs) == 6, f"Expected 6 organs, got {len(organs)}"

    organ_names = {o["organ"] for o in organs}
    assert organ_names == EXPECTED_ORGANS, (
        f"Expected organs {EXPECTED_ORGANS}, got {organ_names}"
    )

    for organ in organs:
        name = organ["organ"]

        # Non-empty required string fields
        assert organ["organ"], f"organ name is empty"
        assert organ["risk_level"], f"{name}: risk_level is empty"
        assert organ["description"], f"{name}: description is empty"
        assert organ["action_urgency"], f"{name}: action_urgency is empty"

        # prevention_tips >= 2
        assert len(organ["prevention_tips"]) >= 2, (
            f"{name}: expected >= 2 prevention_tips, got {len(organ['prevention_tips'])}"
        )
        for tip in organ["prevention_tips"]:
            assert tip, f"{name}: prevention_tip is empty"

        # precautions >= 2
        assert len(organ["precautions"]) >= 2, (
            f"{name}: expected >= 2 precautions, got {len(organ['precautions'])}"
        )
        for precaution in organ["precautions"]:
            assert precaution, f"{name}: precaution is empty"

        # severity_score in [0, 100]
        score = organ["severity_score"]
        assert 0 <= score <= 100, (
            f"{name}: severity_score={score} is not in [0, 100]"
        )

        # sensitive_group_notes has all 5 groups with non-empty values
        notes = organ["sensitive_group_notes"]
        for group in ("children", "elderly", "pregnant", "asthma", "cardiovascular"):
            assert notes.get(group), f"{name}: sensitive_group_notes.{group} is empty"


# ===========================================================================
# Property 9: Adjacent AQI categories produce distinct organ descriptions
# Validates: Requirements 4.8
# ===========================================================================


@given(pair=st.sampled_from(ADJACENT_PAIRS))
@settings(max_examples=5, suppress_health_check=[HealthCheck.too_slow], deadline=None)
def test_adjacent_categories_have_distinct_organ_descriptions(pair, test_client):
    """**Validates: Requirements 4.8**

    For each pair of adjacent AQI categories, no organ description SHALL be
    identical between the two categories.
    """
    cat_a, cat_b = pair

    resp_a = test_client.get(_url(cat_a))
    resp_b = test_client.get(_url(cat_b))
    assert resp_a.status_code == 200, resp_a.text
    assert resp_b.status_code == 200, resp_b.text

    organs_a = {o["organ"]: o["description"] for o in resp_a.json()["organs"]}
    organs_b = {o["organ"]: o["description"] for o in resp_b.json()["organs"]}

    for organ in EXPECTED_ORGANS:
        desc_a = organs_a[organ]
        desc_b = organs_b[organ]
        assert desc_a != desc_b, (
            f"Organ '{organ}' has identical description for '{cat_a}' and '{cat_b}'"
        )


# ===========================================================================
# Unit tests
# ===========================================================================


def test_good_category_all_low_risk(test_client):
    """Good AQI category should return Low risk for all 6 organs."""
    response = test_client.get(_url("Good"))
    assert response.status_code == 200, response.text
    organs = response.json()["organs"]
    assert len(organs) == 6
    for organ in organs:
        assert organ["risk_level"] == "Low", (
            f"Expected Low risk for {organ['organ']} in Good category, "
            f"got {organ['risk_level']}"
        )


def test_hazardous_category_all_severe_risk(test_client):
    """Hazardous AQI category should return Severe risk for all 6 organs."""
    response = test_client.get(_url("Hazardous"))
    assert response.status_code == 200, response.text
    organs = response.json()["organs"]
    assert len(organs) == 6
    for organ in organs:
        assert organ["risk_level"] == "Severe", (
            f"Expected Severe risk for {organ['organ']} in Hazardous category, "
            f"got {organ['risk_level']}"
        )


def test_invalid_category_returns_400_with_valid_values(test_client):
    """An invalid AQI category should return HTTP 400 with a list of valid values."""
    response = test_client.get(f"{_BASE_URL}/InvalidCategory")
    assert response.status_code == 400, response.text
    body = response.json()
    detail = body.get("detail", "")
    # The error message should mention valid categories
    for cat in VALID_CATEGORIES:
        assert cat in detail, (
            f"Expected valid category '{cat}' to appear in error detail: {detail}"
        )


def test_compare_endpoint_worsened_improved_unchanged(test_client):
    """Compare Good → Hazardous: all organs should be worsened, none improved or unchanged."""
    response = test_client.get(
        f"{_BASE_URL}/compare",
        params={"from_cat": "Good", "to_cat": "Hazardous"},
    )
    assert response.status_code == 200, response.text
    data = response.json()

    assert data["from_category"] == "Good"
    assert data["to_category"] == "Hazardous"

    # All 6 organs should be worsened when going from Good to Hazardous
    assert len(data["worsened_organs"]) == 6, (
        f"Expected 6 worsened organs, got {len(data['worsened_organs'])}"
    )
    assert len(data["improved_organs"]) == 0, (
        f"Expected 0 improved organs, got {len(data['improved_organs'])}"
    )
    assert len(data["unchanged_organs"]) == 0, (
        f"Expected 0 unchanged organs, got {len(data['unchanged_organs'])}"
    )

    # Each worsened organ should have worsened=True
    for organ in data["worsened_organs"]:
        assert organ["worsened"] is True


def test_compare_same_category_all_unchanged(test_client):
    """Comparing a category to itself should return all organs as unchanged."""
    response = test_client.get(
        f"{_BASE_URL}/compare",
        params={"from_cat": "Moderate", "to_cat": "Moderate"},
    )
    assert response.status_code == 200, response.text
    data = response.json()

    assert len(data["unchanged_organs"]) == 6, (
        f"Expected 6 unchanged organs, got {len(data['unchanged_organs'])}"
    )
    assert len(data["worsened_organs"]) == 0
    assert len(data["improved_organs"]) == 0


def test_compare_hazardous_to_good_all_improved(test_client):
    """Compare Hazardous → Good: all organs should be improved."""
    response = test_client.get(
        f"{_BASE_URL}/compare",
        params={"from_cat": "Hazardous", "to_cat": "Good"},
    )
    assert response.status_code == 200, response.text
    data = response.json()

    assert len(data["improved_organs"]) == 6, (
        f"Expected 6 improved organs, got {len(data['improved_organs'])}"
    )
    assert len(data["worsened_organs"]) == 0
    assert len(data["unchanged_organs"]) == 0

