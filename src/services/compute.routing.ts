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

  const computeTasks: ComputeTask[] = [
    "planner",
    "frontend",
    "contract",
    "audit",
    "backend",
    "database",
    "testing",
    "deploy",
    "analytics",
    "general",
  ];

  const typedChat = computeTasks.reduce(
    (acc, task) => {
      const envKey = `ZERO_G_CHAT_MODEL_${task.toUpperCase()}`;
      const primary = process.env[envKey]?.trim();

      acc[task] = primary ? { primary, fallbacks: baseChatPolicy.fallbacks } : baseChatPolicy;

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
