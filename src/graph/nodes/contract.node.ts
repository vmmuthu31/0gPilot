import { computeService } from "@/services/compute.service";
import { WorkflowState } from "../state";

export async function contractNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  try {
    console.log("Executing Contract Node...");

    const result = await computeService.chat(
      [
        {
          role: "system",
          content: `
You are a senior Solidity engineer.

Requirements:
- Solidity ^0.8.20
- OpenZeppelin
- secure
- gas optimized
- modular
- production ready

Return ONLY Solidity code.
`,
        },

        {
          role: "user",
          content: `
Project:
${state.prompt}

Architecture:
${state.architecture}
`,
        },
      ],
      {
        temperature: 0.3,
        max_tokens: 5000,
      },
    );

    if (!result.success) {
      return {
        error: result.error || "Contract generation failed",

        status: "FAILED",
      };
    }

    return {
      contracts: result.content || "",

      status: "Contracts Generated",
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Contract node execution failed";
    console.error(message);

    return {
      error: message || "Contract node execution failed",

      status: "FAILED",
    };
  }
}
