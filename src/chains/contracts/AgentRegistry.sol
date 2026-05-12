// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AgentRegistry
 * @notice On-chain registry for AI agents used by 0GPilot on 0G Chain.
 *         Stores ownership, capabilities, and off-chain integration metadata
 *         (e.g., 0G Storage URIs, endpoints).
 *
 * Roles:
 * - DEFAULT_ADMIN_ROLE: can manage roles and perform emergency actions.
 * - REGISTRAR_ROLE: can register / update / deactivate agents.
 *
 * Ownership:
 * - Each agent has an `owner` (EOA or contract) which can manage that specific agent.
 */
contract AgentRegistry is AccessControl, Pausable {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    struct Agent {
        string name;              // human-readable name
        string capability;        // short description: "planner", "contract_audit", etc.
        address owner;            // owner/controller (EOA, Safe, or contract)
        string endpoint;          // off-chain endpoint or skill identifier (e.g. OpenClaw skill)
        string metadataURI;       // 0G Storage URI / IPFS / HTTPS with extended metadata
        bool isActive;            // soft activation flag
        uint256 createdAt;        // block timestamp
        uint256 updatedAt;        // last update timestamp
    }

    // agentId -> Agent
    mapping(bytes32 => Agent) private _agents;
    bytes32[] private _agentIds;

    // ------------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------------

    event AgentRegistered(
        bytes32 indexed id,
        string name,
        string capability,
        address indexed owner,
        string endpoint,
        string metadataURI
    );

    event AgentUpdated(
        bytes32 indexed id,
        string name,
        string capability,
        address indexed owner,
        string endpoint,
        string metadataURI,
        bool isActive
    );

    event AgentOwnershipTransferred(
        bytes32 indexed id,
        address indexed previousOwner,
        address indexed newOwner
    );

    event AgentStatusChanged(
        bytes32 indexed id,
        bool isActive
    );

    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------

    constructor(address admin) {
        require(admin != address(0), "AgentRegistry: admin is zero address");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
    }

    // ------------------------------------------------------------------------
    // Modifiers
    // ------------------------------------------------------------------------

    modifier onlyAgentOwner(bytes32 id) {
        require(_agents[id].owner == msg.sender, "AgentRegistry: not agent owner");
        _;
    }

    modifier agentExists(bytes32 id) {
        require(_agents[id].owner != address(0), "AgentRegistry: agent not found");
        _;
    }

    // ------------------------------------------------------------------------
    // Admin / Pause
    // ------------------------------------------------------------------------

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // ------------------------------------------------------------------------
    // Core Functions
    // ------------------------------------------------------------------------

    /**
     * @notice Register a new agent.
     * @param id         Unique agent identifier (e.g. keccak256 of some off-chain id).
     * @param name       Human-readable name.
     * @param capability Short description of what this agent does.
     * @param owner      Agent owner/controller address.
     * @param endpoint   Off-chain endpoint or skill identifier.
     * @param metadataURI URI pointing to extended metadata (0G Storage, IPFS, HTTPS).
     */
    function registerAgent(
        bytes32 id,
        string calldata name,
        string calldata capability,
        address owner,
        string calldata endpoint,
        string calldata metadataURI
    ) external whenNotPaused onlyRole(REGISTRAR_ROLE) {
        require(id != bytes32(0), "AgentRegistry: invalid id");
        require(owner != address(0), "AgentRegistry: owner is zero address");
        require(_agents[id].owner == address(0), "AgentRegistry: already registered");

        Agent memory agent = Agent({
            name: name,
            capability: capability,
            owner: owner,
            endpoint: endpoint,
            metadataURI: metadataURI,
            isActive: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        _agents[id] = agent;
        _agentIds.push(id);

        emit AgentRegistered(id, name, capability, owner, endpoint, metadataURI);
    }

    /**
     * @notice Update metadata for an existing agent.
     *         Can be called by the agent owner or an address with REGISTRAR_ROLE.
     */
    function updateAgent(
        bytes32 id,
        string calldata name,
        string calldata capability,
        string calldata endpoint,
        string calldata metadataURI,
        bool isActive
    ) external whenNotPaused agentExists(id) {
        Agent storage agent = _agents[id];

        bool isOwner = agent.owner == msg.sender;
        bool isRegistrar = hasRole(REGISTRAR_ROLE, msg.sender);
        require(isOwner || isRegistrar, "AgentRegistry: not authorized");

        agent.name = name;
        agent.capability = capability;
        agent.endpoint = endpoint;
        agent.metadataURI = metadataURI;
        agent.isActive = isActive;
        agent.updatedAt = block.timestamp;

        emit AgentUpdated(
            id,
            name,
            capability,
            agent.owner,
            endpoint,
            metadataURI,
            isActive
        );
        emit AgentStatusChanged(id, isActive);
    }

    /**
     * @notice Transfer ownership of an agent to a new address.
     */
    function transferAgentOwnership(bytes32 id, address newOwner)
        external
        whenNotPaused
        agentExists(id)
        onlyAgentOwner(id)
    {
        require(newOwner != address(0), "AgentRegistry: new owner is zero address");
        address prevOwner = _agents[id].owner;
        _agents[id].owner = newOwner;
        _agents[id].updatedAt = block.timestamp;

        emit AgentOwnershipTransferred(id, prevOwner, newOwner);
    }

    /**
     * @notice Set active/inactive status for an agent.
     *         Can be called by agent owner or registrar.
     */
    function setAgentActive(bytes32 id, bool isActive)
        external
        whenNotPaused
        agentExists(id)
    {
        Agent storage agent = _agents[id];

        bool isOwner = agent.owner == msg.sender;
        bool isRegistrar = hasRole(REGISTRAR_ROLE, msg.sender);
        require(isOwner || isRegistrar, "AgentRegistry: not authorized");

        agent.isActive = isActive;
        agent.updatedAt = block.timestamp;

        emit AgentStatusChanged(id, isActive);
    }

    // ------------------------------------------------------------------------
    // View Functions
    // ------------------------------------------------------------------------

    function getAgent(bytes32 id)
        external
        view
        agentExists(id)
        returns (Agent memory)
    {
        return _agents[id];
    }

    function getAgentOwner(bytes32 id)
        external
        view
        agentExists(id)
        returns (address)
    {
        return _agents[id].owner;
    }

    function isAgentActive(bytes32 id)
        external
        view
        agentExists(id)
        returns (bool)
    {
        return _agents[id].isActive;
    }

    function getAgentCount() external view returns (uint256) {
        return _agentIds.length;
    }

    function getAgentIdAt(uint256 index) external view returns (bytes32) {
        require(index < _agentIds.length, "AgentRegistry: index out of bounds");
        return _agentIds[index];
    }

    function agentExistsForId(bytes32 id) external view returns (bool) {
        return _agents[id].owner != address(0);
    }
}