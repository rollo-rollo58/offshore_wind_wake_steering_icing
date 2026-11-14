BEGIN;
CREATE TABLE IF NOT EXISTS observation_batches (
    batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(farm_id),
    wind_speed_mps DOUBLE PRECISION NOT NULL CHECK (wind_speed_mps >= 0),
    direction_toward_deg DOUBLE PRECISION NOT NULL,
    air_temperature_c DOUBLE PRECISION NOT NULL,
    relative_humidity_pct DOUBLE PRECISION NOT NULL CHECK (
        relative_humidity_pct BETWEEN 0 AND 100
    ),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS turbine_observations (
    observation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES observation_batches(batch_id) ON DELETE CASCADE,
    turbine_id TEXT NOT NULL REFERENCES turbines(turbine_id),
    rotor_wind_speed_mps DOUBLE PRECISION NOT NULL CHECK (rotor_wind_speed_mps >= 0),
    measured_power_kw DOUBLE PRECISION NOT NULL CHECK (measured_power_kw >= 0),
    yaw_deg DOUBLE PRECISION NOT NULL,
    icing_index DOUBLE PRECISION NOT NULL CHECK (icing_index BETWEEN 0 AND 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (batch_id, turbine_id)
);
CREATE TABLE IF NOT EXISTS operational_alerts (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turbine_id TEXT NOT NULL REFERENCES turbines(turbine_id),
    category TEXT NOT NULL CHECK (category IN ('icing', 'fatigue', 'low_power')),
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS batch_farm_time_idx
    ON observation_batches(farm_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS alerts_turbine_time_idx
    ON operational_alerts(turbine_id, created_at DESC);
COMMIT;
