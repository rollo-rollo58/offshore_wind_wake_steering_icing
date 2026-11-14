import type { Snapshot } from "@/types/domain";

type Props = { snapshot: Snapshot | null };

function curve(speed: number) {
  if (speed < 3 || speed > 25) return 0;
  const cp = Math.min(0.46, 0.46 * (1 - Math.exp(-0.65 * (speed - 3))) *
    Math.exp(-0.005 * Math.max(0, speed - 11) ** 2));
  return Math.min(8.5, 0.5 * 1.225 * Math.PI * 95 ** 2 * cp * speed ** 3 / 1e6);
}

export function PowerCurve({ snapshot }: Props) {
  const points = Array.from({ length: 53 }, (_, i) => {
    const x = i * 0.5;
    return `${44 + x * 18},${210 - curve(x) * 20}`;
  }).join(" ");
  const speed = snapshot?.scenario.wind_speed_mps ?? 11;
  return (
    <section className="panel p-5">
      <p className="eyebrow uppercase">Power coefficient · simulation</p>
      <h2 className="mt-1 text-xl font-semibold">Turbine power curve</h2>
      <svg viewBox="0 0 560 260" className="mt-4 w-full" role="img"
        aria-label="Reference turbine power curve with current wind marker">
        {[0, 4, 8].map((power) => (
          <g key={power}>
            <line x1="44" y1={210 - power * 20} x2="530"
              y2={210 - power * 20} stroke="#305064" strokeDasharray="4 5" />
            <text x="12" y={215 - power * 20} fill="#9fb6c1" fontSize="13">
              {power}
            </text>
          </g>
        ))}
        <polyline points={points} fill="none" stroke="#68e3d5" strokeWidth="3"
          strokeLinejoin="round" />
        <line x1={44 + speed * 18} x2={44 + speed * 18} y1="24" y2="210"
          stroke="#ffd07a" strokeWidth="2" strokeDasharray="6 5" />
        <text x="40" y="247" fill="#9fb6c1" fontSize="13">0 m/s</text>
        <text x="470" y="247" fill="#9fb6c1" fontSize="13">26 m/s</text>
        <text x="50" y="22" fill="#9fb6c1" fontSize="12">MW</text>
      </svg>
    </section>
  );
}
