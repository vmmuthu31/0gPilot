export const ProjectRegistryABI = [
  {
    "inputs": [{ "internalType": "address", "name": "admin", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "projectId", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "metadataURI", "type": "string" }
    ],
    "name": "ProjectCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "projectId", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "metadataURI", "type": "string" },
      { "indexed": false, "internalType": "bool", "name": "isActive", "type": "bool" }
    ],
    "name": "ProjectUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "projectId", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
    ],
    "name": "ProjectOwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "projectId", "type": "bytes32" },
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "metadataURI", "type": "string" }
    ],
    "name": "createProject",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "projectId", "type": "bytes32" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "metadataURI", "type": "string" },
      { "internalType": "bool", "name": "isActive", "type": "bool" }
    ],
    "name": "updateProject",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "projectId", "type": "bytes32" },
      { "internalType": "address", "name": "newOwner", "type": "address" }
    ],
    "name": "transferProjectOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "projectId", "type": "bytes32" }],
    "name": "getProjectOwner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "projectId", "type": "bytes32" }],
    "name": "projectExistsForId",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;