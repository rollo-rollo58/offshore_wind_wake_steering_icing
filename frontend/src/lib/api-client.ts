import type { Alert, Farm, Optimization, Scenario, Simulation, Snapshot } from
  "@/types/domain";

export const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`${apiBase}${path}`, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    if (!response.ok) {
      throw new Error(`Research API returned ${response.status}`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  farm: async () => (await request<{ farm: Farm }>("/api/v1/farm")).farm,
  telemetry: () => request<Snapshot>("/api/v1/telemetry"),
  alerts: async () => (await request<{ alerts: Alert[] }>("/api/v1/alerts")).alerts,
  simulate: (scenario: Scenario) => request<Simulation>("/api/v1/simulate", {
    method: "POST", body: JSON.stringify(scenario),
  }),
  optimize: (scenario: Scenario) => request<Optimization>("/api/v1/optimize", {
    method: "POST", body: JSON.stringify(scenario),
  }),
};
