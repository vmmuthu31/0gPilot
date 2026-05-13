import { withSecurity } from "@/server/security/api-handler";
import { z } from "zod";
import { enqueueWorkflow } from "@/server/queue/jobs";
import { db } from "@/db";
import { getWorkflowCreditsCost } from "@/server/billing/credits";

const CreateWorkflowSchema = z.object({
  prompt: z.string().min(10).max(2000),
  framework: z.string().optional(),
  blockchain: z.string().optional(),
  features: z.array(z.string()).optional(),
});

export const POST = withSecurity(
  CreateWorkflowSchema,
  async (data, _req, session) => {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, plan: true, credits: true },
    });

    if (!user) {
      return Response.json(
        { error: { code: "USER_NOT_FOUND", message: "User not found" } },
        { status: 404 },
      );
    }

    const cost = getWorkflowCreditsCost(user.plan);
    const debit = await db.user.updateMany({
      where: { id: session.userId, credits: { gte: cost } },
      data: { credits: { decrement: cost } },
    });

    if (debit.count === 0) {
      return Response.json(
        {
          error: {
            code: "INSUFFICIENT_CREDITS",
            message:
              "Not enough credits to start generation. Upgrade to Pro or Pro+ to continue.",
          },
          creditsRequired: cost,
        },
        { status: 402 },
      );
    }

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
      creditsDebited: cost,
    });
  },
);
