"""Operator-key authorization with a fail-closed demonstration default."""
import hmac

from fastapi import Header, HTTPException

from app.config import get_settings


def require_operator(x_operator_key: str | None = Header(default=None)) -> None:
    expected = get_settings().operator_key
    if expected is None:
        raise HTTPException(status_code=503, detail="Operator writes are disabled")
    if x_operator_key is None or not hmac.compare_digest(expected, x_operator_key):
        raise HTTPException(status_code=403, detail="Invalid operator credential")
