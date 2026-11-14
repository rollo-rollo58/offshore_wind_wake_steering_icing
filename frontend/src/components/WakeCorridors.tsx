import type { Snapshot } from "@/types/domain";

type Props = { snapshot: Snapshot | null };

export function WakeCorridors({ snapshot }: Props) {
  const rows = snapshot?.turbines ?? [];
  const worst = [...rows].sort((a, b) => b.wake_loss_kw - a.wake_loss_kw).slice(0, 6);
  const maxLoss = Math.max(1, ...worst.map((entry) => entry.wake_loss_kw));
  return (
    <section className="panel p-5">
      <p className="eyebrow uppercase">Interference field</p>
      <h2 className="mb-5 mt-1 text-xl font-semibold">Wake-loss corridors</h2>
      <div className="space-y-4">
        {worst.map((row) => (
          <div key={row.turbine_id}>
            <div className="mb-1 flex justify-between text-xs">
              <span>{row.turbine_id}</span>
              <span className="muted">{row.wake_loss_kw.toFixed(0)} kW</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#244152]">
              <div className="h-full rounded-full bg-gradient-to-r from-lagoon to-warning"
                style={{ width: `${Math.max(2, row.wake_loss_kw / maxLoss * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="muted mt-6 text-xs">Worst six turbines relative to isolated flow.</p>
    </section>
  );
}
