"""Validated research-domain inputs and API contracts."""
from __future__ import annotations

from math import isfinite
from pydantic import BaseModel, Field, field_validator


class Turbine(BaseModel):
    turbine_id: str
    x_m: float
    y_m: float
    rotor_diameter_m: float = Field(gt=20, le=300)
    hub_height_m: float = Field(gt=30, le=250)
    rated_power_kw: float = Field(gt=100, le=30000)
    thrust_coefficient: float = Field(gt=0.05, lt=0.95)
    available: bool = True


class Farm(BaseModel):
    name: str
    reference_latitude: float = Field(ge=-90, le=90)
    reference_longitude: float = Field(ge=-180, le=180)
    turbines: list[Turbine] = Field(min_length=1, max_length=200)


class WindScenario(BaseModel):
    wind_speed_mps: float = Field(ge=0, le=45)
    direction_toward_deg: float = Field(ge=0, lt=360)
    turbulence_intensity: float = Field(ge=0.01, le=0.35)
    air_density_kg_m3: float = Field(ge=0.9, le=1.4)
    air_temperature_c: float = Field(ge=-45, le=55)
    relative_humidity_pct: float = Field(ge=0, le=100)
    precipitation_mm_h: float = Field(ge=0, le=60)
    yaw_angles_deg: dict[str, float] = Field(default_factory=dict)

    @field_validator("yaw_angles_deg")
    @classmethod
    def angles_are_bounded(cls, values: dict[str, float]) -> dict[str, float]:
        if len(values) > 200:
            raise ValueError("At most 200 yaw commands are supported")
        if any(not isfinite(v) or abs(v) > 30 for v in values.values()):
            raise ValueError("Yaw offsets must be finite values within 30 degrees")
        return values


class Observation(BaseModel):
    turbine_id: str = Field(min_length=2, max_length=32)
    measured_power_kw: float = Field(ge=0, le=30000)
    rotor_speed_rpm: float = Field(ge=0, le=60)
    note: str = Field(min_length=1, max_length=240)


class TurbineResult(BaseModel):
    turbine_id: str
    effective_speed_mps: float
    gross_power_kw: float
    net_power_kw: float
    wake_loss_kw: float
    yaw_deg: float
    icing_index: float
    fatigue_index: float


class SimulationResult(BaseModel):
    scenario: WindScenario
    gross_farm_power_kw: float
    net_farm_power_kw: float
    wake_loss_kw: float
    yaw_loss_kw: float
    capacity_factor: float
    turbines: list[TurbineResult]
    research_only: bool = True
