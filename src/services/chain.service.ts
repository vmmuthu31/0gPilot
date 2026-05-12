import "server-only";
import { ethers } from "ethers";
import { env } from "@/server/config/env";

import { ProjectRegistryABI } from "@/chains/abi/ProjectRegistry";
import { ExecutionControllerABI } from "@/chains/abi/ExecutionControllerABI";
import { AgentRegistryABI } from "@/chains/abi/AgentRegistry";
import { ZeroGPilotRegistryABI } from "@/chains/abi/ZeroGPilotRegistry";

const PROJECT_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_PROJECT_REGISTRY_ADDRESS ||
  "0x0000000000000000000000000000000000000000";
const EXECUTION_CONTROLLER_ADDRESS =
  process.env.NEXT_PUBLIC_EXECUTION_CONTROLLER_ADDRESS ||
  "0x0000000000000000000000000000000000000000";
const AGENT_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS ||
  "0x0000000000000000000000000000000000000000";
const ZEROG_PILOT_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_ZEROG_PILOT_REGISTRY_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

function toBytes32(str: string): string {
  if (str.startsWith("0x") && str.length === 66) return str;
  if (str.startsWith("0x")) return ethers.zeroPadValue(str, 32);

  if (/^[0-9a-fA-F]{64}$/.test(str)) return `0x${str}`;

  try {
    return ethers.id(str);
  } catch {
    return ethers.zeroPadValue("0x00", 32);
  }
}

export class ZeroGChainService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private projectRegistry: ethers.Contract;
  private executionController: ethers.Contract;
  private agentRegistry: ethers.Contract;
  private zeroGPilotRegistry: ethers.Contract;

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
    this.agentRegistry = new ethers.Contract(
      AGENT_REGISTRY_ADDRESS,
      AgentRegistryABI,
      this.signer,
    );
    this.zeroGPilotRegistry = new ethers.Contract(
      ZEROG_PILOT_REGISTRY_ADDRESS,
      ZeroGPilotRegistryABI,
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
      const b32ProjectId = toBytes32(projectId);
      const b32PromptHash = toBytes32(promptHash);
      const b32MemoryHash = toBytes32(memoryHash);
      const b32ExecutionProof = toBytes32(executionProof);

      const owner = await this.projectRegistry.getProjectOwner(b32ProjectId);
      if (owner === "0x0000000000000000000000000000000000000000") {
        const pTx = await this.projectRegistry.createProject(
          b32ProjectId,
          this.signer.address,
          `Project ${projectId.slice(0, 8)}`,
          "ipfs://metadata",
        );
        await pTx.wait();
      }

      const tx = await this.executionController.recordExecution(
        b32ProjectId,
        b32PromptHash,
        b32MemoryHash,
        b32ExecutionProof,
      );
      const receipt = await tx.wait();

      if (
        ZEROG_PILOT_REGISTRY_ADDRESS !==
        "0x0000000000000000000000000000000000000000"
      ) {
        const pilotTx = await this.zeroGPilotRegistry.registerExecution(
          b32ProjectId,
          b32PromptHash,
          b32MemoryHash,
          b32ExecutionProof,
        );
        await pilotTx.wait();
      }

      return { success: true, txHash: receipt.hash };
    } catch (error) {
      console.error("Registry error:", error);
      return { success: false, error: String(error) };
    }
  }

  async registerAgent(
    agentId: string,
    name: string,
    capability: string,
    endpoint: string,
  ) {
    if (
      AGENT_REGISTRY_ADDRESS === "0x0000000000000000000000000000000000000000"
    ) {
      console.log("Mock AgentRegistry: Registered agent.");
      return { success: true, txHash: "0xmocktxhash" };
    }
    try {
      const b32AgentId = toBytes32(agentId);
      const tx = await this.agentRegistry.registerAgent(
        b32AgentId,
        name,
        capability,
        this.signer.address,
        endpoint,
        "ipfs://agent-meta",
      );
      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash };
    } catch (error) {
      console.error("Agent Registry error:", error);
      return { success: false, error: String(error) };
    }
  }
}

export const chainService = new ZeroGChainService();
