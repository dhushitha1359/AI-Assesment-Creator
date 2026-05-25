import { useEffect, useRef, useCallback } from "react";
import { useAssignmentStore } from "../store/assignmentStore";
import { WSMessage } from "../types";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000/ws";

export function useWebSocket(assignmentId?: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setWsConnected, handleWSMessage } = useAssignmentStore();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      if (assignmentId) {
        ws.send(JSON.stringify({ type: "subscribe", assignmentId }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        handleWSMessage(msg);
      } catch {
        // ignore
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      // Auto-reconnect after 3s
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [assignmentId, setWsConnected, handleWSMessage]);

  const subscribe = useCallback((id: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "subscribe", assignmentId: id }));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { subscribe };
}
