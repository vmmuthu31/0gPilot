
import { env } from "@/server/config/env";
import { type UserPlan } from "../../generated/prisma";

export function getWorkflowCreditsCost(plan: UserPlan): number {
  return plan === "PRO" || plan === "PRO_PLUS"
    ? env.WORKFLOW_CREDITS_COST_PRO
    : env.WORKFLOW_CREDITS_COST_FREE;
}
