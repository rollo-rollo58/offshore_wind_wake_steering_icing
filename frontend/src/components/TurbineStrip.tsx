import type { Snapshot } from "@/types/domain";

type Props = { snapshot: Snapshot | null };

export function TurbineStrip({ snapshot }: Props) {
  return (
    <section className="panel overflow-x-auto p-5">
      <p className="eyebrow uppercase">Individual turbine telemetry</p>
      <h2 className="mb-4 mt-1 text-xl font-semibold">Fleet performance ledger</h2>
      <table className="w-full min-w-[660px] text-left text-sm">
        <thead className="border-b border-[#325268] text-xs uppercase text-[#83a3b0]">
          <tr>
            <th className="py-3">Unit</th><th>Rotor wind</th><th>Output</th>
            <th>Wake loss</th><th>Yaw</th><th>Condition</th>
          </tr>
        </thead>
        <tbody>
          {snapshot?.turbines.map((t) => (
            <tr key={t.turbine_id} className="border-b border-[#2f435433]">
              <td className="py-3 font-semibold text-lagoon">{t.turbine_id}</td>
              <td>{t.effective_speed_mps.toFixed(1)} m/s</td>
              <td>{(t.net_power_kw / 1000).toFixed(2)} MW</td>
              <td>{t.wake_loss_kw.toFixed(0)} kW</td>
              <td>{t.yaw_deg.toFixed(0)}°</td>
              <td><span className="rounded-full bg-[#29434a] px-2 py-1 text-xs">
                {t.icing_index > 0.5 ? "Ice risk" : "Simulated"}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      {!snapshot && <p className="muted py-4">Connecting to the research feed.</p>}
    </section>
  );
}
