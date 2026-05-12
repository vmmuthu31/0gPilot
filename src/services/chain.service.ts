import "server-only";
import { ethers } from "ethers";
import { env } from "@/server/config/env";
import { ZeroGPilotRegistryABI } from "@/chains/abi/ZeroGPilotRegistry";

const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_0G_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000";

export class ZeroGChainService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private registry: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(env.NEXT_PUBLIC_0G_RPC_URL);
    this.signer = new ethers.Wallet(env.ZERO_G_PRIVATE_KEY, this.provider);
    this.registry = new ethers.Contract(REGISTRY_ADDRESS, ZeroGPilotRegistryABI, this.signer);
  }

  async registerExecution(projectId: string, promptHash: string, memoryHash: string, executionProof: string) {
    if (REGISTRY_ADDRESS === "0x0000000000000000000000000000000000000000") {
      console.log("Mock Registry: Registered execution on-chain.");
      return { success: true, txHash: "0xmocktxhash" };
    }

    try {
      const tx = await this.registry.registerExecution(projectId, promptHash, memoryHash, executionProof);
      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash };
    } catch (error) {
      console.error("Registry error:", error);
      return { success: false, error: String(error) };
    }
  }
}

export const chainService = new ZeroGChainService();
