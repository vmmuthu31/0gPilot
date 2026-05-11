import { zeroGStorageService } from "@/services/zeroG.service";

export interface MemoryAgentInput {
  projectId: string;

  prompt: string;

  architecture?: string;

  frontend?: string;

  contracts?: string;

  audit?: string;

  deployment?: string;
}

export interface MemoryAgentResult {
  success: boolean;

  rootHash?: string;

  txHash?: string;

  error?: string;
}

class MemoryAgent {
  async storeWorkflowMemory(
    input: MemoryAgentInput,
  ): Promise<MemoryAgentResult> {
    try {
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
        return {
          success: false,
          error: response.error || "Memory storage failed",
        };
      }

      return {
        success: true,

        rootHash: response.rootHash,

        txHash: response.txHash,
      };
    } catch (error: unknown) {
      console.error("Memory Agent Error:", error);

      return {
        success: false,

        error: error instanceof Error ? error.message : "Memory agent failed",
      };
    }
  }

  async storeFrontend(projectId: string, frontend: string) {
    try {
      return await zeroGStorageService.uploadJSON({
        type: "frontend",

        timestamp: Date.now(),

        projectId,

        frontend,
      });
    } catch (error: unknown) {
      console.error(error);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Frontend storage failed",
      };
    }
  }

  async storeContracts(projectId: string, contracts: string) {
    try {
      return await zeroGStorageService.uploadJSON({
        type: "contracts",

        timestamp: Date.now(),

        projectId,

        contracts,
      });
    } catch (error: unknown) {
      console.error(error);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Contract storage failed",
      };
    }
  }

  async storeAuditReport(projectId: string, audit: string) {
    try {
      return await zeroGStorageService.uploadJSON({
        type: "audit-report",

        timestamp: Date.now(),

        projectId,

        audit,
      });
    } catch (error: unknown) {
      console.error(error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Audit report storage failed",
      };
    }
  }

  async storeDeployment(projectId: string, deployment: unknown) {
    try {
      return await zeroGStorageService.uploadJSON({
        type: "deployment",

        timestamp: Date.now(),

        projectId,

        deployment,
      });
    } catch (error: unknown) {
      console.error(error);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Deployment storage failed",
      };
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
