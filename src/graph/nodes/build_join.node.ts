import { WorkflowState } from "../state";

export async function buildJoinNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  if (state.error) {
    return {
      status: "FAILED",
    };
  }

  const hasArchitecture = !!state.architecture?.trim();
  const hasFrontend = !!state.frontend?.trim();
  const hasContracts = !!state.contracts?.trim();
  const hasAudit = !!state.audit?.trim();
  const hasBackend = !!state.backend?.trim();

  if (
    !hasArchitecture ||
    !hasFrontend ||
    !hasContracts ||
    !hasAudit ||
    !hasBackend
  ) {
    return {
      error: "Build join missing required outputs",
      status: "FAILED",
    };
  }

  return {
    status: "Joined",
  };
}
