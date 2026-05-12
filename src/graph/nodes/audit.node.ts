import { auditAgent } from "@/agents/audit.agent";
import { WorkflowState } from "../state";

export async function auditNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  try {
    console.log("Executing Audit Node...");

    const result = await auditAgent.execute({
      contracts: state.contracts || "",
    });

    if (!result.success) {
      return {
        error: result.error.message || "Audit failed",

        status: "FAILED",
      };
    }

    return {
      audit: result.data.report || "",

      status: "Audit Completed",
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Audit node execution failed";
    console.error(message);

    return {
      error: message || "Audit node execution failed",

      status: "FAILED",
    };
  }
}
