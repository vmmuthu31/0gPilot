// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProjectRegistry {
    struct Project {
        string projectId;
        address owner;
        uint256 createdAt;
    }

    mapping(string => Project) public projects;
    mapping(address => string[]) public userProjects;

    event ProjectCreated(string indexed projectId, address indexed owner);

    function createProject(string memory projectId) external {
        require(projects[projectId].owner == address(0), "Project already exists");
        projects[projectId] = Project({
            projectId: projectId,
            owner: msg.sender,
            createdAt: block.timestamp
        });
        userProjects[msg.sender].push(projectId);
        emit ProjectCreated(projectId, msg.sender);
    }

    function getProjectOwner(string memory projectId) external view returns (address) {
        return projects[projectId].owner;
    }
}
