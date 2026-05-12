import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    testnet: {
      url: process.env.NEXT_PUBLIC_0G_RPC_URL || "https://evmrpc-testnet.0g.ai",
      chainId: 16602,
      ...(process.env.ZERO_G_PRIVATE_KEY ? { accounts: [process.env.ZERO_G_PRIVATE_KEY] } : {})
    },
    mainnet: {
      url: "https://evmrpc.0g.ai",
      chainId: 16661,
      ...(process.env.ZERO_G_PRIVATE_KEY ? { accounts: [process.env.ZERO_G_PRIVATE_KEY] } : {})
    },
  }
};

export default config;
