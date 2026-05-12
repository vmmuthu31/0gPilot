import { computeService } from "@/services/compute.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isSize(value: unknown): value is "256x256" | "512x512" | "1024x1024" {
  return value === "256x256" || value === "512x512" || value === "1024x1024";
}

function isResponseFormat(value: unknown): value is "url" | "b64_json" {
  return value === "url" || value === "b64_json";
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

  const { prompt, model, size, response_format } = body as {
    prompt?: unknown;
    model?: unknown;
    size?: unknown;
    response_format?: unknown;
  };

  if (typeof prompt !== "string" || !prompt.trim()) {
    return Response.json(
      { success: false, error: "prompt is required" },
      { status: 400 },
    );
  }

  const result = await computeService.generateImage(prompt, {
    model: typeof model === "string" ? model : undefined,
    size: isSize(size) ? size : undefined,
    response_format: isResponseFormat(response_format)
      ? response_format
      : undefined,
  });

  if (!result.success) {
    return Response.json(result, { status: 502 });
  }

  return Response.json(result);
}
