import type { Snapshot } from "@/types/domain";

type Props = { snapshot: Snapshot | null };

export function IcingRiskPanel({ snapshot }: Props) {
  const risk = snapshot?.turbines[0]?.icing_index ?? 0;
  const temp = snapshot?.scenario.air_temperature_c ?? 0;
  const humidity = snapshot?.scenario.relative_humidity_pct ?? 0;
  const label = risk > 0.7 ? "HIGH" : risk > 0.35 ? "ELEVATED" : "LOW";
  return (
    <section className="panel p-5">
      <p className="eyebrow uppercase">Blade condition · inferred</p>
      <h2 className="mt-1 text-xl font-semibold">Icing exposure</h2>
      <div className="mt-5 flex items-center gap-5">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full"
          style={{ background: `conic-gradient(#ffd07a ${risk * 100}%,
            #284254 ${risk * 100}%)` }}>
          <div className="flex h-24 w-24 flex-col items-center justify-center
            rounded-full bg-[#102538]">
            <strong className="text-2xl">{(risk * 100).toFixed(0)}%</strong>
            <span className="text-xs text-warning">{label}</span>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <p>Air temperature <strong>{temp.toFixed(1)}°C</strong></p>
          <p>Relative humidity <strong>{humidity.toFixed(0)}%</strong></p>
          <p className="muted text-xs">Screening index, not a sensor reading.</p>
        </div>
      </div>
    </section>
  );
}
