import { computeService } from "@/services/compute.service";

import { WorkflowState } from "../state";

export async function deployNode(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  try {
    console.log("Executing Deployment Node...");

    const result = await computeService.chat(
      [
        {
          role: "system",
          content: `
You are a blockchain DevOps engineer.

Generate:
- Hardhat deployment scripts
- RPC configuration
- deployment steps
- environment variables
- verification commands

Return markdown + code.
`,
        },

        {
          role: "user",
          content: `
Project:
${state.prompt}

Contracts:
${state.contracts}
`,
        },
      ],
      {
        temperature: 0.3,
      },
    );

    if (!result.success) {
      return {
        error: result.error || "Deployment generation failed",

        status: "FAILED",
      };
    }

    return {
      deployment: result.content || "",

      status: "Deployment Generated",
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Deployment node execution failed";
    console.error(message);

    return {
      error: message || "Deployment node execution failed",

      status: "FAILED",
    };
  }
}
