import { computeService } from "@/services/compute.service";

import { DEPLOY_SYSTEM_PROMPT } from "@/prompts/deploy.prompt";

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

class DeployAgent {
  async execute(input: DeployAgentInput): Promise<DeployAgentResult> {
    try {
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
