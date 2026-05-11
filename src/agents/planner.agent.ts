import { computeService } from "@/services/compute.service";

import {
  PLANNER_DATABASE_DESIGN_SYSTEM_PROMPT,
  PLANNER_FOLDER_STRUCTURE_SYSTEM_PROMPT,
  PLANNER_STRUCTURED_PLAN_SYSTEM_PROMPT,
  PLANNER_SYSTEM_PROMPT,
} from "@/prompts/planner.prompt";

export interface PlannerAgentInput {
  prompt: string;
}

export interface PlannerAgentResult {
  success: boolean;

  architecture?: string;

  raw?: unknown;

  error?: string;
}

class PlannerAgent {
  async execute(input: PlannerAgentInput): Promise<PlannerAgentResult> {
    try {
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
        return {
          success: false,
          error: response.error || "Planner agent failed",
        };
      }

      return {
        success: true,

        architecture: response.content || "",

        raw: response as unknown,
      };
    } catch (error: unknown) {
      console.error("Planner Agent Error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Planner agent execution failed";
      return {
        success: false,

        error: message || "Planner agent execution failed",
      };
    }
  }

  async generateStructuredPlan(prompt: string) {
    try {
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

      return response;
    } catch (error: unknown) {
      console.error(error);

      const message =
        error instanceof Error ? error.message : "Structured planner failed";

      return {
        success: false,
        error: message || "Structured planner failed",
      };
    }
  }

  async generateFolderStructure(prompt: string) {
    try {
      return computeService.chat(
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
    } catch (error: unknown) {
      console.error(error);

      const message =
        error instanceof Error ? error.message : "Structured planner failed";

      return {
        success: false,

        error: message || "Folder structure generation failed",
      };
    }
  }

  async generateDatabaseDesign(prompt: string) {
    try {
      return computeService.chat(
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
    } catch (error: unknown) {
      console.error(error);

      const message =
        error instanceof Error ? error.message : "Structured planner failed";

      return {
        success: false,

        error: message || "Database architecture generation failed",
      };
    }
  }
}

export const plannerAgent = new PlannerAgent();
