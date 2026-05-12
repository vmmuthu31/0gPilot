import { ethers } from "hardhat/ethers";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy();
  await agentRegistry.waitForDeployment();
  const agentRegistryAddr = await agentRegistry.getAddress();
  console.log(`AgentRegistry deployed to: ${agentRegistryAddr}`);

  const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
  const projectRegistry = await ProjectRegistry.deploy();
  await projectRegistry.waitForDeployment();
  const projectRegistryAddr = await projectRegistry.getAddress();
  console.log(`ProjectRegistry deployed to: ${projectRegistryAddr}`);

  const ExecutionController = await ethers.getContractFactory("ExecutionController");
  const executionController = await ExecutionController.deploy(projectRegistryAddr);
  await executionController.waitForDeployment();
  const executionControllerAddr = await executionController.getAddress();
  console.log(`ExecutionController deployed to: ${executionControllerAddr}`);

  const ZeroGPilotRegistry = await ethers.getContractFactory("ZeroGPilotRegistry");
  const zeroGPilotRegistry = await ZeroGPilotRegistry.deploy(deployer.address);
  await zeroGPilotRegistry.waitForDeployment();
  const zeroGPilotRegistryAddr = await zeroGPilotRegistry.getAddress();
  console.log(`ZeroGPilotRegistry deployed to: ${zeroGPilotRegistryAddr}`);

  const addresses = {
    NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS: agentRegistryAddr,
    NEXT_PUBLIC_PROJECT_REGISTRY_ADDRESS: projectRegistryAddr,
    NEXT_PUBLIC_EXECUTION_CONTROLLER_ADDRESS: executionControllerAddr,
    NEXT_PUBLIC_ZEROG_PILOT_REGISTRY_ADDRESS: zeroGPilotRegistryAddr,
  };

  const outPath = path.join(__dirname, "../../../deployed-addresses.json");
  fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));
  console.log(`\nContract addresses written to deployed-addresses.json`);
  console.log("Add these to your .env:\n");
  for (const [key, val] of Object.entries(addresses)) {
    console.log(`${key}=${val}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
