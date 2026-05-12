import { z } from "zod";

export const PromptVersionManifestSchema = z.object({
  type: z.literal("prompt-version"),
  timestamp: z.number().int(),
  projectId: z.string().min(1),
  agent: z.string().min(1),
  prompt: z.string(),
  output: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const GeneratedFileManifestSchema = z.object({
  type: z.literal("generated-files"),
  timestamp: z.number().int(),
  projectId: z.string().min(1),
  files: z.record(z.string(), z.unknown()),
  createdAt: z.number().int().optional(),
});

export const AuditReportManifestSchema = z.object({
  type: z.literal("audit-report"),
  timestamp: z.number().int(),
  projectId: z.string().min(1),
  report: z.string(),
  score: z.number().min(0).max(100).optional(),
});

export const WorkflowMemoryManifestSchema = z.object({
  type: z.literal("workflow-memory"),
  timestamp: z.number().int(),
  projectId: z.string().min(1),
  prompt: z.string(),
  architecture: z.string().optional(),
  frontend: z.string().optional(),
  contracts: z.string().optional(),
  audit: z.string().optional(),
  deployment: z.string().optional(),
  backend: z.string().optional(),
  databaseDesign: z.string().optional(),
  tests: z.string().optional(),
  analytics: z.string().optional(),
  status: z.string().optional(),
  error: z.string().optional(),
});

export const DeploymentManifestSchema = z.object({
  type: z.literal("deployment"),
  timestamp: z.number().int(),
  projectId: z.string().min(1),
  contractAddress: z.string().startsWith("0x"),
  txHash: z.string().startsWith("0x"),
  network: z.string().optional(),
});

export type PromptVersionManifest = z.infer<typeof PromptVersionManifestSchema>;
export type GeneratedFileManifest = z.infer<typeof GeneratedFileManifestSchema>;
export type AuditReportManifest = z.infer<typeof AuditReportManifestSchema>;
export type WorkflowMemoryManifest = z.infer<typeof WorkflowMemoryManifestSchema>;
export type DeploymentManifest = z.infer<typeof DeploymentManifestSchema>;
