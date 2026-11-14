import type { Snapshot } from "@/types/domain";

type Props = { history: Snapshot[] };

export function TelemetryTimeline({ history }: Props) {
  const values = history.map((sample) => sample.summary.net_power_kw / 1000);
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const span = Math.max(1, max - min);
  const line = values.map((value, index) => {
    const x = 25 + (index / Math.max(1, values.length - 1)) * 520;
    const y = 200 - ((value - min) / span) * 150;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
  return (
    <section className="panel p-5">
      <p className="eyebrow uppercase">Streaming research feed</p>
      <h2 className="mt-1 text-xl font-semibold">Array output over time</h2>
      <svg viewBox="0 0 570 240" className="mt-3 w-full" role="img"
        aria-label="Thirty most recent synthetic wind farm power measurements">
        {[60, 110, 160, 210].map((y) => (
          <line key={y} x1="25" x2="545" y1={y} y2={y}
            stroke="#305064" strokeDasharray="4 4" />
        ))}
        <polyline points={line} stroke="#68e3d5" fill="none"
          strokeWidth="3" strokeLinejoin="round" />
        <text x="25" y="231" fontSize="12" fill="#9fb6c1">Older</text>
        <text x="500" y="231" fontSize="12" fill="#9fb6c1">Now</text>
      </svg>
      <p className="muted text-xs">{values.length} samples; values in MW.</p>
    </section>
  );
}
