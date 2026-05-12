import { contractAgent } from "@/agents/contract.agent";

import { retryAgentResult } from "@/graph/retry";
import { WorkflowState } from "../state";

export async function contractNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  try {
    console.log("Executing Contract Node...");

    if (state.error) {
      return {
        status: "Contracts Skipped",
      };
    }

    const result = await retryAgentResult(
      () =>
        contractAgent.execute({
          prompt: state.prompt,

          architecture: state.architecture,
        }),
      { retryCodes: ["UPSTREAM_COMPUTE_FAILED"] },
    );

    if (!result.success) {
      return {
        error: result.error.message || "Contract generation failed",

        status: "FAILED",
      };
    }

    return {
      contracts: result.data.contracts || "",

      status: "Contracts Generated",
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Contract node execution failed";
    console.error(message);

    return {
      error: message || "Contract node execution failed",

      status: "FAILED",
    };
  }
}
