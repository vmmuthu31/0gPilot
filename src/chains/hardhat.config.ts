import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    zeroG: {
      url: process.env.NEXT_PUBLIC_0G_RPC_URL || "https://evmrpc-testnet.0g.ai",
      accounts: process.env.ZERO_G_PRIVATE_KEY ? [process.env.ZERO_G_PRIVATE_KEY] : [],
    }
  }
};

export default config;
