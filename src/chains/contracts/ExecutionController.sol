// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IProjectRegistry {
    function getProjectOwner(string memory projectId) external view returns (address);
}

contract ExecutionController {
    IProjectRegistry public projectRegistry;

    struct Execution {
        string promptHash;
        string memoryHash;
        string executionProof;
        uint256 timestamp;
        address executor;
    }

    // projectId => Execution[]
    mapping(string => Execution[]) public projectExecutions;

    event ExecutionRecorded(string indexed projectId, string memoryHash, address executor);

    constructor(address _projectRegistry) {
        projectRegistry = IProjectRegistry(_projectRegistry);
    }

    function recordExecution(
        string memory projectId,
        string memory promptHash,
        string memory memoryHash,
        string memory executionProof
    ) external {
        address owner = projectRegistry.getProjectOwner(projectId);
        require(owner != address(0), "Project does not exist");
        
        projectExecutions[projectId].push(Execution({
            promptHash: promptHash,
            memoryHash: memoryHash,
            executionProof: executionProof,
            timestamp: block.timestamp,
            executor: msg.sender
        }));

        emit ExecutionRecorded(projectId, memoryHash, msg.sender);
    }
}
