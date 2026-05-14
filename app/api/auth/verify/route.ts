import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyWalletSignature } from "@/server/auth/verify-wallet";
import { createSession } from "@/server/auth/session";
import { connection } from "@/server/queue/redis";
import { db } from "@/db";

export const dynamic = "force-dynamic";

const VerifySchema = z.object({
  message: z.string().min(1),
  signature: z.string().regex(/^0x[0-9a-fA-F]+$/, "Invalid signature format"),
  address: z.string().regex(/^0x[0-9a-fA-F]{40}$/, "Invalid address"),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON" } },
      { status: 400 },
    );
  }

  const parsed = VerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_FAILED", message: parsed.error.issues } },
      { status: 400 },
    );
  }

  const { message, signature, address } = parsed.data;
  const normalizedAddress = address.toLowerCase();

  const nonceKey = `siwe:nonce:${normalizedAddress}`;
  const storedNonce = await connection.get(nonceKey);

  if (!storedNonce) {
    return NextResponse.json(
      {
        error: {
          code: "NONCE_EXPIRED",
          message: "Nonce expired or not found. Request a new one.",
        },
      },
      { status: 401 },
    );
  }

  const result = await verifyWalletSignature({
    message,
    signature,
    nonce: storedNonce,
  });

  if (!result.success || !result.address) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_SIGNATURE",
          message: result.error || "Signature verification failed",
        },
      },
      { status: 401 },
    );
  }

  await connection.del(nonceKey);

  let user = await db.user.findUnique({ where: { address: result.address } });

  if (!user) {
    user = await db.user.create({
      data: {
        address: result.address,
        credits: 100,
        plan: "FREE",
      },
    });
  } else {
    user = await db.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });
  }

  const token = await createSession({ address: user.address, userId: user.id });

  return NextResponse.json({ token, userId: user.id, address: user.address });
}
