import { SYSTEM_MODERATOR_PROMPT } from "@/prompts/moderator.prompt";
import { computeService } from "@/services/compute.service";

export async function checkPromptSafety(prompt: string): Promise<boolean> {
  const systemPrompt = SYSTEM_MODERATOR_PROMPT;

  try {
    const res = await computeService.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      { temperature: 0.0, max_tokens: 16 },
    );

    if (res.success && res.content) {
      const txt = res.content.toUpperCase().trim();
      return !txt.startsWith("UNSAFE");
    }

    return true;
  } catch (err) {
    console.error("Moderation error:", err);
    return true;
  }
}
