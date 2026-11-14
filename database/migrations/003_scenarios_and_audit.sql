BEGIN;
CREATE TABLE IF NOT EXISTS wind_scenarios (
    scenario_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(farm_id),
    label TEXT NOT NULL,
    input_data JSONB NOT NULL,
    results JSONB,
    requested_by TEXT NOT NULL DEFAULT 'demo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (jsonb_typeof(input_data) = 'object')
);
CREATE TABLE IF NOT EXISTS audit_entries (
    audit_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_type TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    actor TEXT NOT NULL,
    changes JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION audit_scenario_mutation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO audit_entries(event_type, subject_id, actor, changes)
    VALUES (
        TG_OP,
        NEW.scenario_id::TEXT,
        NEW.requested_by,
        jsonb_build_object('label', NEW.label, 'inputs', NEW.input_data)
    );
    RETURN NEW;
END;
$$;
CREATE TRIGGER scenario_audit_insert
AFTER INSERT ON wind_scenarios FOR EACH ROW
EXECUTE FUNCTION audit_scenario_mutation();
COMMIT;
