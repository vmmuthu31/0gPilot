import { databaseAgent } from "@/agents/database.agent";
import { retryAgentResult } from "@/graph/retry";
import { WorkflowState } from "../state";

export async function databaseNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  try {
    if (state.error) {
      return { status: "Database Design Skipped" };
    }

    const result = await retryAgentResult(
      () =>
        databaseAgent.execute({
          prompt: state.prompt,
          architecture: state.architecture,
        }),
      { retryCodes: ["UPSTREAM_COMPUTE_FAILED"] },
    );

    if (!result.success) {
      return {
        error: result.error.message || "Database design generation failed",
        status: "FAILED",
      };
    }

    return {
      databaseDesign: result.data.design || "",
      status: "Database Design Generated",
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Database node execution failed";
    console.error(message);
    return {
      error: message,
      status: "FAILED",
    };
  }
}
