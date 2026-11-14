"""Dimensional and boundary checks for the simplified wind equations."""
from math import isclose

import pytest

from app.domain import WindScenario
from app.optimization import optimize_yaw
from app.physics import (
    fatigue_exposure_index,
    icing_risk_index,
    jensen_wake_deficit,
    power_coefficient,
    projected_separation,
    turbine_power_kw,
)
from app.repository import BASELINE, FARM
from app.simulation import hourly_energy_mwh, simulate_farm


def test_power_cut_in_and_cut_out() -> None:
    turbine = FARM.turbines[0]
    assert turbine_power_kw(turbine, 2, 1.225) == 0
    assert turbine_power_kw(turbine, 27, 1.225) == 0
    assert turbine_power_kw(turbine, 11, 1.225) > 0


def test_power_bounded_by_nameplate() -> None:
    turbine = FARM.turbines[0]
    assert 0 <= turbine_power_kw(turbine, 16, 1.225) <= turbine.rated_power_kw


def test_yaw_causes_derating() -> None:
    turbine = FARM.turbines[0]
    assert turbine_power_kw(turbine, 8, 1.225, 20) < turbine_power_kw(
        turbine, 8, 1.225
    )


def test_downwind_and_upwind_geometry() -> None:
    first, second = FARM.turbines[0], FARM.turbines[1]
    downwind, crosswind = projected_separation(first, second, 0)
    assert downwind > 0
    assert crosswind == 100.0
    assert jensen_wake_deficit(second, first, 0, 0.1) == 0
    assert jensen_wake_deficit(first, second, 0, 0.1) > 0


def test_wake_reduces_effective_energy() -> None:
    scenario = BASELINE.model_copy(update={"direction_toward_deg": 0})
    result = simulate_farm(FARM, scenario)
    assert result.wake_loss_kw > 0
    assert result.net_farm_power_kw < result.gross_farm_power_kw


def test_icing_is_bounded_and_warm_conditions_have_none() -> None:
    assert icing_risk_index(10, 95, 4) == 0
    assert 0 <= icing_risk_index(-2, 90, 4) <= 1
    assert icing_risk_index(-2, 90, 4) > icing_risk_index(-2, 70, 0)


def test_fatigue_monotonic_with_turbulence() -> None:
    assert fatigue_exposure_index(12, 0.2, 10) > fatigue_exposure_index(12, 0.1, 10)


def test_capacity_factor_bounded() -> None:
    result = simulate_farm(FARM, BASELINE)
    assert 0 <= result.capacity_factor <= 1
    assert len(result.turbines) == len(FARM.turbines)


def test_optimizer_never_reduces_baseline_energy() -> None:
    report = optimize_yaw(FARM, BASELINE)
    assert report.gain_kw >= 0
    assert report.optimized.net_farm_power_kw >= report.baseline.net_farm_power_kw


def test_optimizer_output_yaw_range() -> None:
    report = optimize_yaw(FARM, BASELINE)
    assert all(abs(value) <= 20 for value in report.chosen_yaw_deg.values())


def test_hourly_energy_conversion() -> None:
    assert isclose(hourly_energy_mwh(2000, 0.5), 1.0)
    with pytest.raises(ValueError):
        hourly_energy_mwh(-1)


def test_scenario_rejects_invalid_yaw() -> None:
    with pytest.raises(ValueError):
        WindScenario(**{**BASELINE.model_dump(), "yaw_angles_deg": {"NS-0101": 50}})


def test_unknown_turbine_rejected() -> None:
    scenario = BASELINE.model_copy(update={"yaw_angles_deg": {"unknown": 5}})
    with pytest.raises(ValueError):
        simulate_farm(FARM, scenario)


def test_cp_in_physical_range() -> None:
    assert 0 < power_coefficient(11) < 0.593
