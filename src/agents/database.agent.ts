import { computeService } from "@/services/compute.service";

import { DATABASE_SYSTEM_PROMPT } from "@/prompts/database.prompt";

import { agentFail, agentOk, type AgentResult } from "@/types/agent.types";

export interface DatabaseAgentInput {
  prompt: string;

  architecture?: string;
}

export type DatabaseAgentResult = AgentResult<{ design: string }>;

class DatabaseAgent {
  async execute(input: DatabaseAgentInput): Promise<DatabaseAgentResult> {
    try {
      if (!input.prompt.trim()) {
        return agentFail("INVALID_INPUT", "No prompt provided");
      }

      const response = await computeService.chat(
        [
          {
            role: "system",
            content: DATABASE_SYSTEM_PROMPT,
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
          task: "database",
          temperature: 0.2,
          max_tokens: 4000,
        },
      );

      if (!response.success) {
        return agentFail(
          "UPSTREAM_COMPUTE_FAILED",
          response.error || "Database design generation failed",
          undefined,
          response,
        );
      }

      return agentOk({ design: response.content || "" }, response);
    } catch (error: unknown) {
      console.error("Database Agent Error:", error);

      return agentFail(
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Database agent failed",
        undefined,
        error,
      );
    }
  }
}

export const databaseAgent = new DatabaseAgent();
