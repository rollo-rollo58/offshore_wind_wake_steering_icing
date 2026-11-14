"""Typed REST handlers and bounded policy-family dispatch."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from app.auth import require_operator
from app.domain import Observation, WindScenario
from app.optimization import optimize_yaw
from app.repository import BASELINE, FARM, add_observation, recent_observations
from app.services import build_alerts, collect_snapshot
from app.simulation import simulate_farm
from app.policies import dispatch_cases, fatigue_cases, icing_cases, wake_cases

router = APIRouter(prefix="/api/v1", tags=["AeroWake Research"])


@router.get("/farm")
def farm_overview() -> dict[str, object]:
    return {"farm": FARM.model_dump(), "research_only": True}


@router.get("/telemetry")
def telemetry_snapshot(tick: int = Query(default=0, ge=0, le=100000)) -> dict[str, object]:
    return collect_snapshot(tick)


@router.get("/energy")
def energy_summary() -> dict[str, object]:
    result = simulate_farm(FARM, BASELINE)
    return result.model_dump()


@router.post("/simulate")
def simulate(scenario: WindScenario) -> dict[str, object]:
    try:
        return simulate_farm(FARM, scenario).model_dump()
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/optimize")
def optimize(scenario: WindScenario) -> dict[str, object]:
    try:
        report = optimize_yaw(FARM, scenario)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return {
        "baseline": report.baseline.model_dump(),
        "optimized": report.optimized.model_dump(),
        "gain_kw": report.gain_kw,
        "chosen_yaw_deg": report.chosen_yaw_deg,
        "evaluations": report.evaluations,
        "research_only": True,
    }


@router.get("/alerts")
def alerts() -> dict[str, object]:
    return {"alerts": build_alerts(), "research_only": True}


@router.post("/observations", dependencies=[Depends(require_operator)])
def write_observation(observation: Observation) -> dict[str, object]:
    try:
        count = add_observation(observation)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"accepted": True, "bounded_ledger_size": count}


@router.get("/observations")
def observations() -> dict[str, object]:
    return {"observations": [item.model_dump() for item in recent_observations()]}


POLICY_MODULES = {
    "wake": wake_cases,
    "icing": icing_cases,
    "fatigue": fatigue_cases,
    "dispatch": dispatch_cases,
}


@router.get("/policies/{family}/{index}")
def evaluate_policy(
    family: str,
    index: int,
    signal: float = Query(default=12, ge=0, le=100),
    stress: float = Query(default=0.3, ge=0, le=1),
    uncertainty: float = Query(default=0.1, ge=0, le=1),
) -> dict[str, object]:
    module = POLICY_MODULES.get(family)
    if module is None or not 0 <= index < module.POLICY_COUNT:
        raise HTTPException(status_code=404, detail="Policy not found")
    output = module.evaluate(index, signal, stress, uncertainty)
    return {"family": family, "index": index, **output, "research_only": True}
