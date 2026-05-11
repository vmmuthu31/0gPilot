import { computeService } from "@/services/compute.service";

export interface DeployAgentInput {
  prompt: string;

  architecture?: string;

  contracts?: string;
}

export interface DeployAgentResult {
  success: boolean;

  deployment?: string;

  raw?: unknown;

  error?: string;
}

const SYSTEM_PROMPT = `
You are a senior blockchain DevOps engineer.

You specialize in:
- Hardhat
- Foundry
- 0G Chain
- Docker
- CI/CD
- deployment pipelines
- RPC configuration
- environment setup
- smart contract verification

Generate:
1. Deployment scripts
2. Environment variables
3. Hardhat config
4. Verification commands
5. Deployment instructions
6. Production deployment flow

Requirements:
- production ready
- modular
- secure
- scalable

Return markdown + code.
`;

class DeployAgent {
  async execute(input: DeployAgentInput): Promise<DeployAgentResult> {
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

Contracts:
${input.contracts || ""}
`,
          },
        ],
        {
          temperature: 0.3,
          max_tokens: 5000,
        },
      );

      if (!response.success) {
        return {
          success: false,
          error: response.error || "Deployment generation failed",
        };
      }

      return {
        success: true,

        deployment: response.content || "",

        raw: response,
      };
    } catch (error: unknown) {
      console.error("Deploy Agent Error:", error);

      return {
        success: false,

        error: error instanceof Error ? error.message : "Deploy agent failed",
      };
    }
  }
}

export const deployAgent = new DeployAgent();
