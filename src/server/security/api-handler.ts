import "server-only";
import { z } from "zod";
import { connection } from "@/server/queue/redis";

export function withSecurity<T>(
  schema: z.ZodSchema<T>,
  handler: (data: T, req: Request) => Promise<Response>,
) {
  return async (req: Request) => {
    try {
      const authHeader = req.headers.get("Authorization");
      const expectedKey = process.env.API_SECRET_KEY || "0gpilot-dev-key";
      if (authHeader !== `Bearer ${expectedKey}`) {
        return Response.json(
          { error: { code: "UNAUTHORIZED", message: "Invalid credentials" } },
          { status: 401 },
        );
      }

      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      const limitKey = `rate-limit:${ip}`;
      const requests = await connection.incr(limitKey);
      if (requests === 1) {
        await connection.expire(limitKey, 60);
      }
      if (requests > 100) {
        return Response.json(
          { error: { code: "RATE_LIMITED", message: "Too many requests" } },
          { status: 429 },
        );
      }

      let body;
      try {
        body = await req.json();
      } catch {
        return Response.json(
          { error: { code: "BAD_REQUEST", message: "Invalid JSON body" } },
          { status: 400 },
        );
      }

      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        return Response.json(
          {
            error: { code: "VALIDATION_FAILED", message: parsed.error.errors },
          },
          { status: 400 },
        );
      }

      return await handler(parsed.data, req);
    } catch (e) {
      console.error(e);
      return Response.json(
        {
          error: {
            code: "INTERNAL_ERROR",
            message: "An unexpected error occurred",
          },
        },
        { status: 500 },
      );
    }
  };
}
