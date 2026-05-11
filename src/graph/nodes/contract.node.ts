import { contractAgent } from "@/agents/contract.agent";
import { WorkflowState } from "../state";

export async function contractNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  try {
    console.log("Executing Contract Node...");

    const result = await contractAgent.execute({
      prompt: state.prompt,

      architecture: state.architecture,
    });

    if (!result.success) {
      return {
        error: result.error || "Contract generation failed",

        status: "FAILED",
      };
    }

    return {
      contracts: result.contracts || "",

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
