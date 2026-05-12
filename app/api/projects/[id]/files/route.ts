import { NextRequest, NextResponse } from "next/server";
import { verifySession, extractBearerToken } from "@/server/auth/session";
import { db } from "@/db";
import { projectBuilderService } from "@/services/project-builder.service";

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
    select: { id: true, status: true },
  });

  if (!project) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Project not found" } },
      { status: 404 },
    );
  }

  const specificFile = req.nextUrl.searchParams.get("file");

  if (specificFile) {
    const safeFile = specificFile.replace(/\.\./g, "").replace(/^\/+/, "");
    const content = await projectBuilderService.readFile(id, safeFile);

    if (content === null) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "File not found" } },
        { status: 404 },
      );
    }

    return NextResponse.json({ path: safeFile, content });
  }

  const files = await projectBuilderService.listFiles(id);
  return NextResponse.json({ projectId: id, files });
}
