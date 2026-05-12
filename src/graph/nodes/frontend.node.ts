import { frontendAgent } from "@/agents/frontend.agent";

import { WorkflowState } from "../state";

export async function frontendNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  try {
    console.log("Executing Frontend Node...");

    const result = await frontendAgent.execute({
      prompt: state.prompt,

      architecture: state.architecture,
    });

    if (!result.success) {
      return {
        error: result.error.message || "Frontend generation failed",

        status: "FAILED",
      };
    }

    return {
      frontend: result.data.code || "",

      status: "Frontend Generated",
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Frontend node execution failed";
    console.error(message);

    return {
      error: message || "Frontend node execution failed",

      status: "FAILED",
    };
  }
}
