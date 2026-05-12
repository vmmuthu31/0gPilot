import { memoryAgent } from "@/agents/memory.agent";

import { agentFail, type AgentResult } from "@/types/agent.types";

export interface SaveProjectMemoryInput {
  projectId: string;

  prompt: string;

  architecture?: string;

  frontend?: string;

  contracts?: string;

  audit?: string;

  deployment?: string;

  backend?: string;

  tests?: string;

  analytics?: string;

  status?: string;

  error?: string;
}

class MemoryService {
  async saveProjectMemory(
    input: SaveProjectMemoryInput,
  ): Promise<AgentResult<{ rootHash: string; txHash: string }>> {
    try {
      const result = await memoryAgent.storeWorkflowMemory({
        projectId: input.projectId,

        prompt: input.prompt,

        architecture: input.architecture,

        frontend: input.frontend,

        contracts: input.contracts,

        audit: input.audit,

        deployment: input.deployment,

        backend: input.backend,

        tests: input.tests,

        analytics: input.analytics,

        status: input.status,

        error: input.error,
      });

      return result;
    } catch (error: unknown) {
      console.error("Save Memory Error:", error);

      return agentFail(
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Memory save failed",
        undefined,
        error,
      );
    }
  }

  async saveFrontend(
    projectId: string,
    frontend: string,
  ): Promise<AgentResult<{ rootHash: string; txHash: string }>> {
    return memoryAgent.storeFrontend(projectId, frontend);
  }

  async saveContracts(
    projectId: string,
    contracts: string,
  ): Promise<AgentResult<{ rootHash: string; txHash: string }>> {
    return memoryAgent.storeContracts(projectId, contracts);
  }

  async saveAuditReport(
    projectId: string,
    audit: string,
  ): Promise<AgentResult<{ rootHash: string; txHash: string }>> {
    return memoryAgent.storeAuditReport(projectId, audit);
  }

  async saveDeployment(
    projectId: string,
    deployment: unknown,
  ): Promise<AgentResult<{ rootHash: string; txHash: string }>> {
    return memoryAgent.storeDeployment(projectId, deployment);
  }

  async loadProjectMemory(rootHash: string) {
    return memoryAgent.loadMemory(rootHash);
  }
}

export const memoryService = new MemoryService();
