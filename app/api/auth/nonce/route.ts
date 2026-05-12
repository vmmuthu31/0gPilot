import { NextRequest, NextResponse } from "next/server";
import { connection } from "@/server/queue/redis";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rateLimitKey = `nonce-rl:${ip}`;
  const count = await connection.incr(rateLimitKey);
  if (count === 1) await connection.expire(rateLimitKey, 60);

  if (count > 10) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many nonce requests. Try again in a minute." } },
      { status: 429 },
    );
  }

  const address = req.nextUrl.searchParams.get("address")?.toLowerCase();

  if (!address || !/^0x[a-f0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid Ethereum address" } },
      { status: 400 },
    );
  }

  const nonce = randomBytes(16).toString("hex");
  const nonceKey = `siwe:nonce:${address}`;

  await connection.set(nonceKey, nonce, "EX", 300);

  return NextResponse.json({ nonce });
}
