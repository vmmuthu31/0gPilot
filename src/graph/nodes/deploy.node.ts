import { deployAgent } from "@/agents/deploy.agent";
import { retryAgentResult } from "@/graph/retry";
import { db } from "@/db";
import { WorkflowState } from "../state";

export async function deployNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  try {
    if (state.error) {
      return { status: "Deployment Skipped" };
    }

    const result = await retryAgentResult(
      () =>
        deployAgent.execute({
          prompt: state.prompt,
          architecture: state.architecture,
          contracts: state.contracts,
        }),
      { retryCodes: ["UPSTREAM_COMPUTE_FAILED"] },
    );

    if (!result.success) {
      return {
        error: result.error.message || "Deployment generation failed",
        status: "FAILED",
      };
    }

    if (result.data.address && state.projectId) {
      await db.project
        .update({
          where: { id: state.projectId },
          data: {
            contractAddress: result.data.address,
            contractTxHash: result.data.txHash,
          },
        })
        .catch((err) => console.error("[Deploy Node] DB update failed:", err));
    }

    return {
      deployment: result.data.deployment || "",
      status: result.data.address
        ? `Deployed at ${result.data.address}`
        : "Deployment Generated",
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Deployment node execution failed";
    console.error(message);
    return {
      error: message,
      status: "FAILED",
    };
  }
}
