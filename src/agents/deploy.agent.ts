import { computeService } from "@/services/compute.service";

import { DEPLOY_SYSTEM_PROMPT } from "@/prompts/deploy.prompt";

import { agentFail, agentOk, type AgentResult } from "@/types/agent.types";

export interface DeployAgentInput {
  prompt: string;

  architecture?: string;

  contracts?: string;
}

export type DeployAgentResult = AgentResult<{ deployment: string }>;

class DeployAgent {
  async execute(input: DeployAgentInput): Promise<DeployAgentResult> {
    try {
      if (!input.prompt.trim()) {
        return agentFail("INVALID_INPUT", "No prompt provided");
      }

      const response = await computeService.chat(
        [
          {
            role: "system",
            content: DEPLOY_SYSTEM_PROMPT,
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
          task: "deploy",
          temperature: 0.3,
          max_tokens: 5000,
        },
      );

      if (!response.success) {
        return agentFail(
          "UPSTREAM_COMPUTE_FAILED",
          response.error || "Deployment generation failed",
          undefined,
          response,
        );
      }

      return agentOk({ deployment: response.content || "" }, response);
    } catch (error: unknown) {
      console.error("Deploy Agent Error:", error);

      return agentFail(
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Deploy agent failed",
        undefined,
        error,
      );
    }
  }
}

export const deployAgent = new DeployAgent();
