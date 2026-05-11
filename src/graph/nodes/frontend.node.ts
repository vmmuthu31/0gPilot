import { computeService } from "@/services/compute.service";

import { WorkflowState } from "../state";

export async function frontendNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  try {
    console.log("Executing Frontend Node...");

    const result = await computeService.chat(
      [
        {
          role: "system",
          content: `
You are a senior frontend engineer.

Stack:
- Next.js
- TailwindCSS
- Framer Motion
- shadcn/ui

Requirements:
- futuristic UI
- responsive
- modular
- production ready

Return ONLY code.
`,
        },

        {
          role: "user",
          content: `
Project:
${state.prompt}

Architecture:
${state.architecture}
`,
        },
      ],
      {
        temperature: 0.7,
        max_tokens: 5000,
      },
    );

    if (!result.success) {
      return {
        error: result.error || "Frontend generation failed",

        status: "FAILED",
      };
    }

    return {
      frontend: result.content || "",

      status: "Frontend Generated",
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Frontend node execution failed";
    console.error(message);

    return {
      error: message || "Frontend node execution failed",

      status: "FAILED",
    };
  }
}
