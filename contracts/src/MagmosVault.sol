// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title MagmosVault
/// @notice Recipient-owned savings vaults. A recipient can hold claimed pay across multiple
///         named vaults, each of which is multi-token.
/// @dev Solidity port of `sweem_core::employee_vault`. On Sui each vault was an object with
///      dynamic-object-field "buckets" keyed by token name; here a vault is an incrementing id
///      with per-ERC20 balances. Tokens are keyed by contract address rather than symbol string.
contract MagmosVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public nextVaultId = 1;

    mapping(uint256 vaultId => address owner) public vaultOwner;
    mapping(uint256 vaultId => string name) public vaultName;
    mapping(address owner => uint256[] vaultIds) private _ownerVaults;
    mapping(uint256 vaultId => mapping(address token => uint256 balance)) public vaultBalance;

    event VaultCreated(uint256 indexed vaultId, address indexed owner, string name);
    event VaultDeposited(uint256 indexed vaultId, address indexed token, uint256 amount);
    event VaultWithdrawn(uint256 indexed vaultId, address indexed token, uint256 amount);

    error NotVaultOwner();
    error VaultDoesNotExist();
    error InsufficientVaultBalance();
    error ZeroAmount();

    modifier onlyVaultOwner(uint256 vaultId) {
        if (vaultOwner[vaultId] != msg.sender) revert NotVaultOwner();
        _;
    }

    /// @notice Create a new named vault owned by the caller.
    function createVault(string calldata name) external returns (uint256 vaultId) {
        vaultId = nextVaultId++;
        vaultOwner[vaultId] = msg.sender;
        vaultName[vaultId] = name;
        _ownerVaults[msg.sender].push(vaultId);
        emit VaultCreated(vaultId, msg.sender, name);
    }

    /// @notice Deposit `amount` of `token` into a vault the caller owns. Requires prior approval.
    function deposit(uint256 vaultId, address token, uint256 amount)
        external
        nonReentrant
        onlyVaultOwner(vaultId)
    {
        if (amount == 0) revert ZeroAmount();
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        vaultBalance[vaultId][token] += amount;
        emit VaultDeposited(vaultId, token, amount);
    }

    /// @notice Withdraw `amount` of `token` from a vault the caller owns.
    function withdraw(uint256 vaultId, address token, uint256 amount)
        external
        nonReentrant
        onlyVaultOwner(vaultId)
    {
        if (amount == 0) revert ZeroAmount();
        uint256 bal = vaultBalance[vaultId][token];
        if (bal < amount) revert InsufficientVaultBalance();
        unchecked {
            vaultBalance[vaultId][token] = bal - amount;
        }
        IERC20(token).safeTransfer(msg.sender, amount);
        emit VaultWithdrawn(vaultId, token, amount);
    }

    // ------------------------------------------------------------------ views

    function ownerVaults(address owner) external view returns (uint256[] memory) {
        return _ownerVaults[owner];
    }

    function balanceOf(uint256 vaultId, address token) external view returns (uint256) {
        return vaultBalance[vaultId][token];
    }

    function vaultExists(uint256 vaultId) external view returns (bool) {
        return vaultOwner[vaultId] != address(0);
    }
}
