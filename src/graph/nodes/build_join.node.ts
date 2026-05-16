import { WorkflowState } from "../state";
import { projectBuilderService } from "@/services/project-builder.service";

export async function buildJoinNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  try {
    const hasContent =
      state.architecture?.trim() ||
      state.frontend?.trim() ||
      state.contracts?.trim() ||
      state.backend?.trim();

    if (!hasContent && state.error) {
      return { status: "FAILED" };
    }

    await projectBuilderService.build({
      projectId: state.projectId ?? "",
      prompt: state.prompt,
      architecture: state.architecture,
      frontend: state.frontend,
      backend: state.backend,
      contracts: state.contracts,
      tests: state.tests,
      template: state.template,
    });

    if (state.error) {
      return { status: "Partial Build (prior error)" };
    }

    return { status: "Joined" };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Build join failed";
    return { error: state.error || message, status: "FAILED" };
  }
}
