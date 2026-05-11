import { computeService } from "@/services/compute.service";

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

const SYSTEM_PROMPT = `
You are a senior Solidity engineer.

Requirements:
- Solidity ^0.8.20
- OpenZeppelin
- gas optimized
- secure
- modular
- production-ready

Security Requirements:
- ReentrancyGuard
- Ownable
- AccessControl
- Pausable
- overflow protection

Generate:
- smart contracts
- interfaces
- deployment-ready code
- events
- modifiers
- comments

Return ONLY Solidity code.
`;

class ContractAgent {
  async execute(input: ContractAgentInput): Promise<ContractAgentResult> {
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
