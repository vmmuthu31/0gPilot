import { computeService } from "@/services/compute.service";

import { AUDIT_SYSTEM_PROMPT } from "@/prompts/audit.prompt";

export interface AuditAgentInput {
  contracts: string;
}

export interface AuditAgentResult {
  success: boolean;

  report?: string;

  raw?: unknown;

  error?: string;
}

class AuditAgent {
  async execute(input: AuditAgentInput): Promise<AuditAgentResult> {
    try {
      const response = await computeService.chat(
        [
          {
            role: "system",
            content: AUDIT_SYSTEM_PROMPT,
          },

          {
            role: "user",
            content: input.contracts,
          },
        ],
        {
          temperature: 0.2,
          max_tokens: 4000,
        },
      );

      if (!response.success) {
        return {
          success: false,
          error: response.error || "Audit failed",
        };
      }

      return {
        success: true,

        report: response.content || "",

        raw: response,
      };
    } catch (error: unknown) {
      console.error("Audit Agent Error:", error);

      return {
        success: false,

        error: error instanceof Error ? error.message : "Audit agent failed",
      };
    }
  }
}

export const auditAgent = new AuditAgent();
