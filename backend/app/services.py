"""Domain orchestration, bounded alerts, and a reproducible synthetic feed."""
from __future__ import annotations

from datetime import datetime, timezone
from math import sin

from app.domain import WindScenario
from app.repository import BASELINE, FARM
from app.simulation import simulate_farm


def scenario_for_tick(tick: int) -> WindScenario:
    speed = max(0.0, BASELINE.wind_speed_mps + 1.6 * sin(tick / 7))
    direction = (BASELINE.direction_toward_deg + 14 * sin(tick / 11)) % 360
    return BASELINE.model_copy(update={
        "wind_speed_mps": round(speed, 3),
        "direction_toward_deg": round(direction, 3),
        "air_temperature_c": round(-2.4 + 2 * sin(tick / 17), 2),
    })


def collect_snapshot(tick: int = 0) -> dict[str, object]:
    scenario = scenario_for_tick(tick)
    result = simulate_farm(FARM, scenario)
    return {
        "observed_at": datetime.now(timezone.utc).isoformat(),
        "tick": tick,
        "scenario": scenario.model_dump(),
        "summary": {
            "net_power_kw": result.net_farm_power_kw,
            "gross_power_kw": result.gross_farm_power_kw,
            "wake_loss_kw": result.wake_loss_kw,
            "yaw_loss_kw": result.yaw_loss_kw,
            "capacity_factor": result.capacity_factor,
        },
        "turbines": [item.model_dump() for item in result.turbines],
        "research_only": True,
    }


def build_alerts() -> list[dict[str, object]]:
    result = simulate_farm(FARM, BASELINE)
    alerts = []
    for item in result.turbines:
        if item.icing_index >= 0.35:
            alerts.append({
                "id": f"icing-{item.turbine_id}",
                "turbine_id": item.turbine_id,
                "category": "icing",
                "severity": "warning" if item.icing_index < 0.7 else "critical",
                "value": item.icing_index,
                "message": "Synthetic blade-icing likelihood exceeds screen threshold",
            })
        if item.fatigue_index >= 0.55:
            alerts.append({
                "id": f"fatigue-{item.turbine_id}",
                "turbine_id": item.turbine_id,
                "category": "fatigue",
                "severity": "warning",
                "value": item.fatigue_index,
                "message": "Synthetic fatigue-exposure index exceeds screen threshold",
            })
    return alerts[:32]
