// src/hooks/useTelemetryWatcher.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface TelemetryUpdate {
  telemetry_id: number;
  value: number;
  quality: number;
  timestamp: string;
}

// tag string → live value info
export type LiveValueMap = Record<string, {
  value: number;
  quality: number;
  timestamp: string;
}>;
// Single socket instance shared across the app
let socket: Socket | null = null;

const getSocket = (): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_BACKEND_ENDPOINT, {
      autoConnect: false,
    });
  }
  return socket;
};

export const useTelemetryWatcher = (
  selectedRows: { tag: string; id: number }[]
) => {
  const [liveValues, setLiveValues] = useState<LiveValueMap>({});
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    if (selectedRows.length === 0) return;

    const ws = getSocket();

    const idToTag: Record<number, string> = {};
    selectedRows.forEach(({ tag, id }) => {
      idToTag[id] = tag;
    });

    const telemetryIds = selectedRows.map((r) => r.id);

    const handleConnect = () => {
      setConnected(true);
      console.log("[SOCKET] ✅ Connected to server");
      console.log("[SOCKET] Subscribing to telemetry_ids:", telemetryIds);
      ws.emit("subscribeTags", telemetryIds);
    };

    const handleDisconnect = (reason: string) => {
      setConnected(false);
      console.warn("[SOCKET] ❌ Disconnected. Reason:", reason);
    };

    const handleConnectError = (err: Error) => {
      console.error("[SOCKET] 🔴 Connection error:", err.message);
    };

    const handleUpdate = (data: TelemetryUpdate) => {
      console.log("[SOCKET] 📩 telemetry_update received:", data);

      const tag = idToTag[data.telemetry_id];

      if (!tag) {
        console.warn("[SOCKET] ⚠️ Update received for unknown telemetry_id:", data.telemetry_id);
        console.warn("[SOCKET] Known ids are:", Object.keys(idToTag));
        return;
      }

      console.log(`[SOCKET] ✅ Updating tag "${tag}" with value:`, data.value);

      setLiveValues((prev) => ({
        ...prev,
        [tag]: {
          value: data.value,
          quality: data.quality,
          timestamp: data.timestamp,
        },
      }));
    };



    // Log every single event coming from socket for debugging
    ws.onAny((eventName: string, ...args: unknown[]) => {
      console.log(`[SOCKET] 🔔 Event received: "${eventName}"`, args);
    });

    ws.on("connect", handleConnect);
    ws.on("disconnect", handleDisconnect);
    ws.on("connect_error", handleConnectError);
    ws.on("telemetry_update", handleUpdate);

    if (!ws.connected) {
      console.log("[SOCKET] Not connected yet — attempting to connect...");
      ws.connect();
    } else {
      console.log("[SOCKET] Already connected — subscribing immediately");
      setConnected(true);
      ws.emit("subscribeTags", telemetryIds);
    }

    return () => {
      console.log("[SOCKET] 🧹 Cleanup — unsubscribing telemetry_ids:", telemetryIds);
      ws.emit("unsubscribeTags", telemetryIds);
      ws.off("connect", handleConnect);
      ws.off("disconnect", handleDisconnect);
      ws.off("connect_error", handleConnectError);
      ws.off("telemetry_update", handleUpdate);
      ws.offAny();
    };
  }, [JSON.stringify(selectedRows)]);

  return { liveValues, connected };
};