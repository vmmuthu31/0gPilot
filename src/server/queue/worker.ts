import { Worker } from "bullmq";
import { connection } from "./redis";
import { executeWorkflow } from "@/graph/workflow.graph";
import { emitWorkflowEvent } from "@/server/events/emitter";

export const workflowWorker = new Worker(
  "workflows",
  async (job) => {
    const { projectId, prompt, template } = job.data;
    console.log(`[Worker] Executing workflow for ${projectId}`);

    emitWorkflowEvent(
      projectId,
      "STARTING",
      "Workflow queued and starting execution",
    );

    const result = await executeWorkflow(prompt, projectId, template);

    if (!result.success) {
      emitWorkflowEvent(projectId, "FAILED", result.error);
      throw new Error(result.error);
    }

    emitWorkflowEvent(
      projectId,
      "COMPLETED",
      "Workflow execution finished successfully",
    );
    return result;
  },
  { connection },
);

workflowWorker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

workflowWorker.on("failed", (job, err) => {
  console.log(`[Worker] Job ${job?.id} failed with ${err.message}`);
});
