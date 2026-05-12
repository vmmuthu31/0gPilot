import "server-only";
import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_0G_RPC_URL: z
    .string()
    .url()
    .default("https://evmrpc-testnet.0g.ai"),
  NEXT_PUBLIC_0G_INDEXER_RPC: z
    .string()
    .url()
    .default("https://indexer-storage-testnet-turbo.0g.ai"),
  ZERO_G_PRIVATE_KEY: z
    .string()
    .min(64, "ZERO_G_PRIVATE_KEY must be at least 64 hex characters (32 bytes)")
    .optional()
    .default("0000000000000000000000000000000000000000000000000000000000000001"),
  ZERO_G_API_KEY: z.string().optional(),
  ZERO_G_API_URL: z.string().url().optional(),
  STORAGE_ENCRYPTION_KEY: z
    .string()
    .min(32, "STORAGE_ENCRYPTION_KEY must be at least 32 characters")
    .default("00000000000000000000000000000000"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters")
    .default("0gpilot-insecure-dev-secret-change-in-prod"),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
});

export const env = EnvSchema.parse(process.env);
