import { computeService } from "@/services/compute.service";

export interface AuditAgentInput {
  contracts: string;
}

export interface AuditAgentResult {
  success: boolean;

  report?: string;

  raw?: unknown;

  error?: string;
}

const SYSTEM_PROMPT = `
You are a professional Solidity smart contract auditor.

Analyze:
- reentrancy vulnerabilities
- overflow issues
- access control issues
- tx.origin misuse
- gas inefficiencies
- logic flaws
- unsafe external calls
- attack vectors

Return:
1. Vulnerabilities
2. Severity
3. Risk Analysis
4. Recommended Fixes
5. Security Score

Use clean markdown formatting.
`;

/**
 * =========================================================
 * AUDIT AGENT
 * =========================================================
 */

class AuditAgent {
  async execute(input: AuditAgentInput): Promise<AuditAgentResult> {
    try {
      const response = await computeService.chat(
        [
          {
            role: "system",
            content: SYSTEM_PROMPT,
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
