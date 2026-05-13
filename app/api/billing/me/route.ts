import { withSecurity } from "@/server/security/api-handler";
import { z } from "zod";
import { db } from "@/db";

export const dynamic = "force-dynamic";

export const POST = withSecurity(
  z.object({}).optional().default({}),
  async (_data, _req, session) => {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, address: true, plan: true, credits: true },
    });

    if (!user) {
      return Response.json(
        { error: { code: "USER_NOT_FOUND", message: "User not found" } },
        { status: 404 },
      );
    }

    return Response.json({ success: true, user });
  },
);
