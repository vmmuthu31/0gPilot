export const AgentRegistryABI = [
  {
    "inputs": [{ "internalType": "address", "name": "admin", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "id", "type": "bytes32" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "capability", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "endpoint", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "metadataURI", "type": "string" }
    ],
    "name": "AgentRegistered",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "id", "type": "bytes32" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "capability", "type": "string" },
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "string", "name": "endpoint", "type": "string" },
      { "internalType": "string", "name": "metadataURI", "type": "string" }
    ],
    "name": "registerAgent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "id", "type": "bytes32" }],
    "name": "getAgent",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "capability", "type": "string" },
          { "internalType": "address", "name": "owner", "type": "address" },
          { "internalType": "string", "name": "endpoint", "type": "string" },
          { "internalType": "string", "name": "metadataURI", "type": "string" },
          { "internalType": "bool", "name": "isActive", "type": "bool" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }
        ],
        "internalType": "struct AgentRegistry.Agent",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;