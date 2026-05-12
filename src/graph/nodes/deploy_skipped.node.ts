import { WorkflowState } from "../state";

export async function deploySkippedNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  const reason = state.error
    ? `prior error: ${state.error.slice(0, 120)}`
    : "tests failed or skipped";

  return {
    deployment: "",
    status: `Deployment Skipped — ${reason}`,
  };
}
