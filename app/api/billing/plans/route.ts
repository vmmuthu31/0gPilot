import { withPublic } from "@/server/security/api-handler";
import {
  getAdminWalletAddress,
  getBillingChainId,
  getPlans,
} from "@/server/billing/plans";

export const dynamic = "force-dynamic";

export const GET = withPublic(async () => {
  return Response.json({
    chainId: getBillingChainId(),
    adminWalletAddress: getAdminWalletAddress(),
    plans: getPlans(),
  });
});
