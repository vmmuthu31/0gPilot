import { computeService } from "@/services/compute.service";

import { BACKEND_SYSTEM_PROMPT } from "@/prompts/backend.prompt";

import { agentFail, agentOk, type AgentResult } from "@/types/agent.types";

export interface BackendAgentInput {
  prompt: string;

  architecture?: string;

  contracts?: string;
}

export type BackendAgentResult = AgentResult<{ backend: string }>;

class BackendAgent {
  async execute(input: BackendAgentInput): Promise<BackendAgentResult> {
    try {
      if (!input.prompt.trim()) {
        return agentFail("INVALID_INPUT", "No prompt provided");
      }

      const response = await computeService.chat(
        [
          {
            role: "system",
            content: BACKEND_SYSTEM_PROMPT,
          },

          {
            role: "user",
            content: `
Project:
${input.prompt}

Architecture:
${input.architecture || ""}

Contracts:
${input.contracts || ""}
`,
          },
        ],
        {
          temperature: 0.4,
          max_tokens: 6000,
        },
      );

      if (!response.success) {
        return agentFail(
          "UPSTREAM_COMPUTE_FAILED",
          response.error || "Backend generation failed",
          undefined,
          response,
        );
      }

      return agentOk({ backend: response.content || "" }, response);
    } catch (error: unknown) {
      console.error("Backend Agent Error:", error);

      return agentFail(
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Backend agent failed",
        undefined,
        error,
      );
    }
  }
}

export const backendAgent = new BackendAgent();
