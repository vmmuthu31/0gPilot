export const ZeroGPilotRegistryABI = [
  "event ExecutionRegistered(string indexed projectId, address indexed creator, string memoryHash)",
  "function registerExecution(string projectId, string promptHash, string memoryHash, string executionProof) external",
  "function getExecution(string projectId) external view returns (tuple(string projectId, string promptHash, string memoryHash, string executionProof, uint256 timestamp, address creator))",
  "function userProjects(address, uint256) external view returns (string)"
];
