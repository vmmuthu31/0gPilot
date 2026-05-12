import "server-only";
import { z } from "zod";
import { connection } from "@/server/queue/redis";
import { checkPromptSafety } from "./moderation";
import { verifySession, extractBearerToken, type SessionPayload } from "@/server/auth/session";

export function withSecurity<T>(
  schema: z.ZodSchema<T>,
  handler: (data: T, req: Request, session: SessionPayload) => Promise<Response>,
) {
  return async (req: Request) => {
    try {
      const token = extractBearerToken(req.headers.get("Authorization"));

      if (!token) {
        return Response.json(
          { error: { code: "UNAUTHORIZED", message: "Missing Authorization header" } },
          { status: 401 },
        );
      }

      const session = await verifySession(token);

      if (!session) {
        return Response.json(
          { error: { code: "INVALID_TOKEN", message: "Token is invalid or expired" } },
          { status: 401 },
        );
      }

      const limitKey = `rate-limit:${session.userId}`;
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

      let body: unknown;
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
          { error: { code: "VALIDATION_FAILED", message: parsed.error.issues } },
          { status: 400 },
        );
      }

      if (
        typeof parsed.data === "object" &&
        parsed.data !== null &&
        "prompt" in parsed.data
      ) {
        const promptToModerate = parsed.data.prompt;
        if (typeof promptToModerate === "string") {
          const isSafe = await checkPromptSafety(promptToModerate);
          if (!isSafe) {
            return Response.json(
              { error: { code: "PROMPT_INJECTION", message: "Malicious or unsafe prompt detected." } },
              { status: 400 },
            );
          }
        }
      }

      return await handler(parsed.data, req, session);
    } catch (e) {
      console.error(e);
      return Response.json(
        { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
        { status: 500 },
      );
    }
  };
}

export function withPublic(
  handler: (req: Request) => Promise<Response>,
) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (e) {
      console.error(e);
      return Response.json(
        { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
        { status: 500 },
      );
    }
  };
}
