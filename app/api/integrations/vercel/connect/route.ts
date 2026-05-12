import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifySession, extractBearerToken } from "@/server/auth/session";
import { db } from "@/db";

export const dynamic = "force-dynamic";

const ConnectSchema = z.object({
  accessToken: z.string().min(1, "accessToken is required"),
  teamId: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/, "teamId must be alphanumeric")
    .optional(),
});

export async function POST(req: NextRequest) {
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

  const parsed = ConnectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_FAILED", message: parsed.error.issues } },
      { status: 400 },
    );
  }

  const { accessToken, teamId } = parsed.data;

  const vercelRes = await fetch("https://api.vercel.com/v2/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!vercelRes.ok) {
    return NextResponse.json(
      { error: { code: "INVALID_VERCEL_TOKEN", message: "Could not authenticate with Vercel" } },
      { status: 401 },
    );
  }

  const vercelUser = await vercelRes.json();

  await db.user.update({
    where: { id: session.userId },
    data: {
      vercelToken: accessToken,
      vercelTeamId: teamId ?? null,
    },
  });

  return NextResponse.json({ success: true, username: vercelUser.user?.username });
}
