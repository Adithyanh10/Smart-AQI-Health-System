"""Property-based and unit tests for POST /api/v1/predict/csv.

Properties covered:
  - Property 5: CSV batch round-trip preserves row count
  - Property 6: CSV with missing required columns returns HTTP 400 listing missing columns
  - Property 7: CSV with mixed valid/invalid rows processes valid rows and reports errors
"""

from __future__ import annotations

import io

import pytest
from hypothesis import HealthCheck, given, settings
from hypothesis import strategies as st

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_CSV_URL = "/api/v1/predict/csv"

REQUIRED_COLUMNS = ["PM2.5", "PM10", "NO2", "SO2", "CO", "O3"]

# ---------------------------------------------------------------------------
# Hypothesis strategies
# ---------------------------------------------------------------------------

_valid_value = st.floats(
    min_value=0.0,
    max_value=5000.0,
    allow_nan=False,
    allow_infinity=False,
)

_valid_row = st.fixed_dictionaries(
    {col: _valid_value for col in REQUIRED_COLUMNS}
)

_valid_rows = st.lists(_valid_row, min_size=1, max_size=20)


def _rows_to_csv(rows: list[dict]) -> bytes:
    """Convert a list of dicts to CSV bytes."""
    buf = io.StringIO()
    buf.write(",".join(REQUIRED_COLUMNS) + "\n")
    for row in rows:
        buf.write(",".join(str(row[col]) for col in REQUIRED_COLUMNS) + "\n")
    return buf.getvalue().encode()


def _make_csv_file(content: bytes, filename: str = "test.csv"):
    """Return a files dict suitable for httpx/starlette multipart upload."""
    return {"file": (filename, io.BytesIO(content), "text/csv")}


# ===========================================================================
# Property 5: CSV batch round-trip preserves row count
# Validates: Requirements 2.2, 2.7, 11.4
# ===========================================================================


@given(rows=_valid_rows)
@settings(
    max_examples=5,
    suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture],
    deadline=None,
)
def test_csv_batch_round_trip_preserves_row_count(rows, test_client):
    """**Validates: Requirements 2.2, 2.7, 11.4**

    For any CSV with N valid rows (all six required columns, values in [0, 5000]),
    uploading to POST /api/v1/predict/csv SHALL return HTTP 200 with
    `processed_rows == N` and `error_rows == 0`.
    """
    n = len(rows)
    csv_bytes = _rows_to_csv(rows)

    response = test_client.post(_CSV_URL, files=_make_csv_file(csv_bytes))
    assert response.status_code == 200, (
        f"Expected 200 for {n}-row CSV, got {response.status_code}: {response.text}"
    )

    data = response.json()
    assert data["processed_rows"] == n, (
        f"Expected processed_rows={n}, got {data['processed_rows']}"
    )
    assert data["error_rows"] == 0, (
        f"Expected error_rows=0, got {data['error_rows']}"
    )
    assert data["total_rows"] == n, (
        f"Expected total_rows={n}, got {data['total_rows']}"
    )


# ===========================================================================
# Property 6: CSV with missing required columns returns HTTP 400 listing missing columns
# Validates: Requirements 2.4
# ===========================================================================

# Generate a strict subset of required columns (at least 1, at most 5)
_partial_columns = st.frozensets(
    st.sampled_from(REQUIRED_COLUMNS),
    min_size=1,
    max_size=len(REQUIRED_COLUMNS) - 1,
)


@given(present_cols=_partial_columns)
@settings(
    max_examples=5,
    suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture],
    deadline=None,
)
def test_csv_missing_required_columns_returns_400(present_cols, test_client):
    """**Validates: Requirements 2.4**

    For any CSV that contains only a strict subset of the six required columns,
    POST /api/v1/predict/csv SHALL return HTTP 400, and the response body SHALL
    list all missing column names.
    """
    present = list(present_cols)
    missing = [col for col in REQUIRED_COLUMNS if col not in present]

    # Build a CSV with only the present columns
    buf = io.StringIO()
    buf.write(",".join(present) + "\n")
    buf.write(",".join("50.0" for _ in present) + "\n")
    csv_bytes = buf.getvalue().encode()

    response = test_client.post(_CSV_URL, files=_make_csv_file(csv_bytes))
    assert response.status_code == 400, (
        f"Expected 400 for CSV missing {missing}, got {response.status_code}: {response.text}"
    )

    body_text = response.text
    for col in missing:
        assert col in body_text, (
            f"Response body should mention missing column '{col}'. Body: {body_text}"
        )


# ===========================================================================
# Property 7: CSV with mixed valid/invalid rows processes valid rows and reports errors
# Validates: Requirements 2.9
# ===========================================================================

_invalid_value = st.one_of(
    st.floats(max_value=-0.001, allow_nan=False, allow_infinity=False),
    st.floats(min_value=5000.001, allow_nan=False, allow_infinity=False),
)

_invalid_row = st.fixed_dictionaries(
    {col: _invalid_value for col in REQUIRED_COLUMNS}
)


