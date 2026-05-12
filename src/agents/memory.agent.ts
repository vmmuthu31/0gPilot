import { zeroGStorageService } from "@/services/zeroG.service";

import { agentFail, agentOk, type AgentResult } from "@/types/agent.types";

export interface MemoryAgentInput {
  projectId: string;

  prompt: string;

  architecture?: string;

  frontend?: string;

  contracts?: string;

  audit?: string;

  deployment?: string;
}

export type MemoryAgentResult = AgentResult<{
  rootHash: string;
  txHash: string;
}>;

class MemoryAgent {
  async storeWorkflowMemory(
    input: MemoryAgentInput,
  ): Promise<MemoryAgentResult> {
    try {
      if (!input.projectId.trim()) {
        return agentFail("INVALID_INPUT", "No projectId provided");
      }

      if (!input.prompt.trim()) {
        return agentFail("INVALID_INPUT", "No prompt provided");
      }

      const response = await zeroGStorageService.uploadJSON({
        type: "workflow-memory",

        timestamp: Date.now(),

        projectId: input.projectId,

        prompt: input.prompt,

        architecture: input.architecture,

        frontend: input.frontend,

        contracts: input.contracts,

        audit: input.audit,

        deployment: input.deployment,
      });

      if (!response.success) {
        return agentFail(
          "UPSTREAM_STORAGE_FAILED",
          response.error || "Memory storage failed",
          undefined,
          response,
        );
      }

      const rootHash = response.rootHash;
      const txHash = response.txHash;

      if (!rootHash || !txHash) {
        return agentFail(
          "UPSTREAM_STORAGE_FAILED",
          "Storage response missing rootHash/txHash",
          response,
        );
      }

      return agentOk({ rootHash, txHash }, response);
    } catch (error: unknown) {
      console.error("Memory Agent Error:", error);

      return agentFail(
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Memory agent failed",
        undefined,
        error,
      );
    }
  }

  async storeFrontend(
    projectId: string,
    frontend: string,
  ): Promise<MemoryAgentResult> {
    try {
      if (!projectId.trim()) {
        return agentFail("INVALID_INPUT", "No projectId provided");
      }

      const response = await zeroGStorageService.uploadJSON({
        type: "frontend",

        timestamp: Date.now(),

        projectId,

        frontend,
      });

      if (!response.success) {
        return agentFail(
          "UPSTREAM_STORAGE_FAILED",
          response.error || "Frontend storage failed",
          undefined,
          response,
        );
      }

      const rootHash = response.rootHash;
      const txHash = response.txHash;

      if (!rootHash || !txHash) {
        return agentFail(
          "UPSTREAM_STORAGE_FAILED",
          "Storage response missing rootHash/txHash",
          response,
        );
      }

      return agentOk({ rootHash, txHash }, response);
    } catch (error: unknown) {
      console.error(error);

      return agentFail(
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Frontend storage failed",
        undefined,
        error,
      );
    }
  }

  async storeContracts(
    projectId: string,
    contracts: string,
  ): Promise<MemoryAgentResult> {
    try {
      if (!projectId.trim()) {
        return agentFail("INVALID_INPUT", "No projectId provided");
      }

      const response = await zeroGStorageService.uploadJSON({
        type: "contracts",

        timestamp: Date.now(),

        projectId,

        contracts,
      });

      if (!response.success) {
        return agentFail(
          "UPSTREAM_STORAGE_FAILED",
          response.error || "Contract storage failed",
          undefined,
          response,
        );
      }

      const rootHash = response.rootHash;
      const txHash = response.txHash;

      if (!rootHash || !txHash) {
        return agentFail(
          "UPSTREAM_STORAGE_FAILED",
          "Storage response missing rootHash/txHash",
          response,
        );
      }

      return agentOk({ rootHash, txHash }, response);
    } catch (error: unknown) {
      console.error(error);

      return agentFail(
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Contract storage failed",
        undefined,
        error,
      );
    }
  }

  async storeAuditReport(
    projectId: string,
    audit: string,
  ): Promise<MemoryAgentResult> {
    try {
      if (!projectId.trim()) {
        return agentFail("INVALID_INPUT", "No projectId provided");
      }

      const response = await zeroGStorageService.uploadJSON({
        type: "audit-report",

        timestamp: Date.now(),

        projectId,

        audit,
      });

      if (!response.success) {
        return agentFail(
          "UPSTREAM_STORAGE_FAILED",
          response.error || "Audit report storage failed",
          undefined,
          response,
        );
      }

      const rootHash = response.rootHash;
      const txHash = response.txHash;

      if (!rootHash || !txHash) {
        return agentFail(
          "UPSTREAM_STORAGE_FAILED",
          "Storage response missing rootHash/txHash",
          response,
        );
      }

      return agentOk({ rootHash, txHash }, response);
    } catch (error: unknown) {
      console.error(error);

      return agentFail(
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Audit report storage failed",
        undefined,
        error,
      );
    }
  }

  async storeDeployment(
    projectId: string,
    deployment: unknown,
  ): Promise<MemoryAgentResult> {
    try {
      if (!projectId.trim()) {
        return agentFail("INVALID_INPUT", "No projectId provided");
      }

      const response = await zeroGStorageService.uploadJSON({
        type: "deployment",

        timestamp: Date.now(),

        projectId,

        deployment,
      });

      if (!response.success) {
        return agentFail(
          "UPSTREAM_STORAGE_FAILED",
          response.error || "Deployment storage failed",
          undefined,
          response,
        );
      }

      const rootHash = response.rootHash;
      const txHash = response.txHash;

      if (!rootHash || !txHash) {
        return agentFail(
          "UPSTREAM_STORAGE_FAILED",
          "Storage response missing rootHash/txHash",
          response,
        );
      }

      return agentOk({ rootHash, txHash }, response);
    } catch (error: unknown) {
      console.error(error);

      return agentFail(
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Deployment storage failed",
        undefined,
        error,
      );
    }
  }

  async loadMemory(rootHash: string) {
    try {
      return await zeroGStorageService.downloadFile(rootHash);
    } catch (error: unknown) {
      console.error(error);

      return null;
    }
  }
}

export const memoryAgent = new MemoryAgent();
