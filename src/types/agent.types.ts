export type AgentErrorCode =
  | "INVALID_INPUT"
  | "UPSTREAM_COMPUTE_FAILED"
  | "UPSTREAM_STORAGE_FAILED"
  | "INTERNAL_ERROR";

export interface AgentError {
  code: AgentErrorCode;
  message: string;
  details?: unknown;
}

export type AgentResult<TData> =
  | {
      success: true;
      data: TData;
      raw?: unknown;
    }
  | {
      success: false;
      error: AgentError;
      raw?: unknown;
    };

export function agentOk<TData>(data: TData, raw?: unknown): AgentResult<TData> {
  return {
    success: true,
    data,
    raw,
  };
}

export function agentFail(
  code: AgentErrorCode,
  message: string,
  details?: unknown,
  raw?: unknown,
): AgentResult<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    raw,
  };
}
