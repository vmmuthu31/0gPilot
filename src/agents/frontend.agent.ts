import { computeService } from "@/services/compute.service";

export interface FrontendAgentInput {
  prompt: string;

  architecture?: string;
}

export interface FrontendAgentResult {
  success: boolean;

  code?: string;

  raw?: unknown;

  error?: string;
}

const SYSTEM_PROMPT = `
You are a world-class frontend engineer.

Stack:
- Next.js App Router
- TypeScript
- TailwindCSS
- Framer Motion
- shadcn/ui

Requirements:
- futuristic design
- responsive
- production-ready
- clean architecture
- modular components
- scalable folder structure
- beautiful animations
- dark mode optimized

Generate:
- pages
- layouts
- sections
- reusable components
- Tailwind styling

Return ONLY code.
`;

class FrontendAgent {
  async execute(input: FrontendAgentInput): Promise<FrontendAgentResult> {
    try {
      const response = await computeService.chat(
        [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },

          {
            role: "user",
            content: `
Project:
${input.prompt}

Architecture:
${input.architecture || ""}
`,
          },
        ],
        {
          temperature: 0.7,
          max_tokens: 6000,
        },
      );

      if (!response.success) {
        return {
          success: false,
          error: response.error || "Frontend generation failed",
        };
      }

      return {
        success: true,

        code: response.content || "",

        raw: response,
      };
    } catch (error: unknown) {
      console.error("Frontend Agent Error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Frontend agent execution failed";
      return {
        success: false,

        error: message,
      };
    }
  }
}

export const frontendAgent = new FrontendAgent();
