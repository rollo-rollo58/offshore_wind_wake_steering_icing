BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS farms (
    farm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    reference_latitude DOUBLE PRECISION NOT NULL,
    reference_longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS turbines (
    turbine_id TEXT PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES farms(farm_id),
    x_m DOUBLE PRECISION NOT NULL,
    y_m DOUBLE PRECISION NOT NULL,
    rotor_diameter_m DOUBLE PRECISION NOT NULL CHECK (rotor_diameter_m > 0),
    hub_height_m DOUBLE PRECISION NOT NULL CHECK (hub_height_m > 0),
    rated_power_kw DOUBLE PRECISION NOT NULL CHECK (rated_power_kw > 0),
    thrust_coefficient DOUBLE PRECISION NOT NULL CHECK (
        thrust_coefficient > 0 AND thrust_coefficient < 1
    ),
    available BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (farm_id, x_m, y_m)
);
CREATE INDEX IF NOT EXISTS turbines_farm_idx ON turbines(farm_id);
COMMIT;
