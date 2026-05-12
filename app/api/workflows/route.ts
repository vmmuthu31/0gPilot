import { withSecurity } from "@/server/security/api-handler";
import { z } from "zod";
import { enqueueWorkflow } from "@/server/queue/jobs";
import { db } from "@/db";

const CreateWorkflowSchema = z.object({
  prompt: z.string().min(10).max(2000),
  framework: z.string().optional(),
  blockchain: z.string().optional(),
  features: z.array(z.string()).optional(),
});

export const POST = withSecurity(CreateWorkflowSchema, async (data, _req, session) => {
  const project = await db.project.create({
    data: {
      userId: session.userId,
      prompt: data.prompt,
      framework: data.framework,
      blockchain: data.blockchain,
      features: data.features ?? [],
      status: "PENDING",
    },
  });

  const job = await enqueueWorkflow(project.id, data.prompt);

  return Response.json({
    success: true,
    projectId: project.id,
    jobId: job.id,
  });
});
