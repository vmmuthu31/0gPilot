import { NextRequest, NextResponse } from "next/server";
import { extractBearerToken, verifySession, createSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("Authorization"));
  if (!token) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json(
      { error: { code: "INVALID_TOKEN", message: "Token expired or invalid" } },
      { status: 401 },
    );
  }

  const newToken = await createSession({
    address: session.address,
    userId: session.userId,
  });

  return NextResponse.json({ token: newToken });
}
