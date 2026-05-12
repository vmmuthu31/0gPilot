import { computeService } from "@/services/compute.service";
import { DEPLOY_SYSTEM_PROMPT } from "@/prompts/deploy.prompt";
import { agentFail, agentOk, type AgentResult } from "@/types/agent.types";
import { deploymentService } from "@/services/deployment.service";

export interface DeployAgentInput {
  prompt: string;
  architecture?: string;
  contracts?: string;
}

export type DeployAgentResult = AgentResult<{
  deployment: string;
  address?: string;
  txHash?: string;
}>;

class DeployAgent {
  async execute(input: DeployAgentInput): Promise<DeployAgentResult> {
    try {
      if (!input.prompt.trim()) {
        return agentFail("INVALID_INPUT", "No prompt provided");
      }

      let deployedAddress: string | undefined;
      let deployedTxHash: string | undefined;
      let deploymentLog = "";

      if (input.contracts) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const solc = require("solc");

          const solidityMatch = input.contracts.match(
            /```solidity\n([\s\S]*?)```/,
          );
          let sourceCode = solidityMatch ? solidityMatch[1] : input.contracts;

          const nameMatch = sourceCode.match(/contract\s+([a-zA-Z0-9_]+)/);
          const contractName = nameMatch ? nameMatch[1] : null;

          // Provide a dummy SPDX and pragma if missing to help compilation
          if (!sourceCode.includes("SPDX-License-Identifier")) {
            sourceCode = "// SPDX-License-Identifier: MIT\n" + sourceCode;
          }

          if (contractName) {
            const compilerInput = {
              language: "Solidity",
              sources: { "Generated.sol": { content: sourceCode } },
              settings: { outputSelection: { "*": { "*": ["*"] } } },
            };

            const output = JSON.parse(
              solc.compile(JSON.stringify(compilerInput)),
            );

            if (output.errors) {
              const hasError = output.errors.some(
                (e: { severity: string }) => e.severity === "error",
              );
              if (hasError) {
                deploymentLog +=
                  "Compilation Errors:\n" +
                  JSON.stringify(output.errors) +
                  "\n";
              }
            }

            const compiledContract =
              output.contracts?.["Generated.sol"]?.[contractName];

            if (compiledContract) {
              const abi = compiledContract.abi;
              const bytecode = compiledContract.evm.bytecode.object;

              const deployResult = await deploymentService.deployContract(
                abi,
                bytecode,
              );
              if (deployResult.success && deployResult.address) {
                deployedAddress = deployResult.address;
                deployedTxHash = deployResult.txHash;
                deploymentLog += `\nAutonomously Deployed ${contractName} at ${deployedAddress} (tx: ${deployedTxHash})\n`;
              } else {
                deploymentLog += `\nDeployment failed: ${String(deployResult.error)}\n`;
              }
            } else {
              deploymentLog += `\nCould not find compiled contract for ${contractName}\n`;
            }
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          deploymentLog += `\nError during autonomous deployment: ${errMsg}\n`;
        }
      }

      const response = await computeService.chat(
        [
          {
            role: "system",
            content: DEPLOY_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: `
Project:
${input.prompt}

Architecture:
${input.architecture || ""}

Contracts:
${input.contracts || ""}

Autonomous Deployment Log:
${deploymentLog || "Not attempted"}
`,
          },
        ],
        {
          task: "deploy",
          temperature: 0.3,
          max_tokens: 5000,
        },
      );

      if (!response.success) {
        return agentFail(
          "UPSTREAM_COMPUTE_FAILED",
          response.error || "Deployment generation failed",
          undefined,
          response,
        );
      }

      return agentOk(
        {
          deployment: response.content || "",
          address: deployedAddress,
          txHash: deployedTxHash,
        },
        response,
      );
    } catch (error: unknown) {
      console.error("Deploy Agent Error:", error);

      return agentFail(
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Deploy agent failed",
        undefined,
        error,
      );
    }
  }
}

export const deployAgent = new DeployAgent();
