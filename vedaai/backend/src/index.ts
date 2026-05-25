import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import assignmentRoutes from "./routes/assignments";
import { initWebSocket } from "./services/wsService";
import { redisClient } from "./services/redisService";
 
const app = express();
const server = http.createServer(app);
 
const PORT = process.env.PORT || 4000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/vedaai";
 
// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
 
// ─── Health Check (required for Render) ──────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    mongo:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    redis: redisClient.status,
  });
});
 
// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/assignments", assignmentRoutes);
 
// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});
 
// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);
 
// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected");
 
    initWebSocket(server);
 
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔌 WebSocket available at ws://localhost:${PORT}/ws`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}
 
// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await mongoose.connection.close();
  redisClient.disconnect();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
 
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  redisClient.disconnect();
  process.exit(0);
});
 
bootstrap();
 