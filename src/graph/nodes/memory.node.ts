import { memoryService } from "@/services/memory.service";

import { retryAgentResult } from "@/graph/retry";

import { WorkflowState } from "../state";

export async function memoryNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  try {
    const projectId = state.projectId?.trim() ?? "";

    const result = await retryAgentResult(
      () =>
        memoryService.saveProjectMemory({
          projectId,
          prompt: state.prompt,
          architecture: state.architecture,
          frontend: state.frontend,
          contracts: state.contracts,
          audit: state.audit,
          deployment: state.deployment,
        }),
      { retryCodes: ["UPSTREAM_STORAGE_FAILED"] },
    );

    if (!result.success) {
      return {
        error: result.error.message || "Memory persistence failed",
        status: "FAILED",
      };
    }

    return {
      memoryHash: result.data.rootHash,
      status: "Persisted",
    };
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error ? error.message : "Memory node execution failed",
      status: "FAILED",
    };
  }
}
