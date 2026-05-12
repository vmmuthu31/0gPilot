// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgentRegistry {
    struct Agent {
        string name;
        string capability;
        address owner;
        bool isActive;
    }

    mapping(bytes32 => Agent) public agents;
    bytes32[] public agentIds;

    event AgentRegistered(bytes32 indexed id, string name, address owner);

    function registerAgent(bytes32 id, string memory name, string memory capability) external {
        require(agents[id].owner == address(0), "Agent already registered");
        agents[id] = Agent({
            name: name,
            capability: capability,
            owner: msg.sender,
            isActive: true
        });
        agentIds.push(id);
        emit AgentRegistered(id, name, msg.sender);
    }
}
