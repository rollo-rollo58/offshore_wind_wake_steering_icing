"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import type { Scenario, Simulation } from "@/types/domain";

type Props = { initial: Scenario | null };

export function ScenarioControls({ initial }: Props) {
  const [inputs, setInputs] = useState<Scenario | null>(null);
  const [result, setResult] = useState<Simulation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (initial && inputs === null) setInputs(initial);
  }, [initial, inputs]);
  function update(key: keyof Scenario, value: number) {
    setInputs((current) => current ? { ...current, [key]: value } : current);
  }
  async function run() {
    if (!inputs) return;
    setBusy(true);
    setError(null);
    try {
      setResult(await api.simulate(inputs));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }
  const fields: { key: keyof Scenario; label: string; min: number; max: number }[] = [
    { key: "wind_speed_mps", label: "Wind speed (m/s)", min: 0, max: 30 },
    { key: "direction_toward_deg", label: "Direction toward (°)", min: 0, max: 359 },
    { key: "turbulence_intensity", label: "Turbulence fraction", min: 0.01, max: 0.35 },
    { key: "air_temperature_c", label: "Temperature (°C)", min: -30, max: 30 },
  ];
  return (
    <section className="panel p-5">
      <p className="eyebrow uppercase">Scenario laboratory</p>
      <h2 className="mt-1 text-xl font-semibold">Modify ambient conditions</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {fields.map(({ key, label, min, max }) => (
          <label key={key} className="text-xs muted">
            <span className="mb-1 block">{label}</span>
            <input className="input" type="number" min={min} max={max} step="any"
              value={typeof inputs?.[key] === "number" ? inputs[key] : 0}
              onChange={(event) => update(key, Number(event.target.value))} />
          </label>
        ))}
      </div>
      <button className="btn mt-4" onClick={run} disabled={busy || !inputs}>
        {busy ? "Calculating…" : "Run scenario"}
      </button>
      {error && <p role="alert" className="mt-3 text-sm text-warning">{error}</p>}
      {result && <p className="mt-4 text-sm">
        Simulated array output: <strong className="text-lagoon">
          {(result.net_farm_power_kw / 1000).toFixed(2)} MW</strong>
      </p>}
    </section>
  );
}
