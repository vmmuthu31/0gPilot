import { computeService } from "@/services/compute.service";

import {
  PLANNER_DATABASE_DESIGN_SYSTEM_PROMPT,
  PLANNER_FOLDER_STRUCTURE_SYSTEM_PROMPT,
  PLANNER_STRUCTURED_PLAN_SYSTEM_PROMPT,
  PLANNER_SYSTEM_PROMPT,
} from "@/prompts/planner.prompt";

import { agentFail, agentOk, type AgentResult } from "@/types/agent.types";

export interface PlannerAgentInput {
  prompt: string;
}

export type PlannerAgentResult = AgentResult<{ architecture: string }>;

class PlannerAgent {
  async execute(input: PlannerAgentInput): Promise<PlannerAgentResult> {
    try {
      if (!input.prompt.trim()) {
        return agentFail("INVALID_INPUT", "No prompt provided");
      }

      const response = await computeService.chat(
        [
          {
            role: "system",
            content: PLANNER_SYSTEM_PROMPT,
          },

          {
            role: "user",
            content: `
Generate a complete architecture for:

${input.prompt}
`,
          },
        ],
        {
          temperature: 0.3,
          max_tokens: 5000,
          model: "qwen/qwen-2.5-7b-instruct",
        },
      );

      if (!response.success) {
        return agentFail(
          "UPSTREAM_COMPUTE_FAILED",
          response.error || "Planner agent failed",
          undefined,
          response,
        );
      }

      return agentOk({ architecture: response.content || "" }, response);
    } catch (error: unknown) {
      console.error("Planner Agent Error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Planner agent execution failed";

      return agentFail("INTERNAL_ERROR", message || "Planner agent failed");
    }
  }

  async generateStructuredPlan(
    prompt: string,
  ): Promise<AgentResult<{ json: string }>> {
    try {
      if (!prompt.trim()) {
        return agentFail("INVALID_INPUT", "No prompt provided");
      }

      const response = await computeService.chat(
        [
          {
            role: "system",
            content: PLANNER_STRUCTURED_PLAN_SYSTEM_PROMPT,
          },

          {
            role: "user",
            content: prompt,
          },
        ],
        {
          temperature: 0.2,
          max_tokens: 3000,
        },
      );

      if (!response.success) {
        return agentFail(
          "UPSTREAM_COMPUTE_FAILED",
          response.error || "Structured planning failed",
          undefined,
          response,
        );
      }

      return agentOk({ json: response.content || "" }, response);
    } catch (error: unknown) {
      console.error(error);

      const message =
        error instanceof Error ? error.message : "Structured planner failed";

      return agentFail(
        "INTERNAL_ERROR",
        message || "Structured planner failed",
        undefined,
        error,
      );
    }
  }

  async generateFolderStructure(
    prompt: string,
  ): Promise<AgentResult<{ structure: string }>> {
    try {
      if (!prompt.trim()) {
        return agentFail("INVALID_INPUT", "No prompt provided");
      }

      const response = await computeService.chat(
        [
          {
            role: "system",
            content: PLANNER_FOLDER_STRUCTURE_SYSTEM_PROMPT,
          },

          {
            role: "user",
            content: prompt,
          },
        ],
        {
          temperature: 0.3,
        },
      );

      if (!response.success) {
        return agentFail(
          "UPSTREAM_COMPUTE_FAILED",
          response.error || "Folder structure generation failed",
          undefined,
          response,
        );
      }

      return agentOk({ structure: response.content || "" }, response);
    } catch (error: unknown) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "Folder structure generation failed";

      return agentFail("INTERNAL_ERROR", message, undefined, error);
    }
  }

  async generateDatabaseDesign(
    prompt: string,
  ): Promise<AgentResult<{ design: string }>> {
    try {
      if (!prompt.trim()) {
        return agentFail("INVALID_INPUT", "No prompt provided");
      }

      const response = await computeService.chat(
        [
          {
            role: "system",
            content: PLANNER_DATABASE_DESIGN_SYSTEM_PROMPT,
          },

          {
            role: "user",
            content: prompt,
          },
        ],
        {
          temperature: 0.2,
        },
      );

      if (!response.success) {
        return agentFail(
          "UPSTREAM_COMPUTE_FAILED",
          response.error || "Database architecture generation failed",
          undefined,
          response,
        );
      }

      return agentOk({ design: response.content || "" }, response);
    } catch (error: unknown) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "Database architecture generation failed";

      return agentFail("INTERNAL_ERROR", message, undefined, error);
    }
  }
}

export const plannerAgent = new PlannerAgent();
