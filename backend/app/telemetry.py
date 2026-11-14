"""Bounded demonstration WebSocket loop without external device connections."""
from __future__ import annotations

import asyncio

from fastapi import WebSocket, WebSocketDisconnect

from app.services import collect_snapshot


async def websocket_loop(socket: WebSocket) -> None:
    await socket.accept()
    try:
        for tick in range(100000):
            await socket.send_json(collect_snapshot(tick))
            await asyncio.sleep(2)
    except (WebSocketDisconnect, RuntimeError):
        return
