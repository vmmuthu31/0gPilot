import { WorkflowState } from "../state";

export async function deploySkippedNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  return {
    status: state.error ? "Deployment Skipped" : "Deployment Skipped",
  };
}
