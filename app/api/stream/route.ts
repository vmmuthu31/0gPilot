import { NextRequest } from "next/server";
import Redis from "ioredis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return new Response("Missing projectId", { status: 400 });
  }

  const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
  
  const stream = new ReadableStream({
    start(controller) {
      const channel = `workflow:${projectId}:events`;
      redis.subscribe(channel, (err) => {
        if (err) {
          controller.error(err);
          return;
        }
      });

      redis.on("message", (ch, message) => {
        if (ch === channel) {
          controller.enqueue(new TextEncoder().encode(`data: ${message}\n\n`));
        }
      });

      req.signal.addEventListener("abort", () => {
        redis.quit();
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
