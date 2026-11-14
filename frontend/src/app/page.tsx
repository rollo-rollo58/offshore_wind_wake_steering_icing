"use client";

import { AlertRail } from "@/components/AlertRail";
import { EnergyKpis } from "@/components/EnergyKpis";
import { FatigueMatrix } from "@/components/FatigueMatrix";
import { IcingRiskPanel } from "@/components/IcingRiskPanel";
import { PowerCurve } from "@/components/PowerCurve";
import { ScenarioControls } from "@/components/ScenarioControls";
import { SeaGridMap } from "@/components/SeaGridMap";
import { SteeringWorkbench } from "@/components/SteeringWorkbench";
import { TelemetryTimeline } from "@/components/TelemetryTimeline";
import { TurbineStrip } from "@/components/TurbineStrip";
import { WakeCorridors } from "@/components/WakeCorridors";
import { WindRose } from "@/components/WindRose";
import { useDomainTelemetry } from "@/hooks/useDomainTelemetry";

export default function OperationsPage() {
  const { farm, snapshot, history, alerts, status, error } = useDomainTelemetry();
  return (
    <main className="mx-auto max-w-[1600px] space-y-5 px-4 py-6 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 py-3">
        <div>
          <p className="eyebrow font-bold uppercase">AEROWAKE / NORTH SHOAL</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
            Offshore energy command research
          </h1>
          <p className="muted mt-2 text-sm">
            Array wakes · yaw steering · blade icing · simulated telemetry
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#2b5061]
          bg-[#0c2939] px-4 py-3 text-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${status === "live" ?
            "bg-lagoon" : "bg-warning"}`} />
          <span>{status === "live" ? "SYNTHETIC LIVE" : "FEED OFFLINE"}</span>
        </div>
      </header>
      {error && <div role="alert" className="rounded-lg bg-[#493829] p-3
        text-warning">API connection: {error}</div>}
      <div className="rounded-lg border border-[#527776] bg-[#204b4933]
        px-4 py-2 text-xs text-lagoon">
        RESEARCH DEMONSTRATOR — Values are not measured and cannot control turbines.
      </div>
      <EnergyKpis snapshot={snapshot} />
      <div className="grid gap-5 lg:grid-cols-3">
        <SeaGridMap farm={farm} snapshot={snapshot} />
        <WakeCorridors snapshot={snapshot} />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <PowerCurve snapshot={snapshot} />
        <WindRose snapshot={snapshot} />
        <IcingRiskPanel snapshot={snapshot} />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <TelemetryTimeline history={history} />
        <FatigueMatrix snapshot={snapshot} />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <ScenarioControls initial={snapshot?.scenario ?? null} />
        <SteeringWorkbench scenario={snapshot?.scenario ?? null} />
        <AlertRail alerts={alerts} />
      </div>
      <TurbineStrip snapshot={snapshot} />
      <footer className="muted border-t border-[#214354] py-5 text-xs">
        AeroWake · 12 synthetic offshore turbines · engineering research only
      </footer>
    </main>
  );
}
