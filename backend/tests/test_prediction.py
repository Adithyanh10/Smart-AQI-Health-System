"""Property-based and unit tests for POST /api/v1/predict.

Properties covered:
  - Property 1:  Valid prediction returns numeric AQI and valid category
  - Property 2:  Missing pollutant fields produce HTTP 422
  - Property 3:  Out-of-range pollutant values produce HTTP 422 (Pydantic ge/le)
  - Property 11: Prediction response floats rounded to ≤4 decimal places
  - Property 12: Identical inputs within TTL return cached response
"""

from __future__ import annotations

import itertools
import math

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

FIELD_NAMES = ["PM2.5", "PM10", "NO2", "SO2", "CO", "O3"]

# ---------------------------------------------------------------------------
# Hypothesis strategies
# ---------------------------------------------------------------------------

_valid_pollutant = st.floats(
    min_value=0.0,
    max_value=5000.0,
    allow_nan=False,
    allow_infinity=False,
)

valid_pollutant_input = st.fixed_dictionaries(
    {
        "PM2.5": _valid_pollutant,
        "PM10": _valid_pollutant,
        "NO2": _valid_pollutant,
        "SO2": _valid_pollutant,
        "CO": _valid_pollutant,
        "O3": _valid_pollutant,
    }
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_PREDICT_URL = "/api/v1/predict"


def _decimal_places(v: float) -> int:
    """Return the number of decimal places in the string representation of v."""
    if math.isnan(v) or math.isinf(v):
        return 0
    s = f"{v}"
    return len(s.split(".")[1]) if "." in s else 0


# ===========================================================================
# Property 1: Valid prediction returns numeric AQI and valid category
# Validates: Requirements 1.2
# ===========================================================================


@given(pollutants=valid_pollutant_input)
@settings(max_examples=5, suppress_health_check=[HealthCheck.too_slow], deadline=None)
def test_valid_prediction_returns_aqi_and_category(pollutants, test_client):
    """**Validates: Requirements 1.2**

    For any valid set of pollutant values (all six fields, each in [0, 5000]),
    the endpoint SHALL return HTTP 200 with a non-negative numeric AQI and a
    valid AQI category string.
    """
    response = test_client.post(_PREDICT_URL, json=pollutants)
    assert response.status_code == 200, response.text
    data = response.json()
    assert isinstance(data["aqi"], (int, float))
    assert data["aqi"] >= 0
    assert data["aqi_category"] in VALID_CATEGORIES


# ===========================================================================
# Property 2: Missing pollutant fields produce HTTP 422
# Validates: Requirements 1.3
# ===========================================================================


@given(present_fields=st.frozensets(st.sampled_from(FIELD_NAMES), min_size=1, max_size=5))
@settings(max_examples=5, suppress_health_check=[HealthCheck.too_slow], deadline=None)
def test_missing_pollutant_fields_returns_422(present_fields, test_client):
    """**Validates: Requirements 1.3**

    For any non-empty strict subset of the six required pollutant fields,
    submitting a prediction request with only those fields SHALL return HTTP 422,
    and the response body SHALL identify at least one of the missing field names.
    """
    # Build a partial payload with only the present fields
    partial_input = {field: 50.0 for field in present_fields}

    response = test_client.post(_PREDICT_URL, json=partial_input)
    assert response.status_code == 422, (
        f"Expected 422 for partial input {set(present_fields)}, got {response.status_code}: {response.text}"
    )

    # The response body should mention at least one missing field
    missing_fields = set(FIELD_NAMES) - set(present_fields)
    body_text = response.text
    assert any(field in body_text for field in missing_fields), (
        f"Response body does not identify any missing field. Missing: {missing_fields}. Body: {body_text}"
    )


# ===========================================================================
# Property 3: Out-of-range pollutant values produce HTTP 422 (Pydantic ge/le)
# Validates: Requirements 1.4
# ===========================================================================

_negative_float = st.floats(max_value=-0.001, allow_nan=False, allow_infinity=False)
_over_max_float = st.floats(min_value=5000.001, allow_nan=False, allow_infinity=False)
_out_of_range_float = st.one_of(_negative_float, _over_max_float)


@given(
    bad_field=st.sampled_from(FIELD_NAMES),
    bad_value=_out_of_range_float,
)
@settings(max_examples=5, suppress_health_check=[HealthCheck.too_slow], deadline=None)
def test_out_of_range_pollutant_returns_422(bad_field, bad_value, test_client):
    """**Validates: Requirements 1.4**

    For any pollutant input where at least one field is negative or exceeds 5000,
    the endpoint SHALL return HTTP 422 (Pydantic v2 ge/le validation), and the
    response body SHALL identify the offending field.
    """
    # Start with a valid payload, then inject the bad value
    payload = {
        "PM2.5": 50.0,
        "PM10": 100.0,
        "NO2": 40.0,
        "SO2": 20.0,
        "CO": 1.0,
        "O3": 60.0,
    }
    payload[bad_field] = bad_value

    response = test_client.post(_PREDICT_URL, json=payload)
    assert response.status_code == 422, (
        f"Expected 422 for {bad_field}={bad_value}, got {response.status_code}: {response.text}"
    )

    # The response body should reference the offending field
    body_text = response.text
    assert bad_field in body_text, (
        f"Response body does not identify offending field '{bad_field}'. Body: {body_text}"
    )


# ===========================================================================
# Property 11: Prediction response floats rounded to ≤4 decimal places
# Validates: Requirements 11.7
# ===========================================================================


@given(pollutants=valid_pollutant_input)
@settings(max_examples=5, suppress_health_check=[HealthCheck.too_slow], deadline=None)
def test_prediction_floats_max_4_decimal_places(pollutants, test_client):
    """**Validates: Requirements 11.7**

    For any valid pollutant input, the `aqi`, `confidence_interval.lower`,
    `confidence_interval.upper`, and all `feature_importance` values in the
    prediction response SHALL have at most 4 decimal places when serialized to JSON.
    """
    response = test_client.post(_PREDICT_URL, json=pollutants)
    assert response.status_code == 200, response.text
    data = response.json()

    assert _decimal_places(data["aqi"]) <= 4, (
        f"aqi={data['aqi']} has more than 4 decimal places"
    )
    assert _decimal_places(data["confidence_interval"]["lower"]) <= 4, (
        f"CI lower={data['confidence_interval']['lower']} has more than 4 decimal places"
    )
    assert _decimal_places(data["confidence_interval"]["upper"]) <= 4, (
        f"CI upper={data['confidence_interval']['upper']} has more than 4 decimal places"
    )
    for item in data["feature_importance"]:
        assert _decimal_places(item["importance"]) <= 4, (
            f"feature_importance[{item['feature']}]={item['importance']} has more than 4 decimal places"
        )


# ===========================================================================
# Property 12: Identical inputs within TTL return cached response
# Validates: Requirements 20.1
# ===========================================================================

# Counter used to generate unique IPs per hypothesis example, avoiding the
# rate limiter (100 req/min per IP) when Hypothesis runs many examples.
_ip_counter = itertools.count(1)


@given(pollutants=valid_pollutant_input)
@settings(max_examples=5, suppress_health_check=[HealthCheck.too_slow], deadline=None)
def test_identical_inputs_within_ttl_return_cached_response(pollutants, test_client):
    """**Validates: Requirements 20.1**

    For any valid pollutant input, submitting the same prediction request twice
    within 60 seconds SHALL return responses with identical `aqi`, `aqi_category`,
    and `model_id` values, and the second response SHALL have `cached: true`.
    """
    # Use a unique IP per example so the rate limiter never blocks us.
    # Two consecutive counter values give us a stable unique IP for both calls.
    n = next(_ip_counter)
    unique_ip = f"10.{(n >> 8) & 0xFF}.{n & 0xFF}.1"
    headers = {"X-Forwarded-For": unique_ip}

    first = test_client.post(_PREDICT_URL, json=pollutants, headers=headers)
    assert first.status_code == 200, first.text
    first_data = first.json()

    second = test_client.post(_PREDICT_URL, json=pollutants, headers=headers)
    assert second.status_code == 200, second.text
    second_data = second.json()

    assert second_data["cached"] is True, (
        f"Second response should be cached but cached={second_data['cached']}"
    )
    assert second_data["aqi"] == first_data["aqi"], (
        f"AQI mismatch: {first_data['aqi']} vs {second_data['aqi']}"
    )
    assert second_data["aqi_category"] == first_data["aqi_category"], (
        f"Category mismatch: {first_data['aqi_category']} vs {second_data['aqi_category']}"
    )
    assert second_data["model_id"] == first_data["model_id"], (
        f"model_id mismatch: {first_data['model_id']} vs {second_data['model_id']}"
    )


# ===========================================================================
# Unit tests: edge cases
# ===========================================================================


def test_boundary_value_zero(test_client):
    """All pollutants at 0.0 (lower boundary) should return HTTP 200."""
    payload = {field: 0.0 for field in FIELD_NAMES}
    response = test_client.post(_PREDICT_URL, json=payload)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["aqi"] >= 0
    assert data["aqi_category"] in VALID_CATEGORIES


def test_boundary_value_max(test_client):
    """All pollutants at 5000.0 (upper boundary) should return HTTP 200."""
    payload = {field: 5000.0 for field in FIELD_NAMES}
    response = test_client.post(_PREDICT_URL, json=payload)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["aqi"] >= 0
    assert data["aqi_category"] in VALID_CATEGORIES


def test_float_precision_input(test_client):
    """High-precision float inputs should be accepted and response floats stay ≤4 dp."""
    payload = {
        "PM2.5": 12.123456789,
        "PM10": 24.987654321,
        "NO2": 5.111111111,
        "SO2": 3.999999999,
        "CO": 0.123456789,
        "O3": 77.777777777,
    }
    response = test_client.post(_PREDICT_URL, json=payload)
    assert response.status_code == 200, response.text
    data = response.json()
    assert _decimal_places(data["aqi"]) <= 4


def test_all_zero_inputs(test_client):
    """All-zero inputs are valid and should produce a 'Good' or low-AQI category."""
    payload = {field: 0.0 for field in FIELD_NAMES}
    response = test_client.post(_PREDICT_URL, json=payload)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["aqi"] >= 0
    assert data["aqi_category"] in VALID_CATEGORIES


def test_single_field_missing_returns_422(test_client):
    """Omitting exactly one field should return HTTP 422."""
    for missing_field in FIELD_NAMES:
        payload = {f: 50.0 for f in FIELD_NAMES if f != missing_field}
        response = test_client.post(_PREDICT_URL, json=payload)
        assert response.status_code == 422, (
            f"Expected 422 when '{missing_field}' is missing, got {response.status_code}"
        )
        assert missing_field in response.text, (
            f"Response body should mention missing field '{missing_field}'"
        )


def test_negative_value_rejected(test_client):
    """A single negative pollutant value should return HTTP 422."""
    payload = {
        "PM2.5": -1.0,
        "PM10": 100.0,
        "NO2": 40.0,
        "SO2": 20.0,
        "CO": 1.0,
        "O3": 60.0,
    }
    response = test_client.post(_PREDICT_URL, json=payload)
    assert response.status_code == 422, response.text


def test_over_max_value_rejected(test_client):
    """A single over-max pollutant value should return HTTP 422."""
    payload = {
        "PM2.5": 5001.0,
        "PM10": 100.0,
        "NO2": 40.0,
        "SO2": 20.0,
        "CO": 1.0,
        "O3": 60.0,
    }
    response = test_client.post(_PREDICT_URL, json=payload)
    assert response.status_code == 422, response.text

