import type { Snapshot } from "@/types/domain";

type Props = { snapshot: Snapshot | null };
const fmt = (value: number) => value.toLocaleString(undefined, {
  maximumFractionDigits: 1,
});

export function EnergyKpis({ snapshot }: Props) {
  const cards = [
    { label: "Farm output", value: `${fmt((snapshot?.summary.net_power_kw ?? 0) / 1000)} MW`,
      detail: "instantaneous simulated output" },
    { label: "Wake losses", value: `${fmt((snapshot?.summary.wake_loss_kw ?? 0) / 1000)} MW`,
      detail: "difference from isolated turbines" },
    { label: "Capacity factor", value:
      `${fmt((snapshot?.summary.capacity_factor ?? 0) * 100)}%`,
      detail: "instantaneous; not annual AEP" },
    { label: "Wind velocity", value:
      `${fmt(snapshot?.scenario.wind_speed_mps ?? 0)} m/s`,
      detail: "array inflow at hub height" },
  ];
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Energy summary">
      {cards.map((card) => (
        <div key={card.label} className="panel p-5">
          <p className="eyebrow uppercase">{card.label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{card.value}</p>
          <p className="muted mt-2 text-xs">{card.detail}</p>
        </div>
      ))}
    </section>
  );
}
