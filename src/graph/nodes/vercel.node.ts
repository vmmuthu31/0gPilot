import { vercelService } from "@/services/vercel.service";
import { db } from "@/db";
import { WorkflowState } from "../state";

export async function vercelNode(
  state: WorkflowState
): Promise<Partial<WorkflowState>> {
  try {
    if (state.error) {
      return { status: "Vercel Deploy Skipped (prior error)" };
    }

    const project = await db.project.findUnique({
      where: { id: state.projectId },
      include: {
        user: {
          select: { vercelToken: true, vercelTeamId: true },
        },
      },
    });

    if (!project?.user.vercelToken || !project.repoName) {
      return { status: "Vercel Deploy Skipped (no token or repo)" };
    }

    const projectName = project.repoName.split("/")[1] || state.projectId!;

    const deployResult = await vercelService.deployFromGitHub({
      repoFullName: project.repoName,
      projectName,
      vercelToken: project.user.vercelToken,
      teamId: project.user.vercelTeamId ?? undefined,
    });

    if (!deployResult.success) {
      return {
        error: deployResult.error || "Vercel deployment failed",
        status: "Vercel Deploy Failed",
      };
    }

    await db.project.update({
      where: { id: state.projectId },
      data: { deploymentUrl: deployResult.deploymentUrl },
    });

    return {
      status: `Deployed — ${deployResult.deploymentUrl}`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Vercel node failed";
    console.error(message);
    return { error: message, status: "FAILED" };
  }
}
