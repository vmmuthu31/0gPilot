import { WorkflowState } from "../state";

export async function buildJoinNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  if (state.error) {
    return { status: "FAILED" };
  }

  const missing: string[] = [];

  if (!state.architecture?.trim()) missing.push("architecture");
  if (!state.frontend?.trim()) missing.push("frontend");
  if (!state.contracts?.trim()) missing.push("contracts");
  if (!state.audit?.trim()) missing.push("audit");
  if (!state.backend?.trim()) missing.push("backend");
  if (!state.databaseDesign?.trim()) missing.push("databaseDesign");

  if (missing.length > 0) {
    return {
      error: `Build join missing required outputs: ${missing.join(", ")}`,
      status: "FAILED",
    };
  }

  return { status: "Joined" };
}
