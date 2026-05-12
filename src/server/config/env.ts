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
    .min(64, "Private key must be at least 64 characters"),
  ZERO_G_API_KEY: z.string().optional(),
  ZERO_G_API_URL: z.string().url().optional(),
  STORAGE_ENCRYPTION_KEY: z
    .string()
    .min(32, "Encryption key must be at least 32 characters")
    .default("00000000000000000000000000000000"),
});

export const env = EnvSchema.parse(process.env);
