import "server-only";
import Redis from "ioredis";
import { env } from "@/server/config/env";

export const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

connection.on("error", (err) => console.error("[Redis] connection error:", err));
