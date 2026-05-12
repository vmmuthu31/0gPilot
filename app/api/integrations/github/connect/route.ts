import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifySession, extractBearerToken } from "@/server/auth/session";
import { db } from "@/db";
import { githubService } from "@/services/github.service";

export const dynamic = "force-dynamic";

const ConnectSchema = z.object({
  accessToken: z.string().min(1, "accessToken is required"),
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

  const { accessToken } = parsed.data;

  const ghUser = await githubService.getAuthenticatedUser(accessToken);
  if (!ghUser) {
    return NextResponse.json(
      { error: { code: "INVALID_GITHUB_TOKEN", message: "Could not authenticate with GitHub" } },
      { status: 401 },
    );
  }

  await db.user.update({
    where: { id: session.userId },
    data: {
      githubToken: accessToken,
      githubLogin: ghUser.login,
    },
  });

  return NextResponse.json({ success: true, login: ghUser.login });
}
