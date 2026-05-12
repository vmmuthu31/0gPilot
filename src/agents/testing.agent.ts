import { computeService } from "@/services/compute.service";

import { TESTING_SYSTEM_PROMPT } from "@/prompts/testing.prompt";

import { agentFail, agentOk, type AgentResult } from "@/types/agent.types";

export interface TestingAgentInput {
  prompt: string;

  architecture?: string;

  frontend?: string;

  backend?: string;

  contracts?: string;
}

export type TestingAgentResult = AgentResult<{ tests: string }>;

class TestingAgent {
  async execute(input: TestingAgentInput): Promise<TestingAgentResult> {
    try {
      if (!input.prompt.trim()) {
        return agentFail("INVALID_INPUT", "No prompt provided");
      }

      const response = await computeService.chat(
        [
          {
            role: "system",
            content: TESTING_SYSTEM_PROMPT,
          },

          {
            role: "user",
            content: `
Project:
${input.prompt}

Architecture:
${input.architecture || ""}

Frontend:
${input.frontend || ""}

Backend:
${input.backend || ""}

Contracts:
${input.contracts || ""}
`,
          },
        ],
        {
          temperature: 0.3,
          max_tokens: 4000,
        },
      );

      if (!response.success) {
        return agentFail(
          "UPSTREAM_COMPUTE_FAILED",
          response.error || "Testing output generation failed",
          undefined,
          response,
        );
      }

      return agentOk({ tests: response.content || "" }, response);
    } catch (error: unknown) {
      console.error("Testing Agent Error:", error);

      return agentFail(
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Testing agent failed",
        undefined,
        error,
      );
    }
  }
}

export const testingAgent = new TestingAgent();
