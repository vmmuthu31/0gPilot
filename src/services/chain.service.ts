import "server-only";
import { ethers } from "ethers";
import { env } from "@/server/config/env";

const PROJECT_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_PROJECT_REGISTRY_ADDRESS ||
  "0x0000000000000000000000000000000000000000";
const EXECUTION_CONTROLLER_ADDRESS =
  process.env.NEXT_PUBLIC_EXECUTION_CONTROLLER_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

const ProjectRegistryABI = [
  "function createProject(string projectId) external",
  "function getProjectOwner(string projectId) external view returns (address)",
];

const ExecutionControllerABI = [
  "function recordExecution(string projectId, string promptHash, string memoryHash, string executionProof) external",
];

export class ZeroGChainService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private projectRegistry: ethers.Contract;
  private executionController: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(env.NEXT_PUBLIC_0G_RPC_URL);
    this.signer = new ethers.Wallet(env.ZERO_G_PRIVATE_KEY, this.provider);
    this.projectRegistry = new ethers.Contract(
      PROJECT_REGISTRY_ADDRESS,
      ProjectRegistryABI,
      this.signer,
    );
    this.executionController = new ethers.Contract(
      EXECUTION_CONTROLLER_ADDRESS,
      ExecutionControllerABI,
      this.signer,
    );
  }

  async registerExecution(
    projectId: string,
    promptHash: string,
    memoryHash: string,
    executionProof: string,
  ) {
    if (
      EXECUTION_CONTROLLER_ADDRESS ===
      "0x0000000000000000000000000000000000000000"
    ) {
      console.log("Mock Registry: Registered execution on-chain.");
      return { success: true, txHash: "0xmocktxhash" };
    }

    try {
      const owner = await this.projectRegistry.getProjectOwner(projectId);
      if (owner === "0x0000000000000000000000000000000000000000") {
        const pTx = await this.projectRegistry.createProject(projectId);
        await pTx.wait();
      }

      const tx = await this.executionController.recordExecution(
        projectId,
        promptHash,
        memoryHash,
        executionProof,
      );
      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash };
    } catch (error) {
      console.error("Registry error:", error);
      return { success: false, error: String(error) };
    }
  }
}

export const chainService = new ZeroGChainService();
