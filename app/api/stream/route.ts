import { NextRequest } from "next/server";
import { connection, sseEventBus } from "@/server/queue/redis";
import { extractBearerToken, verifySession } from "@/server/auth/session";
import { db } from "@/db";

export const dynamic = "force-dynamic";

// How many buffered events to replay to a freshly connected client
const REPLAY_BUFFER_SIZE = 100;

function bufferKey(projectId: string) {
  return `workflow:${projectId}:event-log`;
}

/**
 * GET /api/stream?projectId=…
 *
 * Server-Sent Events endpoint.
 *
 * Architecture (connection-safe):
 *  - Replay: one lrange call on the shared `connection` singleton — no new client.
 *  - Live events: sseEventBus (in-memory EventEmitter) receives messages from
 *    the single globalSub that psubscribes to "workflow:*:events".
 *  - Cleanup: on disconnect, only the in-memory listener is removed — no Redis
 *    quit/disconnect call needed.
 *
 * Total Redis connections for the whole app:
 *   2 fixed (connection + globalSub) + BullMQ's internal pool (~2-3)
 *   — regardless of the number of open browser tabs or SSE reconnects.
 */
export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return new Response("Missing projectId", { status: 400 });
  }

  // Accept token from Authorization header or query param (EventSource can't
  // set custom headers, so we pass the JWT as a query param as fallback)
  let token = extractBearerToken(req.headers.get("Authorization"));
  if (!token) {
    const q = req.nextUrl.searchParams.get("token");
    token = q ? decodeURIComponent(q) : null;
  }
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const session = await verifySession(token);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const project = await db.project.findFirst({
    where: { id: projectId, userId: session.userId },
    select: { id: true },
  });
  if (!project) {
    return new Response("Forbidden", { status: 403 });
  }

  const channel = `workflow:${projectId}:events`;
  const encoder = new TextEncoder();
  let eventId = 0;

  const stream = new ReadableStream({
    async start(controller) {
      function send(message: string) {
        try {
          eventId++;
          controller.enqueue(
            encoder.encode(`id: ${eventId}\ndata: ${message}\n\n`),
          );
        } catch {
          // controller already closed — swallow silently
        }
      }

      function heartbeat() {
        try {
          // SSE comment frame — keeps the connection alive through proxies
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          // controller already closed
        }
      }

      // ── Replay missed events ──────────────────────────────────────────────
      // Uses the shared singleton — does NOT open a new Redis connection.
      try {
        const buffered = await connection.lrange(
          bufferKey(projectId),
          0,
          REPLAY_BUFFER_SIZE - 1,
        );
        for (const msg of buffered) {
          send(msg);
        }
      } catch (e) {
        console.error("[SSE] replay failed:", e);
      }

      // ── Live event subscription ───────────────────────────────────────────
      // Pure in-memory — the globalSub singleton already psubscribes to
      // "workflow:*:events" and fans out to sseEventBus.
      const onMessage = (msg: string) => send(msg);
      sseEventBus.on(channel, onMessage);

      // ── Heartbeat ─────────────────────────────────────────────────────────
      const heartbeatTimer = setInterval(heartbeat, 20_000);

      // ── Cleanup on disconnect ─────────────────────────────────────────────
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeatTimer);
        sseEventBus.off(channel, onMessage); // remove just this listener
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
