// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title IProjectRegistry
 * @notice Minimal interface for querying project ownership.
 *         Implemented by the ProjectRegistry contract.
 */
interface IProjectRegistry {
    function getProjectOwner(bytes32 projectId) external view returns (address);
}

/**
 * @title ExecutionController
 * @notice Records verifiable execution traces for 0GPilot workflows per project.
 *
 * Each execution can reference:
 * - a prompt hash (hash of user + system + context)
 * - a memory hash (hash/URI of project memory snapshot in 0G Storage)
 * - an execution proof (hash/URI of workflow state, generated code, logs)
 *
 * Roles:
 * - DEFAULT_ADMIN_ROLE: manage roles, pause/unpause.
 * - EXECUTOR_ROLE: allowed to record executions on behalf of projects (e.g. backend, agents).
 */
contract ExecutionController is AccessControl, Pausable {
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    IProjectRegistry public immutable projectRegistry;

    struct Execution {
        bytes32 projectId;        // project identifier (e.g. keccak256 of external id)
        bytes32 promptHash;       // hash of prompt/context (e.g. keccak256)
        bytes32 memoryHash;       // hash or key representing memory snapshot / 0G Storage ref
        bytes32 executionProof;   // hash or key representing detailed execution data
        uint256 timestamp;        // block timestamp
        address executor;         // msg.sender who recorded this execution
    }

    // projectId => list of executions
    mapping(bytes32 => Execution[]) private _projectExecutions;

    // ------------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------------

    event ExecutionRecorded(
        bytes32 indexed projectId,
        uint256 indexed index,
        bytes32 promptHash,
        bytes32 memoryHash,
        bytes32 executionProof,
        address indexed executor,
        uint256 timestamp
    );

    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------

    constructor(address projectRegistry_, address admin) {
        require(projectRegistry_ != address(0), "ExecutionController: registry is zero");
        require(admin != address(0), "ExecutionController: admin is zero");
        projectRegistry = IProjectRegistry(projectRegistry_);

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(EXECUTOR_ROLE, admin);
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
    // Core Logic
    // ------------------------------------------------------------------------

    /**
     * @notice Record a new execution trace for a project.
     *
     * @param projectId       Project identifier (bytes32).
     * @param promptHash      Hash of the prompt/context.
     * @param memoryHash      Hash or key representing memory snapshot (e.g. 0G Storage reference).
     * @param executionProof  Hash or key representing detailed execution data (e.g. code + workflow hash).
     */
    function recordExecution(
        bytes32 projectId,
        bytes32 promptHash,
        bytes32 memoryHash,
        bytes32 executionProof
    ) external whenNotPaused onlyRole(EXECUTOR_ROLE) {
        address owner = projectRegistry.getProjectOwner(projectId);
        require(owner != address(0), "ExecutionController: project not found");

        Execution memory exec_ = Execution({
            projectId: projectId,
            promptHash: promptHash,
            memoryHash: memoryHash,
            executionProof: executionProof,
            timestamp: block.timestamp,
            executor: msg.sender
        });

        _projectExecutions[projectId].push(exec_);
        uint256 idx = _projectExecutions[projectId].length - 1;

        emit ExecutionRecorded(
            projectId,
            idx,
            promptHash,
            memoryHash,
            executionProof,
            msg.sender,
            exec_.timestamp
        );
    }

    // ------------------------------------------------------------------------
    // View Functions
    // ------------------------------------------------------------------------

    function getExecutionCount(bytes32 projectId) external view returns (uint256) {
        return _projectExecutions[projectId].length;
    }

    function getExecution(bytes32 projectId, uint256 index)
        external
        view
        returns (Execution memory)
    {
        require(index < _projectExecutions[projectId].length, "ExecutionController: index out of bounds");
        return _projectExecutions[projectId][index];
    }

    function getLatestExecution(bytes32 projectId)
        external
        view
        returns (Execution memory)
    {
        uint256 len = _projectExecutions[projectId].length;
        require(len > 0, "ExecutionController: no executions");
        return _projectExecutions[projectId][len - 1];
    }
}