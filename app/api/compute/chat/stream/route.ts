import { computeService, type ChatMessage } from "@/services/compute.service";
import { type ComputeTask } from "@/services/compute.routing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isChatRole(value: unknown): value is ChatMessage["role"] {
  return value === "system" || value === "user" || value === "assistant";
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;

  const maybe = value as { role?: unknown; content?: unknown };

  return isChatRole(maybe.role) && typeof maybe.content === "string";
}

function isTask(value: unknown): value is ComputeTask {
  return (
    value === "planner" ||
    value === "frontend" ||
    value === "contract" ||
    value === "audit" ||
    value === "backend" ||
    value === "database" ||
    value === "testing" ||
    value === "deploy" ||
    value === "analytics" ||
    value === "general"
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return Response.json(
      { success: false, error: "Invalid request" },
      { status: 400 },
    );
  }

  const { messages, temperature, max_tokens, model, task } = body as {
    messages?: unknown;
    temperature?: unknown;
    max_tokens?: unknown;
    model?: unknown;
    task?: unknown;
  };

  if (!Array.isArray(messages) || messages.some((m) => !isChatMessage(m))) {
    return Response.json(
      { success: false, error: "messages must be an array of {role, content}" },
      { status: 400 },
    );
  }

  const stream = computeService.streamChatSSE(messages, {
    task: isTask(task) ? task : "general",
    model: typeof model === "string" ? model : undefined,
    temperature: typeof temperature === "number" ? temperature : undefined,
    max_tokens: typeof max_tokens === "number" ? max_tokens : undefined,
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
