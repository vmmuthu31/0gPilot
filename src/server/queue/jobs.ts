import { Queue } from "bullmq";
import { connection } from "./redis";

export const workflowQueue = new Queue("workflows", { connection });

export async function enqueueWorkflow(
  projectId: string,
  prompt: string,
  template?: string,
) {
  return workflowQueue.add(
    "execute-workflow",
    { projectId, prompt, template },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: true,
    },
  );
}

/**
 * Cancel any queued or active BullMQ jobs for the given project.
 * Waiting/delayed jobs are removed entirely; active jobs are marked
 * for discard so the worker skips processing once it detects the
 * project is gone.
 */
export async function cancelWorkflow(projectId: string): Promise<void> {
  try {
    // Remove waiting and delayed jobs — they haven't started yet.
    const pending = await workflowQueue.getJobs(["waiting", "delayed", "prioritized"]);
    for (const job of pending) {
      if (job.data?.projectId === projectId) {
        await job.remove().catch(() => {});
      }
    }

    // For active jobs we can't forcibly stop them mid-flight, but we
    // can update the job data so the worker's project-existence check
    // will bail out on the next node boundary.
    const active = await workflowQueue.getJobs(["active"]);
    for (const job of active) {
      if (job.data?.projectId === projectId) {
        await job.updateData({ ...job.data, _cancelled: true }).catch(() => {});
      }
    }
  } catch (err) {
    console.error("[cancelWorkflow] Failed to cancel jobs for project", projectId, err);
  }
}
