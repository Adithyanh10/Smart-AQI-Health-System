"""API key authentication middleware for protected endpoints."""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.config import settings

# Paths that do NOT require an API key (prefix or exact match)
_PUBLIC_PREFIXES = (
    "/api/v1/predict",
    "/api/v1/health-impact",
    "/api/v1/aqi",
    "/api/v1/dataset",
    "/api/v1/report",
    "/openapi.json",
    "/docs",
    "/redoc",
    "/static",
)

# GET /api/v1/models is public; other methods on /models are protected
_PUBLIC_GET_PATHS = ("/api/v1/models",)


def _is_public(request: Request) -> bool:
    path = request.url.path

    # Exact public-GET paths
    if request.method == "GET" and path in _PUBLIC_GET_PATHS:
        return True

    # Prefix-based public paths — match exact, with trailing slash, or query string
    for prefix in _PUBLIC_PREFIXES:
        if path == prefix or path.startswith(prefix + "/") or path.startswith(prefix + "?") or path.startswith(prefix):
            return True

    return False


class APIKeyAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        if _is_public(request):
            return await call_next(request)

        api_key = request.headers.get("X-API-Key")
        if not api_key or api_key != settings.API_KEY:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or missing API key."},
            )

        return await call_next(request)
