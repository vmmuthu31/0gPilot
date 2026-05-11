import { ethers } from "ethers";

const RPC_URL = "https://evmrpc-testnet.0g.ai";

const provider = new ethers.JsonRpcProvider(RPC_URL);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

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