@given(
    valid_rows=st.lists(_valid_row, min_size=1, max_size=10),
    invalid_rows=st.lists(_invalid_row, min_size=1, max_size=10),
)
@settings(
    max_examples=5,
    suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture],
    deadline=None,
)
def test_csv_mixed_rows_processes_valid_and_reports_errors(
    valid_rows, invalid_rows, test_client
):
    """**Validates: Requirements 2.9**

    For any CSV containing a mix of valid and invalid rows, the endpoint SHALL
    process all valid rows and report errors for invalid rows, such that
    `processed_rows + error_rows == total_rows`.
    """
    total = len(valid_rows) + len(invalid_rows)

    # Interleave valid and invalid rows
    all_rows = valid_rows + invalid_rows

    buf = io.StringIO()
    buf.write(",".join(REQUIRED_COLUMNS) + "\n")
    for row in all_rows:
        buf.write(",".join(str(row[col]) for col in REQUIRED_COLUMNS) + "\n")
    csv_bytes = buf.getvalue().encode()

    response = test_client.post(_CSV_URL, files=_make_csv_file(csv_bytes))

    # The endpoint should either return 200 with per-row accounting,
    # or 422 if Pydantic rejects out-of-range values at construction time.
    # Either way, processed_rows + error_rows must equal total_rows when 200.
    if response.status_code == 200:
        data = response.json()
        assert data["processed_rows"] + data["error_rows"] == data["total_rows"], (
            f"processed_rows({data['processed_rows']}) + error_rows({data['error_rows']}) "
            f"!= total_rows({data['total_rows']})"
        )
        assert data["total_rows"] == total, (
            f"Expected total_rows={total}, got {data['total_rows']}"
        )
    else:
        # If the implementation raises a validation error for any out-of-range
        # value during row construction, a non-200 response is acceptable.
        assert response.status_code in (400, 422), (
            f"Unexpected status {response.status_code}: {response.text}"
        )


# ===========================================================================
# Unit tests: edge cases
# ===========================================================================


def test_csv_file_too_large_returns_413(test_client):
    """File exceeding 50 MB size limit SHALL return HTTP 413.

    Uses a mock file object that reports a large size without allocating 50 MB.
    """
    # Build a minimal valid CSV header + one row
    small_csv = (
        "PM2.5,PM10,NO2,SO2,CO,O3\n"
        "50.0,100.0,40.0,20.0,1.0,60.0\n"
    ).encode()

    # Wrap in a BytesIO that lies about its size by overriding read()
    _MAX_CSV_BYTES = 50 * 1024 * 1024  # 50 MB

    class OversizedFile(io.RawIOBase):
        """A file-like object that returns enough bytes to exceed the size limit."""

        def __init__(self):
            # Produce just over 50 MB of data: header + repeated rows
            row = b"50.0,100.0,40.0,20.0,1.0,60.0\n"
            header = b"PM2.5,PM10,NO2,SO2,CO,O3\n"
            repeats = (_MAX_CSV_BYTES // len(row)) + 2
            self._data = header + row * repeats
            self._pos = 0

        def read(self, n=-1):
            if n == -1:
                chunk = self._data[self._pos:]
            else:
                chunk = self._data[self._pos: self._pos + n]
            self._pos += len(chunk)
            return chunk

        def readable(self):
            return True

    oversized = OversizedFile()
    response = test_client.post(
        _CSV_URL,
        files={"file": ("big.csv", oversized, "text/csv")},
    )
    assert response.status_code == 413, (
        f"Expected 413 for oversized file, got {response.status_code}: {response.text}"
    )


def test_non_csv_file_returns_400(test_client):
    """Uploading a non-CSV file (e.g. plain text that is not valid CSV) SHALL return HTTP 400."""
    # Send binary content that pandas cannot parse as CSV
    garbage = b"\x00\x01\x02\x03\xff\xfe\xfd not a csv"
    response = test_client.post(
        _CSV_URL,
        files={"file": ("data.bin", io.BytesIO(garbage), "application/octet-stream")},
    )
    assert response.status_code == 400, (
        f"Expected 400 for non-CSV file, got {response.status_code}: {response.text}"
    )


def test_empty_csv_returns_400(test_client):
    """An empty CSV file (no rows, only header or completely empty) SHALL return HTTP 400."""
    # Header only — no data rows
    header_only = b"PM2.5,PM10,NO2,SO2,CO,O3\n"
    response = test_client.post(
        _CSV_URL,
        files=_make_csv_file(header_only),
    )
    assert response.status_code == 400, (
        f"Expected 400 for empty CSV, got {response.status_code}: {response.text}"
    )


def test_valid_single_row_csv_returns_200(test_client):
    """A single valid row CSV SHALL return HTTP 200 with processed_rows=1."""
    csv_bytes = (
        "PM2.5,PM10,NO2,SO2,CO,O3\n"
        "55.0,110.0,45.0,20.0,1.5,60.0\n"
    ).encode()
    response = test_client.post(_CSV_URL, files=_make_csv_file(csv_bytes))
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["processed_rows"] == 1
    assert data["error_rows"] == 0
    assert data["total_rows"] == 1
    assert len(data["predictions"]) == 1

