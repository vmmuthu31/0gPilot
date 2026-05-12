import OpenAI from "openai";

import {
  type ComputeTask,
  getModelRoutingPolicyFromEnv,
} from "@/services/compute.routing";

export type ModelType = "qwen/qwen-2.5-7b-instruct" | "zai-org/GLM-5-FP8";

export type ModelId = ModelType | (string & {});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GenerateOptions {
  temperature?: number;
  max_tokens?: number;

  task?: ComputeTask;

  model?: ModelId;
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

export interface EmbeddingOptions {
  model?: ModelId;
}

export interface EmbeddingResult {
  success: boolean;
  vectors?: number[][];
  usage?: unknown;
  error?: string;
}

export interface ImageOptions {
  model?: ModelId;
  size?: "256x256" | "512x512" | "1024x1024";
  response_format?: "url" | "b64_json";
}

export interface ImageResult {
  success: boolean;
  data?: Array<{ url?: string; b64_json?: string }>;
  error?: string;
}

const client = new OpenAI({
  apiKey: process.env.ZERO_G_API_KEY || "",
  baseURL: process.env.ZERO_G_API_URL || "",
});

const routingPolicy = getModelRoutingPolicyFromEnv();

function ensureConfigured(): { ok: true } | { ok: false; error: string } {
  if (!process.env.ZERO_G_API_KEY?.trim()) {
    return { ok: false, error: "ZERO_G_API_KEY is not configured" };
  }

  if (!process.env.ZERO_G_API_URL?.trim()) {
    return { ok: false, error: "ZERO_G_API_URL is not configured" };
  }

  return { ok: true };
}

function getChatModelCandidates(
  task: ComputeTask | undefined,
  model?: ModelId,
) {
  if (model) return [model];

  const key: ComputeTask = task ?? "general";
  const policy = routingPolicy.chat[key] ?? routingPolicy.chat.general;

  return [policy.primary, ...policy.fallbacks].filter(Boolean);
}

function getEmbeddingModelCandidates(model?: ModelId) {
  if (model) return [model];

  return [
    routingPolicy.embeddings.primary,
    ...routingPolicy.embeddings.fallbacks,
  ].filter(Boolean);
}

function getImageModelCandidates(model?: ModelId) {
  if (model) return [model];

  return [routingPolicy.image.primary, ...routingPolicy.image.fallbacks].filter(
    Boolean,
  );
}

function toSseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

class ZeroGComputeService {
  async chat(
    messages: ChatMessage[],
    options?: GenerateOptions,
  ): Promise<ChatResult> {
    try {
      const configured = ensureConfigured();
      if (!configured.ok) {
        return { success: false, error: configured.error };
      }

      const candidates = getChatModelCandidates(options?.task, options?.model);
      if (candidates.length === 0) {
        return { success: false, error: "No chat model configured" };
      }

      let lastError: string | undefined;

      for (const model of candidates) {
        try {
          const response = await client.chat.completions.create({
            model,
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
          lastError =
            error instanceof Error
              ? error.message
              : "0G compute chat completion failed";
        }
      }

      return {
        success: false,
        error: lastError || "0G compute chat completion failed",
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
      const configured = ensureConfigured();
      if (!configured.ok) {
        return { success: false, error: configured.error };
      }

      const candidates = getChatModelCandidates(options?.task, options?.model);
      if (candidates.length === 0) {
        return { success: false, error: "No chat model configured" };
      }

      const model = candidates[0];

      const stream = await client.chat.completions.create({
        model,
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

  streamChatSSE(
    messages: ChatMessage[],
    options?: GenerateOptions,
  ): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();

    return new ReadableStream<Uint8Array>({
      start: async (controller) => {
        const configured = ensureConfigured();
        if (!configured.ok) {
          controller.enqueue(
            encoder.encode(toSseEvent("error", { error: configured.error })),
          );
          controller.close();
          return;
        }

        controller.enqueue(encoder.encode(toSseEvent("ready", { ok: true })));

        const streamResult = await this.streamChat(
          messages,
          (chunk) => {
            controller.enqueue(
              encoder.encode(toSseEvent("chunk", { delta: chunk })),
            );
          },
          options,
        );

        if (!streamResult.success) {
          controller.enqueue(
            encoder.encode(
              toSseEvent("error", {
                error: streamResult.error || "Streaming failed",
              }),
            ),
          );
          controller.close();
          return;
        }

        controller.enqueue(encoder.encode(toSseEvent("done", { done: true })));
        controller.close();
      },
    });
  }

  async embeddings(
    input: string | string[],
    options?: EmbeddingOptions,
  ): Promise<EmbeddingResult> {
    try {
      const configured = ensureConfigured();
      if (!configured.ok) {
        return { success: false, error: configured.error };
      }

      const candidates = getEmbeddingModelCandidates(options?.model);
      if (candidates.length === 0) {
        return { success: false, error: "No embedding model configured" };
      }

      let lastError: string | undefined;

      for (const model of candidates) {
        try {
          const response = await client.embeddings.create({
            model,
            input,
          });

          const vectors = (response.data || []).map((d) => d.embedding);

          return {
            success: true,
            vectors,
            usage: response.usage,
          };
        } catch (error: unknown) {
          lastError =
            error instanceof Error
              ? error.message
              : "0G compute embeddings failed";
        }
      }

      return {
        success: false,
        error: lastError || "0G compute embeddings failed",
      };
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "0G compute embeddings failed";

      return {
        success: false,
        error: message,
      };
    }
  }

  async generateImage(
    prompt: string,
    options?: ImageOptions,
  ): Promise<ImageResult> {
    try {
      const configured = ensureConfigured();
      if (!configured.ok) {
        return { success: false, error: configured.error };
      }

      const candidates = getImageModelCandidates(options?.model);
      if (candidates.length === 0) {
        return { success: false, error: "No image model configured" };
      }

      let lastError: string | undefined;

      for (const model of candidates) {
        try {
          const response = await client.images.generate({
            model,
            prompt,
            size: options?.size,
            response_format: options?.response_format,
          });

          return {
            success: true,
            data: response.data,
          };
        } catch (error: unknown) {
          lastError =
            error instanceof Error
              ? error.message
              : "0G compute image generation failed";
        }
      }

      return {
        success: false,
        error: lastError || "0G compute image generation failed",
      };
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : "0G compute image generation failed";

      return {
        success: false,
        error: message,
      };
    }
  }
}

export const computeService = new ZeroGComputeService();
