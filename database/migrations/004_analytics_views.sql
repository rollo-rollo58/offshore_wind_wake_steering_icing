BEGIN;
CREATE OR REPLACE VIEW farm_daily_generation AS
SELECT
    b.farm_id,
    date_trunc('day', b.recorded_at) AS production_day,
    COUNT(DISTINCT b.batch_id) AS sample_count,
    ROUND(SUM(o.measured_power_kw)::numeric, 2) AS sum_instantaneous_kw,
    ROUND(AVG(o.icing_index)::numeric, 4) AS mean_icing_index
FROM observation_batches b
JOIN turbine_observations o ON o.batch_id = b.batch_id
GROUP BY b.farm_id, date_trunc('day', b.recorded_at);
CREATE OR REPLACE VIEW open_turbine_alerts AS
SELECT
    t.farm_id,
    a.turbine_id,
    a.category,
    a.severity,
    a.created_at
FROM operational_alerts a
JOIN turbines t ON t.turbine_id = a.turbine_id
WHERE a.acknowledged_at IS NULL;
CREATE INDEX IF NOT EXISTS scenarios_farm_recent_idx
    ON wind_scenarios(farm_id, created_at DESC);
COMMIT;
