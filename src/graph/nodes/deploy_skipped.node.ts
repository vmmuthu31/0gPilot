import { WorkflowState } from "../state";

export async function deploySkippedNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  if (!state.error) {
    return {
      status: "Deployment Skipped",
      error: "Deployment skipped due to routing",
    };
  }

  return {
    status: "Deployment Skipped",
  };
}
