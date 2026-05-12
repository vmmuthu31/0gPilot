// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ZeroGPilotRegistry
 * @notice Simplified on-chain execution registry for 0GPilot workflows.
 *
 * This contract records verifiable execution traces per project.
 * It is similar in spirit to ExecutionController, but scoped as a
 * generic registry:
 *
 * - Each projectId (bytes32) can have multiple executions.
 * - Each execution stores hashes/keys pointing to off-chain / 0G Storage.
 * - Only authorized executors can write, anyone can read.
 */
contract ZeroGPilotRegistry is AccessControl, Pausable {
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    struct ProjectExecution {
        bytes32 projectId;       // project identifier
        bytes32 promptHash;      // hash of prompt/context
        bytes32 memoryHash;      // hash/key for memory snapshot (e.g. 0G Storage)
        bytes32 executionProof;  // hash/key for full workflow/code/etc. (e.g. Merkle root)
        uint256 timestamp;       // block timestamp
        address executor;        // msg.sender who recorded the execution
    }

    // projectId => executions[]
    mapping(bytes32 => ProjectExecution[]) private _executionsByProject;
    // user => projectIds[] (projects this user has executed)
    mapping(address => bytes32[]) private _userProjects;
    // user => (projectId => execution indices[])
    mapping(address => mapping(bytes32 => uint256[])) private _userProjectExecutionIndices;

    event ExecutionRegistered(
        bytes32 indexed projectId,
        uint256 indexed index,
        address indexed executor,
        bytes32 promptHash,
        bytes32 memoryHash,
        bytes32 executionProof,
        uint256 timestamp
    );

    constructor(address admin) {
        require(admin != address(0), "ZeroGPilotRegistry: admin is zero address");
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
     * @notice Register a new execution for a project.
     *
     * @param projectId       Project identifier (bytes32).
     * @param promptHash      Hash of the prompt/context.
     * @param memoryHash      Hash/key for memory snapshot (0G Storage reference).
     * @param executionProof  Hash/key for full execution proof (workflow, code, logs).
     */
    function registerExecution(
        bytes32 projectId,
        bytes32 promptHash,
        bytes32 memoryHash,
        bytes32 executionProof
    ) external whenNotPaused onlyRole(EXECUTOR_ROLE) {
        require(projectId != bytes32(0), "ZeroGPilotRegistry: invalid project id");

        ProjectExecution memory exec_ = ProjectExecution({
            projectId: projectId,
            promptHash: promptHash,
            memoryHash: memoryHash,
            executionProof: executionProof,
            timestamp: block.timestamp,
            executor: msg.sender
        });

        _executionsByProject[projectId].push(exec_);
        uint256 idx = _executionsByProject[projectId].length - 1;

        // track for user
        _userProjects[msg.sender].push(projectId);
        _userProjectExecutionIndices[msg.sender][projectId].push(idx);

        emit ExecutionRegistered(
            projectId,
            idx,
            msg.sender,
            promptHash,
            memoryHash,
            executionProof,
            exec_.timestamp
        );
    }

    // ------------------------------------------------------------------------
    // View Functions
    // ------------------------------------------------------------------------

    function getExecutionCount(bytes32 projectId) external view returns (uint256) {
        return _executionsByProject[projectId].length;
    }

    function getExecution(bytes32 projectId, uint256 index)
        external
        view
        returns (ProjectExecution memory)
    {
        require(index < _executionsByProject[projectId].length, "ZeroGPilotRegistry: index out of bounds");
        return _executionsByProject[projectId][index];
    }

    function getLatestExecution(bytes32 projectId)
        external
        view
        returns (ProjectExecution memory)
    {
        uint256 len = _executionsByProject[projectId].length;
        require(len > 0, "ZeroGPilotRegistry: no executions");
        return _executionsByProject[projectId][len - 1];
    }

    function getUserProjects(address user) external view returns (bytes32[] memory) {
        return _userProjects[user];
    }

    function getUserProjectExecutionIndices(address user, bytes32 projectId)
        external
        view
        returns (uint256[] memory)
    {
        return _userProjectExecutionIndices[user][projectId];
    }
}