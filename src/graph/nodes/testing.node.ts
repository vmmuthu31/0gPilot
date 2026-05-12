import { testingAgent } from "@/agents/testing.agent";

import { retryAgentResult } from "@/graph/retry";

import { WorkflowState } from "../state";

export async function testingNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  try {
    if (state.error) {
      return {
        status: "Testing Skipped",
      };
    }

    const result = await retryAgentResult(
      () =>
        testingAgent.execute({
          prompt: state.prompt,
          architecture: state.architecture,
          frontend: state.frontend,
          backend: state.backend,
          contracts: state.contracts,
        }),
      { retryCodes: ["UPSTREAM_COMPUTE_FAILED"] },
    );

    if (!result.success) {
      return {
        error: result.error.message || "Testing output generation failed",
        status: "FAILED",
      };
    }

    return {
      tests: result.data.tests || "",
      status: "Tests Generated",
    };
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error ? error.message : "Testing node execution failed",
      status: "FAILED",
    };
  }
}
