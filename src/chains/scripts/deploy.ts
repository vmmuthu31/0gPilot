/* eslint-disable @typescript-eslint/no-require-imports */

async function main() {
  const hre = require("hardhat");
  const { ethers } = hre;
  const fs = require("fs") as typeof import("fs");
  const path = require("path") as typeof import("path");

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} OG`);

  if (balance === 0n) {
    throw new Error(
      "Deployer wallet has 0 OG. Get testnet tokens from https://faucet.0g.ai before deploying.",
    );
  }

  console.log("\nDeploying AgentRegistry...");
  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy(deployer.address);
  await agentRegistry.waitForDeployment();
  const agentRegistryAddr = await agentRegistry.getAddress();
  console.log(`✓ AgentRegistry: ${agentRegistryAddr}`);

  console.log("\nDeploying ProjectRegistry...");
  const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
  const projectRegistry = await ProjectRegistry.deploy(deployer.address);
  await projectRegistry.waitForDeployment();
  const projectRegistryAddr = await projectRegistry.getAddress();
  console.log(`✓ ProjectRegistry: ${projectRegistryAddr}`);

  console.log("\nDeploying ExecutionController...");
  const ExecutionController = await ethers.getContractFactory("ExecutionController");
  const executionController = await ExecutionController.deploy(projectRegistryAddr, deployer.address);
  await executionController.waitForDeployment();
  const executionControllerAddr = await executionController.getAddress();
  console.log(`✓ ExecutionController: ${executionControllerAddr}`);

  console.log("\nDeploying ZeroGPilotRegistry...");
  const ZeroGPilotRegistry = await ethers.getContractFactory("ZeroGPilotRegistry");
  const zeroGPilotRegistry = await ZeroGPilotRegistry.deploy(deployer.address);
  await zeroGPilotRegistry.waitForDeployment();
  const zeroGPilotRegistryAddr = await zeroGPilotRegistry.getAddress();
  console.log(`✓ ZeroGPilotRegistry: ${zeroGPilotRegistryAddr}`);

  const addresses = {
    NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS: agentRegistryAddr,
    NEXT_PUBLIC_PROJECT_REGISTRY_ADDRESS: projectRegistryAddr,
    NEXT_PUBLIC_EXECUTION_CONTROLLER_ADDRESS: executionControllerAddr,
    NEXT_PUBLIC_ZEROG_PILOT_REGISTRY_ADDRESS: zeroGPilotRegistryAddr,
  };

  const outPath = path.join(__dirname, "../../../deployed-addresses.json");
  fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));

  console.log("\n=== Copy these into your .env and Vercel Environment Variables ===\n");
  for (const [key, val] of Object.entries(addresses)) {
    console.log(`${key}=${val}`);
  }
  console.log("\nAddresses saved to deployed-addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
