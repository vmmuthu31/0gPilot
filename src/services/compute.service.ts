import OpenAI from "openai";

import { END, START, StateGraph, Annotation } from "@langchain/langgraph";

export type ModelType = "qwen/qwen-2.5-7b-instruct" | "zai-org/GLM-5-FP8";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GenerateOptions {
  temperature?: number;
  max_tokens?: number;
  model?: ModelType;
}

export interface AgentGenerationPayload {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  max_tokens?: number;
}

const WorkflowState = Annotation.Root({
  prompt: Annotation<string>(),

  architecture: Annotation<string>(),

  frontend: Annotation<string>(),

  contracts: Annotation<string>(),

  audit: Annotation<string>(),

  deployment: Annotation<string>(),

  status: Annotation<string>(),
});

const client = new OpenAI({
  apiKey: process.env.ZERO_G_API_KEY,
  baseURL: "https://router-api.0g.ai/v1",
});

class ZeroGComputeService {
  async chat(messages: ChatMessage[], options?: GenerateOptions) {
    try {
      const response = await client.chat.completions.create({
        model: options?.model || "qwen/qwen-2.5-7b-instruct",

        messages,

        temperature: options?.temperature ?? 0.7,

        max_tokens: options?.max_tokens ?? 4000,
      });

      return {
        success: true,

        content: response.choices?.[0]?.message?.content || "",

        usage: response.usage,
      };
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Workflow execution failed";

      return {
        success: false,
        error: message || "Chat completion failed",
      };
    }
  }

  async streamChat(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    options?: GenerateOptions,
  ) {
    try {
      const stream = await client.chat.completions.create({
        model: options?.model || "qwen/qwen-2.5-7b-instruct",

        messages,

        stream: true,

        temperature: options?.temperature ?? 0.7,

        max_tokens: options?.max_tokens ?? 4000,
      });

      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content;

        if (content) {
          onChunk(content);
        }
      }

      return {
        success: true,
      };
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Workflow execution failed";

      return {
        success: false,
        error: message || "Streaming failed",
      };
    }
  }

  async plannerAgent(prompt: string) {
    return this.chat(
      [
        {
          role: "system",
          content: `
You are a senior AI Web3 systems architect.

Responsibilities:
- analyze startup ideas
- generate architecture
- choose stack
- define APIs
- define contracts
- define storage
- define workflows

Return detailed markdown.
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
  }

  async frontendAgent(payload: AgentGenerationPayload) {
    return this.chat(
      [
        {
          role: "system",
          content:
            payload.systemPrompt ||
            `
You are a senior frontend engineer.

Stack:
- Next.js
- TailwindCSS
- Framer Motion
- shadcn/ui

Requirements:
- futuristic UI
- production ready
- responsive
- modular
- dark mode

Return ONLY code.
`,
        },

        {
          role: "user",
          content: payload.prompt,
        },
      ],
      {
        temperature: payload.temperature ?? 0.7,

        max_tokens: payload.max_tokens ?? 5000,
      },
    );
  }

  async contractAgent(payload: AgentGenerationPayload) {
    return this.chat(
      [
        {
          role: "system",
          content:
            payload.systemPrompt ||
            `
You are a senior Solidity engineer.

Requirements:
- Solidity ^0.8.20
- OpenZeppelin
- access control
- secure
- gas optimized
- modular
- production ready

Return ONLY Solidity code.
`,
        },

        {
          role: "user",
          content: payload.prompt,
        },
      ],
      {
        temperature: payload.temperature ?? 0.3,

        max_tokens: payload.max_tokens ?? 5000,
      },
    );
  }

  async auditAgent(code: string) {
    return this.chat(
      [
        {
          role: "system",
          content: `
You are a Solidity security auditor.

Analyze:
- reentrancy
- overflow
- access control
- gas optimization
- vulnerabilities

Return:
- vulnerabilities
- severity
- fixes
- security score
`,
        },

        {
          role: "user",
          content: code,
        },
      ],
      {
        temperature: 0.2,
      },
    );
  }

  async deploymentAgent(prompt: string) {
    return this.chat(
      [
        {
          role: "system",
          content: `
You are a blockchain deployment engineer.

Generate:
- deployment scripts
- environment configs
- RPC setup
- deployment flow

Return markdown + code.
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
  }

  async imageAgent(prompt: string) {
    return this.chat(
      [
        {
          role: "system",
          content: `
You are a UI/UX AI design assistant.

Generate:
- dashboard concepts
- landing page concepts
- Web3 UI ideas
- AI SaaS layouts

Return detailed UI descriptions.
`,
        },

        {
          role: "user",
          content: prompt,
        },
      ],
      {
        model: "qwen/qwen-2.5-7b-instruct",
      },
    );
  }

  buildWorkflow() {
    const workflow = new StateGraph(WorkflowState)

      .addNode("planner", async (state) => {
        const result = await this.plannerAgent(state.prompt);

        return {
          architecture: result.content || "",

          status: "Architecture generated",
        };
      })

      .addNode("frontend", async (state) => {
        const result = await this.frontendAgent({
          prompt: `
Project:
${state.prompt}

Architecture:
${state.architecture}
`,
        });

        return {
          frontend: result.content || "",

          status: "Frontend generated",
        };
      })

      .addNode("contracts", async (state) => {
        const result = await this.contractAgent({
          prompt: `
Project:
${state.prompt}

Architecture:
${state.architecture}
`,
        });

        return {
          contracts: result.content || "",

          status: "Contracts generated",
        };
      })

      .addNode("audit", async (state) => {
        const result = await this.auditAgent(state.contracts);

        return {
          audit: result.content || "",

          status: "Audit completed",
        };
      })

      .addNode("deployment", async (state) => {
        const result = await this.deploymentAgent(state.prompt);

        return {
          deployment: result.content || "",

          status: "Deployment scripts generated",
        };
      })

      .addEdge(START, "planner")

      .addEdge("planner", "frontend")

      .addEdge("planner", "contracts")

      .addEdge("contracts", "audit")

      .addEdge("audit", "deployment")

      .addEdge("frontend", "deployment")

      .addEdge("deployment", END);

    return workflow.compile();
  }

  async executeWorkflow(prompt: string) {
    try {
      const graph = this.buildWorkflow();

      const result = await graph.invoke({
        prompt,
      });

      return {
        success: true,
        result,
      };
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Workflow execution failed";

      return {
        success: false,
        error: message,
      };
    }
  }
}

export const computeService = new ZeroGComputeService();
