"""Tests for InMemoryCache — TTL, key generation, flush."""
import time
import pytest
from app.services.cache import InMemoryCache


@pytest.fixture
def cache():
    return InMemoryCache(default_ttl=1)  # 1-second TTL for fast tests


def test_set_and_get_within_ttl(cache):
    cache.set("k1", {"aqi": 42}, ttl=5)
    result = cache.get("k1")
    assert result == {"aqi": 42}


def test_get_after_ttl_returns_none(cache):
    cache.set("k2", "value", ttl=1)
    time.sleep(1.1)
    assert cache.get("k2") is None


def test_get_missing_key_returns_none(cache):
    assert cache.get("nonexistent") is None


def test_delete_removes_entry(cache):
    cache.set("k3", "hello", ttl=10)
    cache.delete("k3")
    assert cache.get("k3") is None


def test_flush_returns_eviction_count(cache):
    cache.set("a", 1, ttl=10)
    cache.set("b", 2, ttl=10)
    cache.set("c", 3, ttl=10)
    evicted = cache.flush()
    assert evicted == 3
    assert cache.get("a") is None
    assert cache.get("b") is None


def test_flush_empty_cache_returns_zero(cache):
    assert cache.flush() == 0


def test_different_inputs_produce_different_keys(cache):
    key1 = cache._build_key({"PM2.5": 10, "PM10": 20})
    key2 = cache._build_key({"PM2.5": 10, "PM10": 99})
    assert key1 != key2


def test_same_inputs_produce_same_key(cache):
    key1 = cache._build_key({"PM2.5": 10, "PM10": 20, "NO2": 5})
    key2 = cache._build_key({"NO2": 5, "PM10": 20, "PM2.5": 10})  # different order
    assert key1 == key2


def test_overwrite_resets_ttl(cache):
    cache.set("k4", "old", ttl=1)
    time.sleep(0.6)
    cache.set("k4", "new", ttl=5)  # reset with longer TTL
    time.sleep(0.6)
    assert cache.get("k4") == "new"  # should still be alive


def test_cache_stores_complex_objects(cache):
    obj = {"aqi": 123.4, "organs": [{"organ": "Lungs", "risk": "High"}], "nested": {"a": 1}}
    cache.set("complex", obj, ttl=10)
    assert cache.get("complex") == obj
