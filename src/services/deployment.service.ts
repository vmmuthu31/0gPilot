import "server-only";
import { ethers } from "ethers";
import { env } from "@/server/config/env";

const provider = new ethers.JsonRpcProvider(env.NEXT_PUBLIC_0G_RPC_URL);

const wallet = new ethers.Wallet(env.ZERO_G_PRIVATE_KEY, provider);

class DeploymentService {
  async deployContract(
    abi: ethers.InterfaceAbi,
    bytecode: string,
    args: (string | number | boolean)[] = [],
  ) {
    try {
      const factory = new ethers.ContractFactory(abi, bytecode, wallet);

      const contract = await factory.deploy(...args);

      await contract.waitForDeployment();

      const address = await contract.getAddress();

      return {
        success: true,
        address,
        txHash: contract.deploymentTransaction()?.hash,
      };
    } catch (error) {
      console.error(error);

      return {
        success: false,
        error,
      };
    }
  }
}

export const deploymentService = new DeploymentService();
