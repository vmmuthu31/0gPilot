import { memoryService } from "@/services/memory.service";

import { retryAgentResult } from "@/graph/retry";
import { vectorService } from "@/services/vector.service";
import { chainService } from "@/services/chain.service";
import crypto from "crypto";

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
          backend: state.backend,
          tests: state.tests,
          analytics: state.analytics,
          status: state.status,
          error: state.error,
        }),
      { retryCodes: ["UPSTREAM_STORAGE_FAILED"] },
    );

    if (!result.success) {
      const memoryError = result.error.message || "Memory persistence failed";
      return {
        error: state.error || memoryError,
        status: state.error ? "FAILED (Memory Not Persisted)" : "FAILED",
      };
    }

    const memoryHash = result.data.rootHash;
    const promptHash = crypto
      .createHash("sha256")
      .update(state.prompt)
      .digest("hex");
    const executionProof = crypto
      .createHash("sha256")
      .update(state.architecture || "")
      .digest("hex");

    await vectorService.indexMemory(projectId, state.prompt, memoryHash);

    await chainService.registerExecution(
      projectId,
      promptHash,
      memoryHash,
      executionProof,
    );

    return {
      memoryHash,
      status: "Persisted & Registered",
    };
  } catch (error: unknown) {
    const memoryError =
      error instanceof Error ? error.message : "Memory node execution failed";
    return {
      error: state.error || memoryError,
      status: state.error ? "FAILED (Memory Not Persisted)" : "FAILED",
    };
  }
}
