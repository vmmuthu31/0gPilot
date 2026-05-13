import "server-only";

import { ethers } from "ethers";
import { env } from "@/server/config/env";
import { type UserPlan } from "../../generated/prisma";

export type BillingPlanInfo = {
  plan: UserPlan;
  label: string;
  priceWei: string;
  creditsGranted: number;
};

export function getAdminWalletAddress(): string {
  return env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS;
}

export function getBillingChainId(): number {
  return 16602;
}

export function getBillingRpcUrl(): string {
  return env.NEXT_PUBLIC_0G_RPC_URL;
}

export function getPlans(): BillingPlanInfo[] {
  const proPriceWei = ethers.parseEther(env.PRO_PLAN_PRICE_OG).toString();
  const proPlusPriceWei = ethers
    .parseEther(env.PRO_PLUS_PLAN_PRICE_OG)
    .toString();

  return [
    {
      plan: "FREE",
      label: "Free",
      priceWei: "0",
      creditsGranted: 100,
    },
    {
      plan: "PRO",
      label: "Pro",
      priceWei: proPriceWei,
      creditsGranted: env.PRO_PLAN_CREDITS,
    },
    {
      plan: "PRO_PLUS",
      label: "Pro+",
      priceWei: proPlusPriceWei,
      creditsGranted: env.PRO_PLUS_PLAN_CREDITS,
    },
  ];
}

export function getPlanById(plan: UserPlan): BillingPlanInfo | null {
  return getPlans().find((p) => p.plan === plan) ?? null;
}
