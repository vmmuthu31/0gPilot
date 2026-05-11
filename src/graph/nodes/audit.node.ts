import { computeService } from "@/services/compute.service";
import { WorkflowState } from "../state";

export async function auditNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  try {
    console.log("Executing Audit Node...");

    const result = await computeService.chat(
      [
        {
          role: "system",
          content: `
You are a Solidity smart contract auditor.

Analyze:
- vulnerabilities
- reentrancy
- gas optimization
- overflow
- access control
- attack vectors

Return:
1. Vulnerabilities
2. Severity
3. Fixes
4. Security Score
`,
        },

        {
          role: "user",
          content: state.contracts || "",
        },
      ],
      {
        temperature: 0.2,
      },
    );

    if (!result.success) {
      return {
        error: result.error || "Audit failed",

        status: "FAILED",
      };
    }

    return {
      audit: result.content || "",

      status: "Audit Completed",
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Audit node execution failed";
    console.error(message);

    return {
      error: message || "Audit node execution failed",

      status: "FAILED",
    };
  }
}
