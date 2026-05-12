// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ProjectRegistry
 * @notice On-chain registry for projects managed by 0GPilot on 0G Chain.
 *         Stores ownership and metadata, and links to off-chain/0G Storage data.
 *
 * Roles:
 * - DEFAULT_ADMIN_ROLE: manage roles and perform emergency actions.
 * - REGISTRAR_ROLE: can create and update projects.
 */
contract ProjectRegistry is AccessControl, Pausable {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    struct Project {
        bytes32 id;           // bytes32 identifier (e.g. keccak256 of external projectId)
        address owner;        // EOA, Safe, or contract that owns the project
        string name;          // optional human-readable name
        string metadataURI;   // 0G Storage / IPFS / HTTPS metadata
        bool isActive;        // soft activation flag
        uint256 createdAt;    // block timestamp
        uint256 updatedAt;    // last update timestamp
    }

    // projectId => Project
    mapping(bytes32 => Project) private _projects;
    // owner => projectIds[]
    mapping(address => bytes32[]) private _userProjects;
    // track all project IDs for enumeration if needed
    bytes32[] private _projectIds;

    // ------------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------------

    event ProjectCreated(
        bytes32 indexed projectId,
        address indexed owner,
        string name,
        string metadataURI
    );

    event ProjectUpdated(
        bytes32 indexed projectId,
        address indexed owner,
        string name,
        string metadataURI,
        bool isActive
    );

    event ProjectOwnershipTransferred(
        bytes32 indexed projectId,
        address indexed previousOwner,
        address indexed newOwner
    );

    event ProjectStatusChanged(
        bytes32 indexed projectId,
        bool isActive
    );

    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------

    constructor(address admin) {
        require(admin != address(0), "ProjectRegistry: admin is zero address");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
    }

    // ------------------------------------------------------------------------
    // Modifiers
    // ------------------------------------------------------------------------

    modifier projectExists(bytes32 projectId) {
        require(_projects[projectId].owner != address(0), "ProjectRegistry: project not found");
        _;
    }

    modifier onlyProjectOwner(bytes32 projectId) {
        require(_projects[projectId].owner == msg.sender, "ProjectRegistry: not project owner");
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
     * @notice Create a new project.
     * @param projectId   bytes32 identifier (e.g. keccak256 of external id).
     * @param owner       address that will own the project.
     * @param name        optional human-readable name.
     * @param metadataURI URI to project metadata (0G Storage, IPFS, HTTPS).
     */
    function createProject(
        bytes32 projectId,
        address owner,
        string calldata name,
        string calldata metadataURI
    ) external whenNotPaused onlyRole(REGISTRAR_ROLE) {
        require(projectId != bytes32(0), "ProjectRegistry: invalid id");
        require(owner != address(0), "ProjectRegistry: owner is zero address");
        require(_projects[projectId].owner == address(0), "ProjectRegistry: already exists");

        Project memory project = Project({
            id: projectId,
            owner: owner,
            name: name,
            metadataURI: metadataURI,
            isActive: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        _projects[projectId] = project;
        _userProjects[owner].push(projectId);
        _projectIds.push(projectId);

        emit ProjectCreated(projectId, owner, name, metadataURI);
    }

    /**
     * @notice Update project metadata and active status.
     *         Can be called by the project owner or REGISTRAR_ROLE.
     */
    function updateProject(
        bytes32 projectId,
        string calldata name,
        string calldata metadataURI,
        bool isActive
    ) external whenNotPaused projectExists(projectId) {
        Project storage project = _projects[projectId];

        bool isOwner = project.owner == msg.sender;
        bool isRegistrar = hasRole(REGISTRAR_ROLE, msg.sender);
        require(isOwner || isRegistrar, "ProjectRegistry: not authorized");

        project.name = name;
        project.metadataURI = metadataURI;
        project.isActive = isActive;
        project.updatedAt = block.timestamp;

        emit ProjectUpdated(projectId, project.owner, name, metadataURI, isActive);
        emit ProjectStatusChanged(projectId, isActive);
    }

    /**
     * @notice Transfer project ownership to a new address.
     */
    function transferProjectOwnership(bytes32 projectId, address newOwner)
        external
        whenNotPaused
        projectExists(projectId)
        onlyProjectOwner(projectId)
    {
        require(newOwner != address(0), "ProjectRegistry: new owner is zero address");

        Project storage project = _projects[projectId];
        address previousOwner = project.owner;
        project.owner = newOwner;
        project.updatedAt = block.timestamp;

        _userProjects[newOwner].push(projectId);
        // Note: previous owner's project list is not pruned here to avoid heavy on-chain loops.

        emit ProjectOwnershipTransferred(projectId, previousOwner, newOwner);
    }

    // ------------------------------------------------------------------------
    // View Functions
    // ------------------------------------------------------------------------

    function getProject(bytes32 projectId)
        external
        view
        projectExists(projectId)
        returns (Project memory)
    {
        return _projects[projectId];
    }

    function getProjectOwner(bytes32 projectId)
        external
        view
        projectExists(projectId)
        returns (address)
    {
        return _projects[projectId].owner;
    }

    function isProjectActive(bytes32 projectId)
        external
        view
        projectExists(projectId)
        returns (bool)
    {
        return _projects[projectId].isActive;
    }

    function getUserProjects(address user) external view returns (bytes32[] memory) {
        return _userProjects[user];
    }

    function getProjectCount() external view returns (uint256) {
        return _projectIds.length;
    }

    function getProjectIdAt(uint256 index) external view returns (bytes32) {
        require(index < _projectIds.length, "ProjectRegistry: index out of bounds");
        return _projectIds[index];
    }

    function projectExistsForId(bytes32 projectId) external view returns (bool) {
        return _projects[projectId].owner != address(0);
    }
}