import { plannerAgent } from "@/agents/planner.agent";

import { WorkflowState } from "../state";

export async function plannerNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  try {
    console.log("Executing Planner Node...");

    const result = await plannerAgent.execute({
      prompt: state.prompt,
    });

    if (!result.success) {
      return {
        error: result.error || "Planner node failed",

        status: "FAILED",
      };
    }

    return {
      architecture: result.architecture || "",

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
