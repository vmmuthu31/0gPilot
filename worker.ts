import "dotenv/config";
import { workflowWorker } from "./src/server/queue/worker";

console.log("[0GPilot Worker] Starting BullMQ worker process...");
console.log(`[0GPilot Worker] Redis: ${process.env.REDIS_URL || "redis://localhost:6379"}`);
console.log(`[0GPilot Worker] Environment: ${process.env.NODE_ENV || "development"}`);

process.on("SIGTERM", async () => {
  console.log("[0GPilot Worker] Received SIGTERM — graceful shutdown");
  await workflowWorker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[0GPilot Worker] Received SIGINT — graceful shutdown");
  await workflowWorker.close();
  process.exit(0);
});

workflowWorker.on("ready", () => {
  console.log("[0GPilot Worker] Worker is ready and listening for jobs");
});
