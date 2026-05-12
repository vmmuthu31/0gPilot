import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { computeService } from "@/services/compute.service";

export const dynamic = "force-dynamic";

const EnhanceSchema = z.object({
  prompt: z.string().min(3).max(500),
});

const SYSTEM_PROMPT = `You are an expert prompt engineer for an AI software engineering platform called 0GPilot.
Users describe apps they want built. Your job is to take their rough idea and rewrite it into a detailed, structured project brief.

The enhanced prompt must:
- Be 100–200 words
- Specify the tech stack (framework, blockchain if relevant, database, styling)
- Describe the key features in bullet-point form embedded in prose
- Mention smart contract requirements if the idea involves Web3
- Be written as a direct instruction to the AI ("Build a...")
- Sound professional and complete

Return ONLY the enhanced prompt text. No preamble, no labels, no markdown.`;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: { code: "BAD_REQUEST" } }, { status: 400 });
  }

  const parsed = EnhanceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_FAILED", message: parsed.error.issues } },
      { status: 400 },
    );
  }

  const result = await computeService.chat(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: parsed.data.prompt },
    ],
    { task: "planner", temperature: 0.7, max_tokens: 400 },
  );

  if (!result.success) {
    return NextResponse.json({ error: { code: "COMPUTE_FAILED" } }, { status: 502 });
  }

  const enhanced = result.content?.trim() ?? parsed.data.prompt;

  return NextResponse.json({ enhanced });
}
