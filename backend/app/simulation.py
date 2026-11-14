"""Farm-wide deterministic numerical rollup and batch operating points."""
from __future__ import annotations

from app.domain import Farm, SimulationResult, TurbineResult, WindScenario
from app.physics import (
    fatigue_exposure_index,
    icing_risk_index,
    rotor_speed_mps,
    turbine_power_kw,
)


def simulate_farm(farm: Farm, scenario: WindScenario) -> SimulationResult:
    unknown = set(scenario.yaw_angles_deg) - {
        turbine.turbine_id for turbine in farm.turbines
    }
    if unknown:
        raise ValueError("Yaw commands reference an unknown turbine")
    gross = 0.0
    net = 0.0
    wake_loss = 0.0
    yaw_loss = 0.0
    results: list[TurbineResult] = []
    risk = icing_risk_index(
        scenario.air_temperature_c,
        scenario.relative_humidity_pct,
        scenario.precipitation_mm_h,
    )
    for turbine in farm.turbines:
        yaw = scenario.yaw_angles_deg.get(turbine.turbine_id, 0.0)
        speed = rotor_speed_mps(turbine, farm.turbines, scenario)
        gross_kw = turbine_power_kw(
            turbine, scenario.wind_speed_mps, scenario.air_density_kg_m3
        )
        no_yaw_kw = turbine_power_kw(turbine, speed, scenario.air_density_kg_m3)
        net_kw = turbine_power_kw(turbine, speed, scenario.air_density_kg_m3, yaw)
        gross += gross_kw
        net += net_kw
        wake_loss += max(0.0, gross_kw - no_yaw_kw)
        yaw_loss += max(0.0, no_yaw_kw - net_kw)
        results.append(TurbineResult(
            turbine_id=turbine.turbine_id,
            effective_speed_mps=round(speed, 3),
            gross_power_kw=round(gross_kw, 2),
            net_power_kw=round(net_kw, 2),
            wake_loss_kw=round(max(0.0, gross_kw - no_yaw_kw), 2),
            yaw_deg=yaw,
            icing_index=round(risk, 4),
            fatigue_index=fatigue_exposure_index(
                speed, scenario.turbulence_intensity, yaw
            ),
        ))
    total_rated = sum(t.rated_power_kw for t in farm.turbines)
    return SimulationResult(
        scenario=scenario,
        gross_farm_power_kw=round(gross, 2),
        net_farm_power_kw=round(net, 2),
        wake_loss_kw=round(wake_loss, 2),
        yaw_loss_kw=round(yaw_loss, 2),
        capacity_factor=round(net / total_rated, 4) if total_rated else 0.0,
        turbines=results,
    )


def hourly_energy_mwh(power_kw: float, capacity_factor: float = 1.0) -> float:
    """Energy for a one-hour period with a bounded availability fraction."""
    if power_kw < 0 or not 0 <= capacity_factor <= 1:
        raise ValueError("Invalid hourly-energy inputs")
    return power_kw * capacity_factor / 1000
