import "server-only";
import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/server/config/env";

const PLACEHOLDER = "postgresql://postgres:password@localhost:5432/0gpilot";

function createPrismaClient() {
  const url = env.DATABASE_URL;

  if (!url || url === PLACEHOLDER) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[DB] DATABASE_URL is not configured. Set it in your Vercel environment variables.",
      );
    }
    console.warn("[DB] DATABASE_URL not set — using placeholder. DB calls will fail.");
  }

  const adapter = new PrismaPg({ connectionString: url });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
