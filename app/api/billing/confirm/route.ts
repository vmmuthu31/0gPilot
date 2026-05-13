import { withSecurity } from "@/server/security/api-handler";
import { z } from "zod";
import { db } from "@/db";
import { ethers } from "ethers";
import {
  getAdminWalletAddress,
  getBillingRpcUrl,
  getPlanById,
} from "@/server/billing/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ConfirmSchema = z.object({
  plan: z.enum(["PRO", "PRO_PLUS"]),
  txHash: z.string().regex(/^0x[0-9a-fA-F]{64}$/, "Invalid txHash"),
});

export const POST = withSecurity(ConfirmSchema, async (data, _req, session) => {
  const planInfo = getPlanById(data.plan);
  if (!planInfo) {
    return Response.json(
      { error: { code: "UNKNOWN_PLAN", message: "Unknown plan" } },
      { status: 400 },
    );
  }

  const admin = getAdminWalletAddress().toLowerCase();
  if (!/^0x[0-9a-fA-F]{40}$/.test(admin) || /^0x0{40}$/.test(admin)) {
    return Response.json(
      {
        error: {
          code: "BILLING_NOT_CONFIGURED",
          message: "Admin wallet address is not configured",
        },
      },
      { status: 500 },
    );
  }

  const provider = new ethers.JsonRpcProvider(getBillingRpcUrl());
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  const existing = await db.payment.findUnique({
    where: { txHash: data.txHash },
  });
  if (existing) {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, plan: true, credits: true },
    });
    return Response.json({ success: true, alreadyProcessed: true, user });
  }

  const tx = await provider.getTransaction(data.txHash);
  if (!tx) {
    return Response.json(
      { error: { code: "TX_NOT_FOUND", message: "Transaction not found" } },
      { status: 404 },
    );
  }

  const from = (tx.from ?? "").toLowerCase();
  const to = (tx.to ?? "").toLowerCase();

  if (from !== session.address.toLowerCase()) {
    return Response.json(
      {
        error: {
          code: "TX_FROM_MISMATCH",
          message: "Transaction sender mismatch",
        },
      },
      { status: 400 },
    );
  }

  if (to !== admin) {
    return Response.json(
      {
        error: {
          code: "TX_TO_MISMATCH",
          message: "Transaction receiver mismatch",
        },
      },
      { status: 400 },
    );
  }

  if (tx.value < BigInt(planInfo.priceWei)) {
    return Response.json(
      {
        error: {
          code: "INSUFFICIENT_PAYMENT",
          message: "Payment amount is too low",
        },
      },
      { status: 400 },
    );
  }

  const receipt = await provider.getTransactionReceipt(data.txHash);
  if (!receipt) {
    return Response.json(
      { error: { code: "TX_NOT_MINED", message: "Transaction not mined yet" } },
      { status: 409 },
    );
  }

  if (receipt.status !== 1) {
    return Response.json(
      { error: { code: "TX_FAILED", message: "Transaction failed" } },
      { status: 400 },
    );
  }

  const updated = await db.$transaction(async (trx) => {
    const payment = await trx.payment.create({
      data: {
        userId: session.userId,
        plan: data.plan,
        chainId,
        txHash: data.txHash,
        amountWei: tx.value.toString(),
      },
    });

    const user = await trx.user.update({
      where: { id: session.userId },
      data: {
        plan: data.plan,
        credits: { increment: planInfo.creditsGranted },
      },
      select: { id: true, plan: true, credits: true },
    });

    return { payment, user };
  });

  return Response.json({ success: true, ...updated });
});
