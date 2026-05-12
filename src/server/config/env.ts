import "server-only";
import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

const secret = (min: number, msg: string, devDefault: string) =>
  isProd
    ? z.string().min(min, msg)
    : z.string().min(min, msg).optional().default(devDefault);

const EnvSchema = z.object({
  NEXT_PUBLIC_0G_RPC_URL: z.string().url().default("https://evmrpc-testnet.0g.ai"),
  NEXT_PUBLIC_0G_INDEXER_RPC: z
    .string()
    .url()
    .default("https://indexer-storage-testnet-turbo.0g.ai"),

  ZERO_G_PRIVATE_KEY: secret(
    64,
    "ZERO_G_PRIVATE_KEY must be at least 64 hex characters (32 bytes)",
    "0000000000000000000000000000000000000000000000000000000000000001",
  ),
  STORAGE_ENCRYPTION_KEY: secret(
    32,
    "STORAGE_ENCRYPTION_KEY must be at least 32 characters",
    "00000000000000000000000000000000",
  ),
  JWT_SECRET: secret(
    32,
    "JWT_SECRET must be at least 32 characters",
    "0gpilot-insecure-dev-secret-change-in-prod",
  ),

  ZERO_G_API_KEY: z.string().optional(),
  ZERO_G_API_URL: z.string().url().optional(),

  DATABASE_URL: z
    .string()
    .optional()
    .default("postgresql://postgres:password@localhost:5432/0gpilot"),
  REDIS_URL: z.string().default("redis://localhost:6379"),

  VECTOR_SIMILARITY_THRESHOLD: z
    .string()
    .default("0.8")
    .transform((v) => {
      const n = parseFloat(v);
      return isNaN(n) || n < 0 || n > 1 ? 0.8 : n;
    }),
});

export const env = EnvSchema.parse(process.env);
