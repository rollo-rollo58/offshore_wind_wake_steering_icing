# AeroWake — Offshore Wind-Farm Wake Steering and Blade-Icing Digital Twin

A runnable research workbench for evaluating offshore turbine arrays, wake losses,
blade icing risk, fatigue exposure, and yaw-steering alternatives. Includes a
Next.js control room, FastAPI routes, synthetic WebSocket telemetry, Postgres DDL,
container packaging, CI checks, and deterministic domain policy catalogues.

## Scientific limitations

Research and developer demonstration only. The Jensen wake approximation, wake
center deflection heuristic, variable power coefficient, proxy icing estimator,
and simple fatigue index **are not calibrated to a real wind farm**. Do not use
these outputs to command turbines, determine personnel safety, or trade energy.
The demo runs with a bounded synthetic in-memory fleet. PostgreSQL migrations
are supplied as a separate persistence design; the API demo does not claim to
persist observations to PostgreSQL.

## Domain units and assumptions

- X and Y coordinates: meters in a local, planar array frame.
- Wind direction: degrees **toward** which the air flows, from east = 0°.
- Turbine power: `0.5 * rho * A * Cp(U) * U^3`, bounded by nameplate rating.
- Rotor effective speed: superposition of squared Jensen wake deficits.
- Yaw power derating: `cos(yaw)^1.88`, clipped to nonnegative power.
- Wake steering: simple lateral displacement proportional to downwind range.
- Icing index: an empirical humidity/temperature/precipitation proxy, 0 to 1.
- Fatigue index: an arbitrary, nondimensional wind-shear/turbulence exposure.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/health` | Liveness, demonstration flag |
| GET | `/api/v1/farm` | Farm metadata and layout |
| GET | `/api/v1/telemetry` | Latest synthetic telemetry |
| GET | `/api/v1/energy` | Baseline farm power and losses |
| POST | `/api/v1/simulate` | Simulate a user-supplied wind scenario |
| POST | `/api/v1/optimize` | Greedy yaw-steering search |
| GET | `/api/v1/alerts` | Research icing and fatigue alerts |
| POST | `/api/v1/observations` | Operator-key protected observation |
| GET | `/api/v1/policies/{family}/{index}` | Deterministic generated policy case |
| WS | `/ws/telemetry` | Synthetic farm samples every two seconds |

## Run locally

Backend (requires Python 3.11+):

```sh
cd backend
python -m pip install -e '.[dev]'
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend (requires Node.js 20+):

```sh
cd frontend
npm install
npm run dev
```

Browse `http://localhost:3000`. For write access, inject a long random
`OPERATOR_API_KEY` into the backend environment; do not commit a live key.
The frontend can read the API at `NEXT_PUBLIC_API_BASE_URL`.

## Local tests

```sh
cd backend
python -m pytest -q
```

The generator syntax-checks Python files, runs tests with installed dependencies,
checks TS/TSX parsing using TypeScript when available, verifies ZIP contents,
validates JSON/YAML where parsers exist, and enforces limits on line width.
The generated catalogue is tested by deterministic spot-execution.

## Repository inventory and generated-rule disclosure

The four files in `backend/app/policies/` are generated source-code catalogues,
not 100,000+ separately designed algorithms. Each rule has bounded inputs and
specific numerical coefficients and produces meaningful synthetic scores.
These entries intentionally satisfy a large-source-code stress-test use case.
Do not mistake file/line-count compliance for production certification.

The remaining modules contain the real API, simulation, tests, React console,
PostgreSQL DDL, operational examples, and documentation. Before production,
add persistent repositories, identity integration, integration tests, security
review, scientific calibration, and deployment-specific network policies.
