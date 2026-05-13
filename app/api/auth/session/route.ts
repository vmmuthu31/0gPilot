import { NextRequest, NextResponse } from "next/server";
import { verifySession, extractBearerToken } from "@/server/auth/session";
import { db } from "@/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("Authorization"));

  if (!token) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "No token provided" } },
      { status: 401 },
    );
  }

  const session = await verifySession(token);

  if (!session) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_TOKEN",
          message: "Token is invalid or expired",
        },
      },
      { status: 401 },
    );
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      address: true,
      plan: true,
      credits: true,
      githubLogin: true,
      vercelTeamId: true,
      createdAt: true,
      _count: { select: { projects: true } },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: { code: "USER_NOT_FOUND", message: "User no longer exists" } },
      { status: 404 },
    );
  }

  return NextResponse.json({ user });
}
