import { NextRequest, NextResponse } from "next/server";
import { verifySession, extractBearerToken } from "@/server/auth/session";
import { db } from "@/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("Authorization"));
  if (!token) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: { code: "INVALID_TOKEN" } }, { status: 401 });
  }

  const projects = await db.project.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      prompt: true,
      framework: true,
      blockchain: true,
      status: true,
      repoUrl: true,
      deploymentUrl: true,
      contractAddress: true,
      memoryHash: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ projects });
}
