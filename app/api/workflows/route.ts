import { withSecurity } from "@/server/security/api-handler";
import { z } from "zod";
import { enqueueWorkflow } from "@/server/queue/jobs";

const CreateWorkflowSchema = z.object({
  projectId: z.string().min(1),
  prompt: z.string().min(10),
});

export const POST = withSecurity(CreateWorkflowSchema, async (data) => {
  const job = await enqueueWorkflow(data.projectId, data.prompt);
  return Response.json({ success: true, message: "Workflow enqueued", jobId: job.id });
});
