import { computeService } from "@/services/compute.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const { input, model } = body as { input?: unknown; model?: unknown };

  if (
    typeof input !== "string" &&
    !(Array.isArray(input) && input.every((v) => typeof v === "string"))
  ) {
    return Response.json(
      { success: false, error: "input must be a string or string[]" },
      { status: 400 },
    );
  }

  const result = await computeService.embeddings(input, {
    model: typeof model === "string" ? model : undefined,
  });

  if (!result.success) {
    return Response.json(result, { status: 502 });
  }

  return Response.json(result);
}
