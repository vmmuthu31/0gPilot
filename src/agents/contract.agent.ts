import { computeService } from "@/services/compute.service";

import { CONTRACT_SYSTEM_PROMPT } from "@/prompts/contract.prompt";

import { agentFail, agentOk, type AgentResult } from "@/types/agent.types";

export interface ContractAgentInput {
  prompt: string;

  architecture?: string;
}

export type ContractAgentResult = AgentResult<{ contracts: string }>;

class ContractAgent {
  async execute(input: ContractAgentInput): Promise<ContractAgentResult> {
    try {
      if (!input.prompt.trim()) {
        return agentFail("INVALID_INPUT", "No prompt provided");
      }

      const response = await computeService.chat(
        [
          {
            role: "system",
            content: CONTRACT_SYSTEM_PROMPT,
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
          temperature: 0.3,
          max_tokens: 6000,
        },
      );

      if (!response.success) {
        return agentFail(
          "UPSTREAM_COMPUTE_FAILED",
          response.error || "Contract generation failed",
          undefined,
          response,
        );
      }

      return agentOk({ contracts: response.content || "" }, response);
    } catch (error: unknown) {
      console.error("Contract Agent Error:", error);

      return agentFail(
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Contract agent failed",
        undefined,
        error,
      );
    }
  }
}

export const contractAgent = new ContractAgent();
