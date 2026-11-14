import { apiBase } from "@/lib/api-client";
import type { Snapshot } from "@/types/domain";

export function connectWindStream(
  onSample: (sample: Snapshot) => void,
  onStatus: (status: "live" | "offline") => void,
): () => void {
  const url = new URL(apiBase);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws/telemetry";
  url.search = "";
  const socket = new WebSocket(url.toString());
  socket.onopen = () => onStatus("live");
  socket.onclose = () => onStatus("offline");
  socket.onerror = () => onStatus("offline");
  socket.onmessage = (event: MessageEvent<string>) => {
    try {
      const sample = JSON.parse(event.data) as Snapshot;
      if (sample.research_only && Array.isArray(sample.turbines)) {
        onSample(sample);
      }
    } catch {
      onStatus("offline");
    }
  };
  return () => socket.close(1000, "Dashboard left view");
}
