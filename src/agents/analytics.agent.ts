import { computeService } from "@/services/compute.service";

import { ANALYTICS_SYSTEM_PROMPT } from "@/prompts/analytics.prompt";

import { agentFail, agentOk, type AgentResult } from "@/types/agent.types";

export interface AnalyticsAgentInput {
  prompt: string;

  architecture?: string;

  deployment?: string;
}

export type AnalyticsAgentResult = AgentResult<{ analytics: string }>;

class AnalyticsAgent {
  async execute(input: AnalyticsAgentInput): Promise<AnalyticsAgentResult> {
    try {
      if (!input.prompt.trim()) {
        return agentFail("INVALID_INPUT", "No prompt provided");
      }

      const response = await computeService.chat(
        [
          {
            role: "system",
            content: ANALYTICS_SYSTEM_PROMPT,
          },

          {
            role: "user",
            content: `
Project:
${input.prompt}

Architecture:
${input.architecture || ""}

Deployment:
${input.deployment || ""}
`,
          },
        ],
        {
          task: "analytics",
          temperature: 0.2,
          max_tokens: 4000,
        },
      );

      if (!response.success) {
        return agentFail(
          "UPSTREAM_COMPUTE_FAILED",
          response.error || "Analytics output generation failed",
          undefined,
          response,
        );
      }

      return agentOk({ analytics: response.content || "" }, response);
    } catch (error: unknown) {
      console.error("Analytics Agent Error:", error);

      return agentFail(
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Analytics agent failed",
        undefined,
        error,
      );
    }
  }
}

export const analyticsAgent = new AnalyticsAgent();
