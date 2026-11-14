"""Synthetic farm fixture and a bounded, thread-safe research observation ledger."""
from __future__ import annotations

from collections import deque
from threading import Lock

from app.domain import Farm, Observation, Turbine, WindScenario


FARM = Farm(
    name="North Shoal Research Array",
    reference_latitude=57.12,
    reference_longitude=1.92,
    turbines=[
        Turbine(
            turbine_id=f"NS-{row + 1:02d}{col + 1:02d}",
            x_m=col * 900.0,
            y_m=row * 780.0 + (col % 2) * 100.0,
            rotor_diameter_m=190.0,
            hub_height_m=125.0,
            rated_power_kw=8500.0,
            thrust_coefficient=0.79,
        )
        for row in range(3)
        for col in range(4)
    ],
)

BASELINE = WindScenario(
    wind_speed_mps=11.7,
    direction_toward_deg=12.0,
    turbulence_intensity=0.095,
    air_density_kg_m3=1.225,
    air_temperature_c=-2.5,
    relative_humidity_pct=92.0,
    precipitation_mm_h=0.8,
)

_lock = Lock()
_observations: deque[Observation] = deque(maxlen=256)


def add_observation(observation: Observation) -> int:
    if observation.turbine_id not in {t.turbine_id for t in FARM.turbines}:
        raise ValueError("Turbine not found")
    with _lock:
        _observations.append(observation)
        return len(_observations)


def recent_observations() -> list[Observation]:
    with _lock:
        return list(reversed(_observations))
