"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { connectWindStream } from "@/lib/websocket-stream";
import type { Alert, Farm, Snapshot } from "@/types/domain";

export function useDomainTelemetry() {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [status, setStatus] = useState<"connecting" | "live" | "offline">(
    "connecting",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([api.farm(), api.telemetry(), api.alerts()]).then(
      ([nextFarm, nextSample, nextAlerts]) => {
        if (!active) return;
        setFarm(nextFarm);
        setSnapshot(nextSample);
        setHistory([nextSample]);
        setAlerts(nextAlerts);
      },
    ).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : String(reason));
    });
    const close = connectWindStream((sample) => {
      if (!active) return;
      setSnapshot(sample);
      setHistory((items) => [...items.slice(-29), sample]);
    }, (nextStatus) => {
      if (active) setStatus(nextStatus);
    });
    return () => { active = false; close(); };
  }, []);

  return { farm, snapshot, history, alerts, status, error };
}
