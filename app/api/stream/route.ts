import { NextRequest } from "next/server";
import Redis from "ioredis";
import { extractBearerToken, verifySession } from "@/server/auth/session";
import { db } from "@/db";
import { env } from "@/server/config/env";

export const dynamic = "force-dynamic";

// How many recent events to replay to a reconnecting client
const REPLAY_BUFFER_SIZE = 100;
// Key format: workflow:{projectId}:event-log
function bufferKey(projectId: string) {
  return `workflow:${projectId}:event-log`;
}

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return new Response("Missing projectId", { status: 400 });
  }

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

  // Subscriber connection (blocking; can't be used for other commands)
  const sub = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
  // Reader connection for replaying buffered events
  const reader = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

  sub.on("error", (err) => console.error("[SSE Sub] error:", err));
  reader.on("error", (err) => console.error("[SSE Reader] error:", err));

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
          // controller already closed
        }
      }

      function heartbeat() {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          // controller already closed
        }
      }

      // --- Replay buffered events so reconnects don't miss anything ---
      try {
        const buffered = await reader.lrange(bufferKey(projectId), 0, -1);
        for (const msg of buffered) {
          send(msg);
        }
      } catch (e) {
        console.error("[SSE] replay failed:", e);
      }

      // --- Subscribe for live events ---
      sub.subscribe(channel, (err) => {
        if (err) {
          controller.error(err);
          sub.quit().catch(() => {});
          reader.quit().catch(() => {});
          return;
        }
      });

      sub.on("message", (ch, message) => {
        if (ch === channel) {
          send(message);
        }
      });

      // --- Heartbeat every 20s to keep the connection alive ---
      const heartbeatTimer = setInterval(heartbeat, 20_000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeatTimer);
        sub.quit().catch(() => {});
        reader.quit().catch(() => {});
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
