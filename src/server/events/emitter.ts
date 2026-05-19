import { connection } from "@/server/queue/redis";

const EVENT_LOG_TTL_SECONDS = 60 * 60; // keep logs for 1 hour
const EVENT_LOG_MAX_LEN = 200; // rolling window

/**
 * Publish a workflow event and buffer it in a Redis list so SSE clients
 * that reconnect can replay events they missed.
 */
export function emitWorkflowEvent(projectId: string, status: string, payload?: unknown): void {
  const message = JSON.stringify({ status, payload, timestamp: Date.now() });
  const channel = `workflow:${projectId}:events`;
  const bufferKey = `workflow:${projectId}:event-log`;

  // Publish to live subscribers
  connection
    .publish(channel, message)
    .catch((err) => console.error("[Emitter] Redis publish failed:", err));

  // Append to replay buffer (capped list, auto-expires)
  connection
    .pipeline()
    .rpush(bufferKey, message)
    .ltrim(bufferKey, -EVENT_LOG_MAX_LEN, -1)
    .expire(bufferKey, EVENT_LOG_TTL_SECONDS)
    .exec()
    .catch((err) => console.error("[Emitter] Redis buffer write failed:", err));
}
