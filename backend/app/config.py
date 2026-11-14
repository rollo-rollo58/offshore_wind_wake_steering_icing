"""Runtime configuration and bounded CORS origins."""
from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    environment: str
    origins: tuple[str, ...]
    operator_key: str | None


def get_settings() -> Settings:
    origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000")
    allowed = tuple(item.strip() for item in origins.split(",") if item.strip())
    value = os.environ.get("OPERATOR_API_KEY", "").strip()
    return Settings(
        environment=os.environ.get("APP_ENV", "demonstration"),
        origins=allowed,
        operator_key=value if len(value) >= 24 else None,
    )
