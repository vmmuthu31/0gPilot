import { analyticsAgent } from "@/agents/analytics.agent";

import { retryAgentResult } from "@/graph/retry";

import { WorkflowState } from "../state";

export async function analyticsNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  try {
    if (state.error) {
      return {
        status: "Analytics Skipped",
      };
    }

    const result = await retryAgentResult(
      () =>
        analyticsAgent.execute({
          prompt: state.prompt,
          architecture: state.architecture,
          deployment: state.deployment,
        }),
      { retryCodes: ["UPSTREAM_COMPUTE_FAILED"] },
    );

    if (!result.success) {
      return {
        error: result.error.message || "Analytics output generation failed",
        status: "FAILED",
      };
    }

    return {
      analytics: result.data.analytics || "",
      status: "Analytics Generated",
    };
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Analytics node execution failed",
      status: "FAILED",
    };
  }
}
