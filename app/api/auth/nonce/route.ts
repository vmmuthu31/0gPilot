import { NextRequest, NextResponse } from "next/server";
import { connection } from "@/server/queue/redis";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address")?.toLowerCase();

  if (!address || !/^0x[a-f0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid Ethereum address" } },
      { status: 400 }
    );
  }

  const nonce = randomBytes(16).toString("hex");
  const nonceKey = `siwe:nonce:${address}`;

  await connection.set(nonceKey, nonce, "EX", 300);

  return NextResponse.json({ nonce });
}
