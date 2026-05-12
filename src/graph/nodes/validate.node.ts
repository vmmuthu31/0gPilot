import { WorkflowState } from "../state";

export async function validateNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  const prompt = state.prompt?.trim() ?? "";

  if (!prompt) {
    return {
      error: "Prompt is required",
      status: "FAILED",
    };
  }

  if (!state.projectId?.trim()) {
    return {
      error: "projectId is required",
      status: "FAILED",
    };
  }

  return {
    status: "Validated",
  };
}
