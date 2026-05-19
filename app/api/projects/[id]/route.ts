import { NextRequest, NextResponse } from "next/server";
import { verifySession, extractBearerToken } from "@/server/auth/session";
import { db } from "@/db";
import { cancelWorkflow } from "@/server/queue/jobs";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const token = extractBearerToken(req.headers.get("Authorization"));
  if (!token) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: { code: "INVALID_TOKEN" } }, { status: 401 });
  }

  const project = await db.project.findFirst({
    where: { id, userId: session.userId },
    include: {
      executions: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          node: true,
          status: true,
          log: true,
          error: true,
          startedAt: true,
          completedAt: true,
        },
      },
    },
  });

  if (!project) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Project not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json({ project });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const token = extractBearerToken(req.headers.get("Authorization"));
  if (!token) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: { code: "INVALID_TOKEN" } }, { status: 401 });
  }

  const project = await db.project.findFirst({
    where: { id, userId: session.userId },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Project not found" } },
      { status: 404 },
    );
  }

  // Cancel any queued / active BullMQ jobs before removing the DB record
  // so the worker doesn't keep burning API calls on a deleted project.
  await cancelWorkflow(id);

  await db.execution.deleteMany({ where: { projectId: id } });
  await db.project.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
