import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface TelemetryUpdate {
  telemetry_id: number;
  value: number;
  quality: number;
  timestamp: string;
}

export type LiveValueMap = Record<string, {
  value: number;
  quality: number;
  timestamp: string;
}>;

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

    const telemetryIds = selectedRows.map((row) => row.id);

    const handleConnect = () => {
      setConnected(true);
      ws.emit("subscribeTags", telemetryIds);
    };

    const handleDisconnect = (reason: string) => {
      setConnected(false);
      console.warn("[SOCKET] Disconnected:", reason);
    };

    const handleConnectError = (err: Error) => {
      console.error("[SOCKET] Connection error:", err.message);
    };

    const handleUpdate = (data: TelemetryUpdate) => {
      const tag = idToTag[data.telemetry_id];

      if (!tag) {
        console.warn("[SOCKET] Update received for unknown telemetry_id:", data.telemetry_id);
        return;
      }

      setLiveValues((prev) => ({
        ...prev,
        [tag]: {
          value: data.value,
          quality: data.quality,
          timestamp: data.timestamp,
        },
      }));
    };

    ws.on("connect", handleConnect);
    ws.on("disconnect", handleDisconnect);
    ws.on("connect_error", handleConnectError);
    ws.on("telemetry_update", handleUpdate);

    if (!ws.connected) {
      ws.connect();
    } else {
      setConnected(true);
      ws.emit("subscribeTags", telemetryIds);
    }

    return () => {
      ws.emit("unsubscribeTags", telemetryIds);
      ws.off("connect", handleConnect);
      ws.off("disconnect", handleDisconnect);
      ws.off("connect_error", handleConnectError);
      ws.off("telemetry_update", handleUpdate);
    };
  }, [JSON.stringify(selectedRows)]);

  return { liveValues, connected };
};
