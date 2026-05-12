import OpenAI from "openai";

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

export interface ChatResult {
  success: boolean;
  content?: string;
  usage?: unknown;
  error?: string;
}

export interface StreamResult {
  success: boolean;
  error?: string;
}

const client = new OpenAI({
  apiKey: process.env.ZERO_G_API_KEY || "",
  baseURL: process.env.ZERO_G_API_URL || "",
});

class ZeroGComputeService {
  async chat(
    messages: ChatMessage[],
    options?: GenerateOptions,
  ): Promise<ChatResult> {
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
        error instanceof Error
          ? error.message
          : "0G compute chat completion failed";

      return {
        success: false,
        error: message,
      };
    }
  }

  async streamChat(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    options?: GenerateOptions,
  ): Promise<StreamResult> {
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
        if (content) onChunk(content);
      }

      return { success: true };
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "0G compute streaming failed";

      return {
        success: false,
        error: message,
      };
    }
  }
}

export const computeService = new ZeroGComputeService();
