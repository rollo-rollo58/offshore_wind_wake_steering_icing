"""Physically dimensioned, intentionally simplified wind-farm equations."""
from __future__ import annotations

from math import cos, exp, hypot, pi, radians, sin, sqrt, tan

from app.domain import Turbine, WindScenario


def power_coefficient(speed_mps: float) -> float:
    """Bell-shaped, bounded aerodynamic efficiency curve for demonstration."""
    if speed_mps < 3 or speed_mps > 25:
        return 0.0
    return min(0.46, 0.46 * (1 - exp(-0.65 * (speed_mps - 3))) *
               exp(-0.005 * max(0, speed_mps - 11) ** 2))


def turbine_power_kw(
    turbine: Turbine,
    speed_mps: float,
    density_kg_m3: float,
    yaw_deg: float = 0.0,
) -> float:
    if not turbine.available or speed_mps < 0 or density_kg_m3 <= 0:
        return 0.0
    rotor_area_m2 = pi * (turbine.rotor_diameter_m / 2) ** 2
    available_w = 0.5 * density_kg_m3 * rotor_area_m2 * speed_mps ** 3
    derating = max(0.0, cos(radians(yaw_deg))) ** 1.88
    return min(turbine.rated_power_kw, available_w * power_coefficient(speed_mps) *
               derating / 1000)


def projected_separation(
    source: Turbine, target: Turbine, direction_toward_deg: float
) -> tuple[float, float]:
    theta = radians(direction_toward_deg)
    dx, dy = target.x_m - source.x_m, target.y_m - source.y_m
    return dx * cos(theta) + dy * sin(theta), -dx * sin(theta) + dy * cos(theta)


def jensen_wake_deficit(
    source: Turbine,
    target: Turbine,
    direction_toward_deg: float,
    turbulence_intensity: float,
    source_yaw_deg: float = 0.0,
) -> float:
    """Return a dimensionless deficit; includes heuristic steering displacement."""
    along_m, across_m = projected_separation(source, target, direction_toward_deg)
    if along_m <= 0 or not source.available:
        return 0.0
    k = 0.035 + 0.35 * turbulence_intensity
    rotor_radius_m = source.rotor_diameter_m / 2
    wake_radius_m = rotor_radius_m + k * along_m
    shifted_center_m = 0.18 * along_m * tan(radians(source_yaw_deg))
    distance_m = abs(across_m - shifted_center_m)
    overlap_scale_m = max(2, target.rotor_diameter_m / 7)
    overlap = 1 / (1 + exp((distance_m - wake_radius_m) / overlap_scale_m))
    thrust = source.thrust_coefficient * cos(radians(source_yaw_deg)) ** 2
    expansion = (rotor_radius_m / wake_radius_m) ** 2
    return min(0.95, (1 - sqrt(1 - thrust)) * expansion * overlap)


def rotor_speed_mps(
    turbine: Turbine,
    farm_turbines: list[Turbine],
    scenario: WindScenario,
) -> float:
    deficits_squared = 0.0
    for upstream in farm_turbines:
        if upstream.turbine_id == turbine.turbine_id:
            continue
        deficit = jensen_wake_deficit(
            upstream,
            turbine,
            scenario.direction_toward_deg,
            scenario.turbulence_intensity,
            scenario.yaw_angles_deg.get(upstream.turbine_id, 0.0),
        )
        deficits_squared += deficit ** 2
    total_deficit = min(0.98, sqrt(deficits_squared))
    return scenario.wind_speed_mps * (1 - total_deficit)


def icing_risk_index(
    temperature_c: float, humidity_pct: float, precipitation_mm_h: float
) -> float:
    if temperature_c > 3 or temperature_c < -28:
        return 0.0
    thermal_factor = max(0.0, 1 - abs(temperature_c + 4) / 25)
    moisture_factor = max(0.0, (humidity_pct - 68) / 32)
    precipitation_factor = min(1.0, precipitation_mm_h / 4)
    return min(1.0, thermal_factor * (0.65 * moisture_factor +
                                   0.35 * precipitation_factor))


def fatigue_exposure_index(
    wind_speed_mps: float, turbulence_intensity: float, yaw_deg: float
) -> float:
    if wind_speed_mps <= 0:
        return 0.0
    gust_component = (wind_speed_mps / 25) ** 2
    fluctuation_component = turbulence_intensity / 0.2
    yaw_component = 1 + abs(yaw_deg) / 45
    return round(min(2.5, gust_component * fluctuation_component * yaw_component), 4)
