"""In-memory cache with TTL support using SHA-256 keys."""

import hashlib
import json
import time
from dataclasses import dataclass, field
from typing import Any


@dataclass
class CacheEntry:
    value: Any
    expires_at: float  # time.monotonic() timestamp


class InMemoryCache:
    def __init__(self, default_ttl: int = 60) -> None:
        self._store: dict[str, CacheEntry] = {}
        self.default_ttl = default_ttl

    def _build_key(self, data: dict) -> str:
        """Build a SHA-256 cache key from a dict, sorted for determinism."""
        serialized = json.dumps(data, sort_keys=True, default=str)
        return hashlib.sha256(serialized.encode()).hexdigest()

    def _is_expired(self, entry: CacheEntry) -> bool:
        return time.monotonic() >= entry.expires_at

    def get(self, key: str) -> Any | None:
        entry = self._store.get(key)
        if entry is None:
            return None
        if self._is_expired(entry):
            del self._store[key]
            return None
        return entry.value

    def set(self, key: str, value: Any, ttl: int | None = None) -> None:
        effective_ttl = ttl if ttl is not None else self.default_ttl
        self._store[key] = CacheEntry(
            value=value,
            expires_at=time.monotonic() + effective_ttl,
        )

    def delete(self, key: str) -> None:
        self._store.pop(key, None)

    def flush(self) -> int:
        count = len(self._store)
        self._store.clear()
        return count
