import type { Alert } from "@/types/domain";

type Props = { alerts: Alert[] };

export function AlertRail({ alerts }: Props) {
  return (
    <section className="panel p-5">
      <p className="eyebrow uppercase">Synthetic research thresholds</p>
      <h2 className="mt-1 text-xl font-semibold">Condition alerts</h2>
      <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
        {alerts.length === 0 && <p className="muted text-sm">No active screen alerts.</p>}
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-lg border border-[#53614a]
            bg-[#3d382738] px-3 py-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold">{alert.turbine_id}</span>
              <span className="text-warning uppercase">{alert.severity}</span>
            </div>
            <p className="muted mt-1 text-xs">{alert.message}</p>
            <p className="mt-1 text-xs">Index: {alert.value.toFixed(3)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
