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
    where: {
      userId: session.userId,
      contractAddress: { not: null },
    },
    select: {
      id: true,
      prompt: true,
      status: true,
      contractAddress: true,
      contractTxHash: true,
      deploymentUrl: true,
      repoUrl: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const deployments = projects.map((p) => ({
    id: p.id,
    prompt: p.prompt.slice(0, 80) + (p.prompt.length > 80 ? "…" : ""),
    status: p.status,
    contractAddress: p.contractAddress,
    contractTxHash: p.contractTxHash,
    deploymentUrl: p.deploymentUrl,
    repoUrl: p.repoUrl,
    explorerUrl: p.contractAddress
      ? `https://chainscan-galileo.0g.ai/address/${p.contractAddress}`
      : null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  return NextResponse.json({ deployments });
}
