"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import type { Optimization, Scenario } from "@/types/domain";

type Props = { scenario: Scenario | null };

export function SteeringWorkbench({ scenario }: Props) {
  const [report, setReport] = useState<Optimization | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function runSearch() {
    if (!scenario) return;
    setBusy(true);
    setError(null);
    try {
      const result = await api.optimize(scenario);
      setReport(result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel p-5">
      <p className="eyebrow uppercase">Research experiment</p>
      <h2 className="mt-1 text-xl font-semibold">Wake-steering optimizer</h2>
      <p className="muted mt-2 text-sm">
        Simulate upstream yaw offsets. Never sends a turbine command.
      </p>
      <button className="btn mt-5" onClick={runSearch} disabled={busy || !scenario}>
        {busy ? "Searching angles…" : "Optimize simulated yaw"}
      </button>
      {error && <p role="alert" className="mt-3 text-sm text-warning">{error}</p>}
      {report && (
        <div className="mt-5 space-y-3">
          <div className="rounded-lg bg-[#0a3140] p-3">
            <p className="eyebrow">ESTIMATED GAIN</p>
            <p className="mt-1 text-2xl font-semibold text-lagoon">
              +{report.gain_kw.toFixed(0)} kW</p>
            <p className="muted text-xs">{report.evaluations} evaluations</p>
          </div>
          {Object.entries(report.chosen_yaw_deg).map(([id, angle]) => (
            <div key={id} className="flex justify-between text-sm">
              <span>{id}</span><strong className="text-lagoon">{angle}°</strong>
            </div>
          ))}
          {Object.keys(report.chosen_yaw_deg).length === 0 && (
            <p className="muted text-xs">Baseline was best for this synthetic case.</p>
          )}
        </div>
      )}
    </section>
  );
}
