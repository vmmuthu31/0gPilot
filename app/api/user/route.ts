import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifySession, extractBearerToken } from "@/server/auth/session";
import { db } from "@/db";

export const dynamic = "force-dynamic";

const UpdateSettingsSchema = z.object({
  githubToken: z.string().optional(),
  vercelToken: z.string().optional(),
  vercelTeamId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("Authorization"));
  if (!token) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: { code: "INVALID_TOKEN" } }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      address: true,
      githubLogin: true,
      vercelTeamId: true,
      createdAt: true,
      githubToken: true,
      vercelToken: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      address: user.address,
      githubLogin: user.githubLogin,
      vercelTeamId: user.vercelTeamId,
      createdAt: user.createdAt,
      integrations: {
        github: !!user.githubToken,
        vercel: !!user.vercelToken,
      },
    },
  });
}

export async function PATCH(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("Authorization"));
  if (!token) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: { code: "INVALID_TOKEN" } }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: { code: "BAD_REQUEST" } }, { status: 400 });
  }

  const parsed = UpdateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_FAILED", message: parsed.error.issues } },
      { status: 400 },
    );
  }

  const updated = await db.user.update({
    where: { id: session.userId },
    data: {
      ...(parsed.data.githubToken !== undefined && {
        githubToken: parsed.data.githubToken || null,
      }),
      ...(parsed.data.vercelToken !== undefined && {
        vercelToken: parsed.data.vercelToken || null,
      }),
      ...(parsed.data.vercelTeamId !== undefined && {
        vercelTeamId: parsed.data.vercelTeamId || null,
      }),
    },
    select: { id: true, githubLogin: true, vercelTeamId: true },
  });

  return NextResponse.json({ success: true, user: updated });
}
