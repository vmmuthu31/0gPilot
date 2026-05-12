import type { AgentErrorCode, AgentResult } from "@/types/agent.types";

export interface AgentRetryOptions {
  maxAttempts?: number;
  initialIntervalMs?: number;
  backoffFactor?: number;
  maxIntervalMs?: number;
  jitter?: boolean;
  retryCodes?: readonly AgentErrorCode[];
}

function jitterMs(ms: number): number {
  const spread = Math.floor(ms * 0.2);
  const offset = Math.floor(Math.random() * (spread * 2 + 1)) - spread;
  return Math.max(0, ms + offset);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function retryAgentResult<TData>(
  fn: () => Promise<AgentResult<TData>>,
  options?: AgentRetryOptions,
): Promise<AgentResult<TData>> {
  const maxAttempts = options?.maxAttempts ?? 3;
  const initialIntervalMs = options?.initialIntervalMs ?? 400;
  const backoffFactor = options?.backoffFactor ?? 2;
  const maxIntervalMs = options?.maxIntervalMs ?? 4000;
  const jitter = options?.jitter ?? true;
  const retryCodes =
    options?.retryCodes ??
    (["UPSTREAM_COMPUTE_FAILED", "UPSTREAM_STORAGE_FAILED"] as const);

  let attempt = 0;
  let interval = initialIntervalMs;

  while (attempt < maxAttempts) {
    attempt += 1;

    let result: AgentResult<TData>;
    try {
      result = await fn();
    } catch (error: unknown) {
      if (attempt >= maxAttempts) {
        throw error;
      }

      const waitMs = jitter ? jitterMs(interval) : interval;
      await sleep(waitMs);
      interval = Math.min(maxIntervalMs, Math.floor(interval * backoffFactor));
      continue;
    }

    if (result.success) {
      return result;
    }

    const shouldRetry = retryCodes.includes(result.error.code);
    if (!shouldRetry || attempt >= maxAttempts) {
      return result;
    }

    const waitMs = jitter ? jitterMs(interval) : interval;
    await sleep(waitMs);
    interval = Math.min(maxIntervalMs, Math.floor(interval * backoffFactor));
  }

  return await fn();
}
