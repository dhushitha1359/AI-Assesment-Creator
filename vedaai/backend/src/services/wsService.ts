import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

interface WSClient {
  ws: WebSocket;
  assignmentId?: string;
}

const clients = new Map<string, WSClient>();

export function initWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    const clientId = Math.random().toString(36).slice(2);
    clients.set(clientId, { ws });
    console.log(`🔌 WS client connected: ${clientId}`);

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "subscribe" && msg.assignmentId) {
          const client = clients.get(clientId);
          if (client) {
            client.assignmentId = msg.assignmentId;
            clients.set(clientId, client);
            ws.send(
              JSON.stringify({
                type: "subscribed",
                assignmentId: msg.assignmentId,
              })
            );
          }
        }
      } catch {
        // ignore malformed messages
      }
    });

    ws.on("close", () => {
      clients.delete(clientId);
      console.log(`🔌 WS client disconnected: ${clientId}`);
    });

    ws.on("error", (err) => console.error("WS error:", err));

    // Send initial ping
    ws.send(JSON.stringify({ type: "connected", clientId }));
  });

  return wss;
}

export function broadcastToAssignment(
  assignmentId: string,
  payload: object
): void {
  const message = JSON.stringify(payload);
  clients.forEach(({ ws, assignmentId: subId }) => {
    if (subId === assignmentId && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

export function broadcastAll(payload: object): void {
  const message = JSON.stringify(payload);
  clients.forEach(({ ws }) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(message);
  });
}
