import "server-only";
import { connection } from "@/server/queue/redis";

export function emitWorkflowEvent(projectId: string, status: string, payload?: unknown) {
  connection.publish(`workflow:${projectId}:events`, JSON.stringify({ status, payload, timestamp: Date.now() }));
}
