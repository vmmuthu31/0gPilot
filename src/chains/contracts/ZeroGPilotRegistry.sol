// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ZeroGPilotRegistry {
    struct ProjectExecution {
        string projectId;
        string promptHash;
        string memoryHash;
        string executionProof;
        uint256 timestamp;
        address creator;
    }

    mapping(string => ProjectExecution) public executions;
    mapping(address => string[]) public userProjects;

    event ExecutionRegistered(string indexed projectId, address indexed creator, string memoryHash);

    function registerExecution(
        string memory projectId,
        string memory promptHash,
        string memory memoryHash,
        string memory executionProof
    ) external {
        require(bytes(executions[projectId].projectId).length == 0, "Project already registered");

        executions[projectId] = ProjectExecution({
            projectId: projectId,
            promptHash: promptHash,
            memoryHash: memoryHash,
            executionProof: executionProof,
            timestamp: block.timestamp,
            creator: msg.sender
        });

        userProjects[msg.sender].push(projectId);

        emit ExecutionRegistered(projectId, msg.sender, memoryHash);
    }

    function getExecution(string memory projectId) external view returns (ProjectExecution memory) {
        return executions[projectId];
    }
}
