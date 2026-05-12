export type ComputeTask =
  | "planner"
  | "frontend"
  | "contract"
  | "audit"
  | "backend"
  | "database"
  | "testing"
  | "deploy"
  | "analytics"
  | "general";

export type ComputeModality = "chat" | "embeddings" | "image";

export interface TaskModelPolicy {
  primary: string;
  fallbacks: string[];
}

export interface ModelRoutingPolicy {
  chat: Record<ComputeTask, TaskModelPolicy>;

  embeddings: TaskModelPolicy;

  image: TaskModelPolicy;
}

function parseFallbacks(value: string | undefined): string[] {
  const raw = value?.trim();
  if (!raw) return [];

  return raw
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
}

function modelPolicyFromEnv(
  primaryEnvKey: string,
  fallbackEnvKey: string,
  defaultPrimary: string,
): TaskModelPolicy {
  const primary = process.env[primaryEnvKey]?.trim() || defaultPrimary;
  const fallbacks = parseFallbacks(process.env[fallbackEnvKey]);

  return { primary, fallbacks };
}

export function getModelRoutingPolicyFromEnv(): ModelRoutingPolicy {
  const defaultChatModel =
    process.env.ZERO_G_CHAT_MODEL_DEFAULT?.trim() ||
    "qwen/qwen-2.5-7b-instruct";

  const defaultChatFallbacks = parseFallbacks(
    process.env.ZERO_G_CHAT_MODEL_FALLBACKS,
  );

  const baseChatPolicy: TaskModelPolicy = {
    primary: defaultChatModel,
    fallbacks: defaultChatFallbacks,
  };

  const chat: Record<ComputeTask, TaskModelPolicy> = {
    planner:
      process.env.ZERO_G_CHAT_MODEL_PLANNER ||
      process.env.ZERO_G_MODEL_PLANNER ||
      "",
    frontend: process.env.ZERO_G_CHAT_MODEL_FRONTEND || "",
    contract: process.env.ZERO_G_CHAT_MODEL_CONTRACT || "",
    audit: process.env.ZERO_G_CHAT_MODEL_AUDIT || "",
    backend: process.env.ZERO_G_CHAT_MODEL_BACKEND || "",
    database: process.env.ZERO_G_CHAT_MODEL_DATABASE || "",
    testing: process.env.ZERO_G_CHAT_MODEL_TESTING || "",
    deploy: process.env.ZERO_G_CHAT_MODEL_DEPLOY || "",
    analytics: process.env.ZERO_G_CHAT_MODEL_ANALYTICS || "",
    general: process.env.ZERO_G_CHAT_MODEL_GENERAL || "",
  } as unknown as Record<ComputeTask, TaskModelPolicy>;

  const typedChat = (Object.keys(chat) as ComputeTask[]).reduce(
    (acc, task) => {
      const primary = (chat as unknown as Record<string, string>)[task]?.trim();

      if (!primary) {
        acc[task] = baseChatPolicy;
        return acc;
      }

      acc[task] = {
        primary,
        fallbacks: baseChatPolicy.fallbacks,
      };

      return acc;
    },
    {} as Record<ComputeTask, TaskModelPolicy>,
  );

  return {
    chat: typedChat,

    embeddings: modelPolicyFromEnv(
      "ZERO_G_EMBEDDING_MODEL_DEFAULT",
      "ZERO_G_EMBEDDING_MODEL_FALLBACKS",
      "text-embedding-3-small",
    ),

    image: modelPolicyFromEnv(
      "ZERO_G_IMAGE_MODEL_DEFAULT",
      "ZERO_G_IMAGE_MODEL_FALLBACKS",
      "gpt-image-1",
    ),
  };
}
