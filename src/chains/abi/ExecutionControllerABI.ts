export const ExecutionControllerABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "projectRegistry_", "type": "address" },
      { "internalType": "address", "name": "admin", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "projectId", "type": "bytes32" },
      { "indexed": true, "internalType": "uint256", "name": "index", "type": "uint256" },
      { "indexed": false, "internalType": "bytes32", "name": "promptHash", "type": "bytes32" },
      { "indexed": false, "internalType": "bytes32", "name": "memoryHash", "type": "bytes32" },
      { "indexed": false, "internalType": "bytes32", "name": "executionProof", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "executor", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "ExecutionRecorded",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "projectId", "type": "bytes32" },
      { "internalType": "bytes32", "name": "promptHash", "type": "bytes32" },
      { "internalType": "bytes32", "name": "memoryHash", "type": "bytes32" },
      { "internalType": "bytes32", "name": "executionProof", "type": "bytes32" }
    ],
    "name": "recordExecution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

] as const;