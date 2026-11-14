import type { Snapshot } from "@/types/domain";

type Props = { snapshot: Snapshot | null };

export function WindRose({ snapshot }: Props) {
  const deg = snapshot?.scenario.direction_toward_deg ?? 12;
  const radians = (deg * Math.PI) / 180;
  const dx = Math.cos(radians) * 75;
  const dy = Math.sin(radians) * 75;
  return (
    <section className="panel flex flex-col p-5">
      <p className="eyebrow uppercase">Airflow vector</p>
      <h2 className="mt-1 text-xl font-semibold">Wind-direction compass</h2>
      <svg viewBox="0 0 270 270" className="mx-auto h-52" role="img"
        aria-label={`Wind direction ${deg.toFixed(0)} degrees toward east-reference`}>
        {[42, 75, 103].map((radius) => (
          <circle key={radius} cx="135" cy="135" r={radius} stroke="#2c5665"
            fill="none" strokeDasharray="4 5" />
        ))}
        <path d="M135 25 V245 M25 135 H245" stroke="#31566b" />
        <text x="135" y="18" textAnchor="middle" fill="#9bbbc7">N</text>
        <text x="254" y="140" textAnchor="middle" fill="#9bbbc7">E</text>
        <text x="135" y="263" textAnchor="middle" fill="#9bbbc7">S</text>
        <text x="14" y="140" textAnchor="middle" fill="#9bbbc7">W</text>
        <line x1="135" y1="135" x2={135 + dx} y2={135 - dy}
          stroke="#68e3d5" strokeWidth="5" strokeLinecap="round" />
        <circle cx={135 + dx} cy={135 - dy} r="8" fill="#ffd07a" />
      </svg>
      <p className="muted mt-auto text-center text-xs">
        {deg.toFixed(1)}° toward · flow-based bearing (not meteorological from)
      </p>
    </section>
  );
}
