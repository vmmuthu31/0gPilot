import { plannerAgent } from "@/agents/planner.agent";

import { retryAgentResult } from "@/graph/retry";

import { WorkflowState } from "../state";

export async function plannerNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  try {
    console.log("Executing Planner Node...");

    if (state.error) {
      return {
        status: "Planner Skipped",
      };
    }

    const result = await retryAgentResult(
      () =>
        plannerAgent.execute({
          prompt: state.prompt,
        }),
      { retryCodes: ["UPSTREAM_COMPUTE_FAILED"] },
    );

    if (!result.success) {
      return {
        error: result.error.message || "Planner node failed",

        status: "FAILED",
      };
    }

    return {
      architecture: result.data.architecture || "",

      status: "Architecture Generated",
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Planner node execution failed";
    console.error(message);

    return {
      error: message || "Planner node execution failed",

      status: "FAILED",
    };
  }
}
