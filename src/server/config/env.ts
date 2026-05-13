import "server-only";
import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_0G_RPC_URL: z.string().default("https://evmrpc-testnet.0g.ai"),
  NEXT_PUBLIC_0G_INDEXER_RPC: z
    .string()
    .default("https://indexer-storage-testnet-turbo.0g.ai"),

  ZERO_G_PRIVATE_KEY: z
    .string()
    .optional()
    .default(
      "0000000000000000000000000000000000000000000000000000000000000001",
    ),
  ZERO_G_API_KEY: z.string().optional().default(""),
  ZERO_G_API_URL: z.string().optional().default(""),

  STORAGE_ENCRYPTION_KEY: z
    .string()
    .optional()
    .default("00000000000000000000000000000000"),

  JWT_SECRET: z
    .string()
    .optional()
    .default("0gpilot-insecure-dev-secret-change-in-prod"),

  DATABASE_URL: z
    .string()
    .optional()
    .default("postgresql://postgres:password@localhost:5432/0gpilot"),

  REDIS_URL: z.string().default("redis://localhost:6379"),

  NEXT_PUBLIC_ADMIN_WALLET_ADDRESS: z
    .string()
    .optional()
    .default("0x0000000000000000000000000000000000000000"),

  PRO_PLAN_PRICE_OG: z.string().optional().default("10"),

  PRO_PLUS_PLAN_PRICE_OG: z.string().optional().default("25"),

  PRO_PLAN_CREDITS: z
    .string()
    .optional()
    .default("5000")
    .transform((v) => {
      const n = parseInt(v, 10);
      return Number.isFinite(n) && n > 0 ? n : 5000;
    }),

  PRO_PLUS_PLAN_CREDITS: z
    .string()
    .optional()
    .default("25000")
    .transform((v) => {
      const n = parseInt(v, 10);
      return Number.isFinite(n) && n > 0 ? n : 25000;
    }),

  WORKFLOW_CREDITS_COST_FREE: z
    .string()
    .optional()
    .default("10")
    .transform((v) => {
      const n = parseInt(v, 10);
      return Number.isFinite(n) && n > 0 ? n : 10;
    }),

  WORKFLOW_CREDITS_COST_PRO: z
    .string()
    .optional()
    .default("5")
    .transform((v) => {
      const n = parseInt(v, 10);
      return Number.isFinite(n) && n > 0 ? n : 5;
    }),

  VECTOR_SIMILARITY_THRESHOLD: z
    .string()
    .default("0.8")
    .transform((v) => {
      const n = parseFloat(v);
      return isNaN(n) || n < 0 || n > 1 ? 0.8 : n;
    }),
});

export const env = EnvSchema.parse(process.env);

export function assertProductionSecrets(): void {
  if (process.env.NODE_ENV !== "production") return;

  const insecureDefaults: Record<string, string> = {
    JWT_SECRET: "0gpilot-insecure-dev-secret-change-in-prod",
    STORAGE_ENCRYPTION_KEY: "00000000000000000000000000000000",
    ZERO_G_PRIVATE_KEY:
      "0000000000000000000000000000000000000000000000000000000000000001",
    DATABASE_URL: "postgresql://postgres:password@localhost:5432/0gpilot",
    NEXT_PUBLIC_ADMIN_WALLET_ADDRESS:
      "0x0000000000000000000000000000000000000000",
  };

  const violations: string[] = [];
  for (const [key, defaultVal] of Object.entries(insecureDefaults)) {
    const val = process.env[key];
    if (!val || val === defaultVal) {
      violations.push(key);
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `[Config] Production environment is missing required secrets: ${violations.join(
        ", ",
      )}. Set them in Vercel Environment Variables.`,
    );
  }
}
