import type { Snapshot } from "@/types/domain";

type Props = { snapshot: Snapshot | null };

export function FatigueMatrix({ snapshot }: Props) {
  const cells = snapshot?.turbines ?? [];
  return (
    <section className="panel p-5">
      <p className="eyebrow uppercase">Structural exposure proxy</p>
      <h2 className="mb-4 mt-1 text-xl font-semibold">Fatigue heat matrix</h2>
      <div className="grid grid-cols-4 gap-2">
        {cells.map((cell) => {
          const intensity = Math.min(1, cell.fatigue_index);
          const background = `rgba(255, 208, 122, ${0.08 + intensity * 0.85})`;
          return (
            <div key={cell.turbine_id} className="rounded-md border border-[#365166]
              p-3 text-center" style={{ background }}
              title={`Exposure index ${cell.fatigue_index.toFixed(3)}`}>
              <p className="text-xs">{cell.turbine_id.slice(3)}</p>
              <p className="mt-1 text-lg font-semibold">
                {cell.fatigue_index.toFixed(2)}</p>
            </div>
          );
        })}
      </div>
      <p className="muted mt-3 text-xs">Index 0–2.5; higher indicates exposure, not failure.</p>
    </section>
  );
}
