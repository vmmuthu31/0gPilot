import { deployAgent } from "@/agents/deploy.agent";

import { WorkflowState } from "../state";

export async function deployNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  try {
    console.log("Executing Deployment Node...");

    const result = await deployAgent.execute({
      prompt: state.prompt,

      architecture: state.architecture,

      contracts: state.contracts,
    });

    if (!result.success) {
      return {
        error: result.error.message || "Deployment generation failed",

        status: "FAILED",
      };
    }

    return {
      deployment: result.data.deployment || "",

      status: "Deployment Generated",
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Deployment node execution failed";
    console.error(message);

    return {
      error: message || "Deployment node execution failed",

      status: "FAILED",
    };
  }
}
