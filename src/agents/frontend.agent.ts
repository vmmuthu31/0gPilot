import { computeService } from "@/services/compute.service";

import { FRONTEND_SYSTEM_PROMPT } from "@/prompts/frontend.prompt";

import { agentFail, agentOk, type AgentResult } from "@/types/agent.types";

export interface FrontendAgentInput {
  prompt: string;

  architecture?: string;
}

export type FrontendAgentResult = AgentResult<{ code: string }>;

class FrontendAgent {
  async execute(input: FrontendAgentInput): Promise<FrontendAgentResult> {
    try {
      if (!input.prompt.trim()) {
        return agentFail("INVALID_INPUT", "No prompt provided");
      }

      const response = await computeService.chat(
        [
          {
            role: "system",
            content: FRONTEND_SYSTEM_PROMPT,
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
        return agentFail(
          "UPSTREAM_COMPUTE_FAILED",
          response.error || "Frontend generation failed",
          undefined,
          response,
        );
      }

      return agentOk({ code: response.content || "" }, response);
    } catch (error: unknown) {
      console.error("Frontend Agent Error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Frontend agent execution failed";

      return agentFail("INTERNAL_ERROR", message, undefined, error);
    }
  }
}

export const frontendAgent = new FrontendAgent();
