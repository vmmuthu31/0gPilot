import "server-only";
import { Queue } from "bullmq";
import { connection } from "./redis";

export const workflowQueue = new Queue("workflows", { connection });

export async function enqueueWorkflow(projectId: string, prompt: string) {
  return workflowQueue.add("execute-workflow", { projectId, prompt }, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
  });
}
