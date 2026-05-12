import { computeService } from "@/services/compute.service";

import { AUDIT_SYSTEM_PROMPT } from "@/prompts/audit.prompt";

import { agentFail, agentOk, type AgentResult } from "@/types/agent.types";

export interface AuditAgentInput {
  contracts: string;
}

export type AuditAgentResult = AgentResult<{ report: string }>;

class AuditAgent {
  async execute(input: AuditAgentInput): Promise<AuditAgentResult> {
    try {
      if (!input.contracts.trim()) {
        return agentFail("INVALID_INPUT", "No contracts provided");
      }

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
        return agentFail(
          "UPSTREAM_COMPUTE_FAILED",
          response.error || "Audit failed",
          undefined,
          response,
        );
      }

      return agentOk({ report: response.content || "" }, response);
    } catch (error: unknown) {
      console.error("Audit Agent Error:", error);

      return agentFail(
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Audit agent failed",
        undefined,
        error,
      );
    }
  }
}

export const auditAgent = new AuditAgent();
