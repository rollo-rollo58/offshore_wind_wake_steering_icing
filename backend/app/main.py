"""AeroWake research FastAPI application entry point."""
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routes import router
from app.telemetry import websocket_loop

app = FastAPI(
    title="AeroWake Offshore Wind Digital Twin",
    version="0.1.0",
    description="Uncalibrated wind-farm simulation and telemetry research API",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(get_settings().origins),
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Operator-Key"],
)
app.include_router(router)


@app.get("/health")
def health() -> dict[str, object]:
    return {"status": "ok", "research_only": True, "mode": "synthetic"}


@app.websocket("/ws/telemetry")
async def telemetry_websocket(socket: WebSocket) -> None:
    await websocket_loop(socket)
