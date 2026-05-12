import { ethers } from "hardhat/ethers";

async function main() {
  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy();
  await agentRegistry.waitForDeployment();
  console.log(`AgentRegistry deployed to: ${await agentRegistry.getAddress()}`);

  const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
  const projectRegistry = await ProjectRegistry.deploy();
  await projectRegistry.waitForDeployment();
  const projectRegistryAddr = await projectRegistry.getAddress();
  console.log(`ProjectRegistry deployed to: ${projectRegistryAddr}`);

  const ExecutionController = await ethers.getContractFactory("ExecutionController");
  const executionController = await ExecutionController.deploy(projectRegistryAddr);
  await executionController.waitForDeployment();
  console.log(`ExecutionController deployed to: ${await executionController.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
