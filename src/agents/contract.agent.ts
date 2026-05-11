import { computeService } from "@/services/compute.service";

import { CONTRACT_SYSTEM_PROMPT } from "@/prompts/contract.prompt";

export interface ContractAgentInput {
  prompt: string;

  architecture?: string;
}

export interface ContractAgentResult {
  success: boolean;

  contracts?: string;

  raw?: unknown;

  error?: string;
}

class ContractAgent {
  async execute(input: ContractAgentInput): Promise<ContractAgentResult> {
    try {
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
        return {
          success: false,
          error: response.error || "Contract generation failed",
        };
      }

      return {
        success: true,

        contracts: response.content || "",

        raw: response,
      };
    } catch (error: unknown) {
      console.error("Contract Agent Error:", error);

      return {
        success: false,

        error: error instanceof Error ? error.message : "Contract agent failed",
      };
    }
  }
}

export const contractAgent = new ContractAgent();
