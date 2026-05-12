export const ZeroGPilotRegistryABI = [
  {
    inputs: [
      { internalType: "address", name: "admin", type: "address" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "projectId", type: "bytes32" },
      { indexed: true, internalType: "uint256", name: "index", type: "uint256" },
      { indexed: true, internalType: "address", name: "executor", type: "address" },
      { indexed: false, internalType: "bytes32", name: "promptHash", type: "bytes32" },
      { indexed: false, internalType: "bytes32", name: "memoryHash", type: "bytes32" },
      { indexed: false, internalType: "bytes32", name: "executionProof", type: "bytes32" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    name: "ExecutionRegistered",
    type: "event"
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "EXECUTOR_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "bytes32", name: "role", type: "bytes32" }
    ],
    name: "getRoleAdmin",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "bytes32", name: "role", type: "bytes32" },
      { internalType: "address", name: "account", type: "address" }
    ],
    name: "hasRole",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "bytes32", name: "projectId", type: "bytes32" },
      { internalType: "bytes32", name: "promptHash", type: "bytes32" },
      { internalType: "bytes32", name: "memoryHash", type: "bytes32" },
      { internalType: "bytes32", name: "executionProof", type: "bytes32" }
    ],
    name: "registerExecution",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "bytes32", name: "projectId", type: "bytes32" }
    ],
    name: "getExecutionCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "bytes32", name: "projectId", type: "bytes32" },
      { internalType: "uint256", name: "index", type: "uint256" }
    ],
    name: "getExecution",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "projectId", type: "bytes32" },
          { internalType: "bytes32", name: "promptHash", type: "bytes32" },
          { internalType: "bytes32", name: "memoryHash", type: "bytes32" },
          { internalType: "bytes32", name: "executionProof", type: "bytes32" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "address", name: "executor", type: "address" }
        ],
        internalType: "struct ZeroGPilotRegistry.ProjectExecution",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "bytes32", name: "projectId", type: "bytes32" }
    ],
    name: "getLatestExecution",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "projectId", type: "bytes32" },
          { internalType: "bytes32", name: "promptHash", type: "bytes32" },
          { internalType: "bytes32", name: "memoryHash", type: "bytes32" },
          { internalType: "bytes32", name: "executionProof", type: "bytes32" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "address", name: "executor", type: "address" }
        ],
        internalType: "struct ZeroGPilotRegistry.ProjectExecution",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" }
    ],
    name: "getUserProjects",
    outputs: [{ internalType: "bytes32[]", name: "", type: "bytes32[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "bytes32", name: "projectId", type: "bytes32" }
    ],
    name: "getUserProjectExecutionIndices",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  }
] as const;