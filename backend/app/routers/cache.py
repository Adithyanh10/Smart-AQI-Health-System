"""Cache router: flush all cached predictions."""

from fastapi import APIRouter, Depends

from app.dependencies import get_cache
from app.services.cache import InMemoryCache

router = APIRouter(tags=["Cache"])


@router.delete("/cache/flush")
async def flush_cache(
    cache: InMemoryCache = Depends(get_cache),
) -> dict:
    evicted = cache.flush()
    return {"evicted": evicted}
