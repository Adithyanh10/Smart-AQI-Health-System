"""SSE broadcaster: push live AQI updates to all connected clients."""

from __future__ import annotations

import asyncio
import json
import logging
from typing import AsyncGenerator

from starlette.requests import Request

from app.schemas.model import LiveAQIResponse

logger = logging.getLogger(__name__)


class SSEBroadcaster:
    def __init__(self) -> None:
        self._queues: set[asyncio.Queue] = set()

    async def stream(self, request: Request) -> AsyncGenerator[str, None]:
        """
        Async generator that yields SSE-formatted events for a single client.
        Registers a per-client queue and cleans up on disconnect.
        """
        queue: asyncio.Queue = asyncio.Queue()
        self._queues.add(queue)
        logger.debug("SSE client connected. Active clients: %d", len(self._queues))

        try:
            while True:
                # Check for client disconnect
                if await request.is_disconnected():
                    break

                try:
                    # Wait for next event with a timeout so we can check disconnect
                    event_data: str = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield event_data
                except asyncio.TimeoutError:
                    # Send a keep-alive comment to prevent proxy timeouts
                    yield ": keep-alive\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            self._queues.discard(queue)
            logger.debug("SSE client disconnected. Active clients: %d", len(self._queues))

    def push_update(self, data: LiveAQIResponse) -> None:
        """
        Serialize data and enqueue it for all active SSE clients.
        Removes queues that are no longer active.
        """
        payload = data.model_dump(mode="json", default=str)
        event = f"data: {json.dumps(payload)}\n\n"

        dead: set[asyncio.Queue] = set()
        for queue in self._queues:
            try:
                queue.put_nowait(event)
            except asyncio.QueueFull:
                dead.add(queue)

        self._queues -= dead
