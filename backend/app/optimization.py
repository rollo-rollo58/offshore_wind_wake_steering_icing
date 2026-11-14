"""Greedy coordinate descent over bounded yaw actions, with reproducible order."""
from __future__ import annotations

from dataclasses import dataclass

from app.domain import Farm, SimulationResult, WindScenario
from app.physics import projected_separation
from app.simulation import simulate_farm


@dataclass(frozen=True)
class OptimizationReport:
    baseline: SimulationResult
    optimized: SimulationResult
    gain_kw: float
    chosen_yaw_deg: dict[str, float]
    evaluations: int


def optimize_yaw(farm: Farm, scenario: WindScenario) -> OptimizationReport:
    """Search steering actions; no actuator commands are issued."""
    start = scenario.model_copy(update={"yaw_angles_deg": {}})
    baseline = simulate_farm(farm, start)
    best = baseline
    current: dict[str, float] = {}
    evaluations = 1
    ordered = sorted(
        farm.turbines,
        key=lambda t: t.x_m * __import__("math").cos(
            __import__("math").radians(scenario.direction_toward_deg)
        ) + t.y_m * __import__("math").sin(
            __import__("math").radians(scenario.direction_toward_deg)
        ),
    )
    for turbine in ordered:
        if not turbine.available:
            continue
        if not any(
            projected_separation(turbine, other, scenario.direction_toward_deg)[0] > 0
            for other in farm.turbines if other.turbine_id != turbine.turbine_id
        ):
            continue
        best_yaw = 0.0
        for candidate in (-20.0, -12.0, -6.0, 0.0, 6.0, 12.0, 20.0):
            yaw_map = {**current, turbine.turbine_id: candidate}
            result = simulate_farm(
                farm, scenario.model_copy(update={"yaw_angles_deg": yaw_map})
            )
            evaluations += 1
            if result.net_farm_power_kw > best.net_farm_power_kw + 0.01:
                best = result
                best_yaw = candidate
        if best_yaw:
            current[turbine.turbine_id] = best_yaw
    return OptimizationReport(
        baseline=baseline,
        optimized=best,
        gain_kw=round(best.net_farm_power_kw - baseline.net_farm_power_kw, 2),
        chosen_yaw_deg=current,
        evaluations=evaluations,
    )
