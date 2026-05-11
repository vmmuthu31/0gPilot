import { memoryAgent } from "@/agents/memory.agent";

export interface SaveProjectMemoryInput {
  projectId: string;

  prompt: string;

  architecture?: string;

  frontend?: string;

  contracts?: string;

  audit?: string;

  deployment?: string;
}

class MemoryService {
  async saveProjectMemory(input: SaveProjectMemoryInput) {
    try {
      const result = await memoryAgent.storeWorkflowMemory({
        projectId: input.projectId,

        prompt: input.prompt,

        architecture: input.architecture,

        frontend: input.frontend,

        contracts: input.contracts,

        audit: input.audit,

        deployment: input.deployment,
      });

      return result;
    } catch (error: unknown) {
      console.error("Save Memory Error:", error);

      return {
        success: false,

        error: error instanceof Error ? error.message : "Memory save failed",
      };
    }
  }

  async saveFrontend(projectId: string, frontend: string) {
    return memoryAgent.storeFrontend(projectId, frontend);
  }

  async saveContracts(projectId: string, contracts: string) {
    return memoryAgent.storeContracts(projectId, contracts);
  }

  async saveAuditReport(projectId: string, audit: string) {
    return memoryAgent.storeAuditReport(projectId, audit);
  }

  async saveDeployment(projectId: string, deployment: unknown) {
    return memoryAgent.storeDeployment(projectId, deployment);
  }

  async loadProjectMemory(rootHash: string) {
    return memoryAgent.loadMemory(rootHash);
  }
}

export const memoryService = new MemoryService();
