import { backendAgent } from "@/agents/backend.agent";

import { retryAgentResult } from "@/graph/retry";

import { WorkflowState } from "../state";

export async function backendNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  try {
    if (state.error) {
      return {
        status: "Backend Skipped",
      };
    }

    const result = await retryAgentResult(
      () =>
        backendAgent.execute({
          prompt: state.prompt,
          architecture: state.architecture,
          contracts: state.contracts,
        }),
      { retryCodes: ["UPSTREAM_COMPUTE_FAILED"] },
    );

    if (!result.success) {
      return {
        error: result.error.message || "Backend generation failed",
        status: "FAILED",
      };
    }

    return {
      backend: result.data.backend || "",
      status: "Backend Generated",
    };
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Backend node execution failed",
      status: "FAILED",
    };
  }
}
