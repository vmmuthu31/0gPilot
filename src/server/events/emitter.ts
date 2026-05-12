import "server-only";
import { connection } from "@/server/queue/redis";

export function emitWorkflowEvent(projectId: string, status: string, payload?: unknown): void {
  connection
    .publish(`workflow:${projectId}:events`, JSON.stringify({ status, payload, timestamp: Date.now() }))
    .catch((err) => console.error("[Emitter] Redis publish failed:", err));
}
