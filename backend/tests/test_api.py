"""HTTP contract tests and a fail-closed operator access check."""
from fastapi.testclient import TestClient

from app.main import app
from app.repository import BASELINE


client = TestClient(app)


def test_liveness() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["research_only"] is True


def test_farm_has_twelve_turbines() -> None:
    response = client.get("/api/v1/farm")
    assert response.status_code == 200
    assert len(response.json()["farm"]["turbines"]) == 12


def test_simulate_returns_consistent_total() -> None:
    response = client.post("/api/v1/simulate", json=BASELINE.model_dump())
    assert response.status_code == 200
    payload = response.json()
    turbine_sum = sum(t["net_power_kw"] for t in payload["turbines"])
    assert abs(turbine_sum - payload["net_farm_power_kw"]) < 0.2


def test_invalid_scenario_rejected() -> None:
    response = client.post("/api/v1/simulate", json={
        **BASELINE.model_dump(), "wind_speed_mps": -1,
    })
    assert response.status_code == 422


def test_optimizer_api() -> None:
    response = client.post("/api/v1/optimize", json=BASELINE.model_dump())
    assert response.status_code == 200
    assert response.json()["gain_kw"] >= 0


def test_telemetry_api() -> None:
    response = client.get("/api/v1/telemetry?tick=3")
    assert response.status_code == 200
    assert response.json()["tick"] == 3


def test_policy_api() -> None:
    response = client.get("/api/v1/policies/wake/21")
    assert response.status_code == 200
    assert 0 <= response.json()["risk_score"] <= 1


def test_policy_api_missing() -> None:
    response = client.get("/api/v1/policies/invalid/99999")
    assert response.status_code == 404


def test_operator_write_fails_without_runtime_key() -> None:
    response = client.post("/api/v1/observations", json={
        "turbine_id": "NS-0101", "measured_power_kw": 3400,
        "rotor_speed_rpm": 7.2, "note": "synthetic fixture",
    })
    assert response.status_code in (403, 503)


def test_websocket_receives_farm_sample() -> None:
    with client.websocket_connect("/ws/telemetry") as socket:
        message = socket.receive_json()
        assert message["research_only"] is True
        assert len(message["turbines"]) == 12
