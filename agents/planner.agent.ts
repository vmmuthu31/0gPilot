import { computeService } from "@/services/compute.service";

export interface PlannerAgentInput {
  prompt: string;
}

export interface PlannerAgentResult {
  success: boolean;

  architecture?: string;

  raw?: unknown;

  error?: string;
}

const SYSTEM_PROMPT = `
You are a senior AI Web3 systems architect.

Your job is to analyze startup ideas and generate a complete technical architecture.

You specialize in:
- Web3 applications
- AI infrastructure
- autonomous agents
- smart contracts
- decentralized storage
- deployment systems
- scalable backend systems

You must generate:

# Required Sections

1. Project Overview
2. Frontend Architecture
3. Backend Architecture
4. Smart Contract Architecture
5. AI Agent Architecture
6. Database / Storage Layer
7. APIs & Services
8. Security Architecture
9. Deployment Flow
10. Recommended Tech Stack
11. Folder Structure
12. Scalability Considerations

# Important Rules

- Use modern production-grade stack
- Prefer TypeScript ecosystem
- Use decentralized infrastructure where possible
- Optimize for scalability
- Optimize for security
- Optimize for modularity
- Optimize for AI orchestration
- Use clean markdown formatting
- Be technically detailed

# Special Requirements

Always include:
- LangGraph orchestration
- 0G Compute
- 0G Storage
- 0G Chain
- AI agents
- deployment architecture

Return detailed markdown only.
`;

class PlannerAgent {
  async execute(input: PlannerAgentInput): Promise<PlannerAgentResult> {
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
            content: `
You are an AI autonomous project planner.

Analyze the startup idea and return structured JSON.

Required JSON structure:

{
  "project_name": "",
  "frontend": {
    "framework": "",
    "libraries": []
  },
  "backend": {
    "framework": "",
    "services": []
  },
  "smart_contracts": [],
  "agents": [],
  "storage": [],
  "deployment": [],
  "security": [],
  "features": []
}

Return ONLY JSON.
`,
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
            content: `
You are a senior software architect.

Generate:
- scalable folder structure
- modular architecture
- frontend folders
- backend folders
- AI agent folders
- LangGraph folders

Use clean tree formatting.
`,
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
            content: `
You are a database architect.

Generate:
- schemas
- collections
- relationships
- vector memory design
- decentralized storage strategy
- caching strategy

Focus on:
- AI memory
- scalable systems
- decentralized storage
- Web3 architecture
`,
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
