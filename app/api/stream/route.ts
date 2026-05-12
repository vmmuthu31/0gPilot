import { NextRequest } from "next/server";
import Redis from "ioredis";
import { extractBearerToken, verifySession } from "@/server/auth/session";
import { db } from "@/db";
import { env } from "@/server/config/env";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return new Response("Missing projectId", { status: 400 });
  }

  const token = extractBearerToken(req.headers.get("Authorization"));
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

  const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
  redis.on("error", (err) => console.error("[SSE Redis] error:", err));

  const channel = `workflow:${projectId}:events`;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      redis.subscribe(channel, (err) => {
        if (err) {
          controller.error(err);
          redis.quit().catch(() => {});
          return;
        }
      });

      redis.on("message", (ch, message) => {
        if (ch === channel) {
          try {
            controller.enqueue(encoder.encode(`data: ${message}\n\n`));
          } catch {
            // controller already closed
          }
        }
      });

      req.signal.addEventListener("abort", () => {
        redis.quit().catch(() => {});
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
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
