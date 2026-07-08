// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IMagmosRegistry} from "./interfaces/IMagmosRegistry.sol";

/// @title MagmosRegistry
/// @notice Protocol fee schedule, treasury, and yield-protocol allowlist.
/// @dev Solidity port of `sweem_registry::registry`. On Sui this was an AccessControl object
///      plus a ProtocolRegistry and ProtocolConfig; here we fold all three into one contract
///      with two operational roles (fee manager, protocol manager) granted to the deployer.
///      The allowlist is kept for the future USYC yield adapter (CCTP-first scope ships fees=0).
contract MagmosRegistry is AccessControl, IMagmosRegistry {
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");
    bytes32 public constant PROTOCOL_MANAGER_ROLE = keccak256("PROTOCOL_MANAGER_ROLE");

    /// @notice Deposit fee ceiling: 5%.
    uint256 public constant MAX_DEPOSIT_FEE_BPS = 500;
    /// @notice Yield fee ceiling: 50%.
    uint256 public constant MAX_YIELD_FEE_BPS = 5000;

    // Yield type tags (mirror registry.move): 0 = Lending, 1 = Yield-bearing stable, 2 = LST.
    uint8 public constant YIELD_TYPE_LENDING = 0;
    uint8 public constant YIELD_TYPE_STABLE = 1;
    uint8 public constant YIELD_TYPE_LST = 2;

    uint256 public depositFeeBps;
    uint256 public orgYieldFeeBps;
    uint256 public vaultYieldFeeBps;
    address public treasury;

    struct ProtocolEntry {
        address adapter;
        uint8 yieldType;
        bool enabled;
        bool exists;
    }

    mapping(string name => ProtocolEntry) private _protocols;
    string[] private _protocolNames;

    event ProtocolAdded(string name, address adapter, uint8 yieldType);
    event ProtocolDisabled(string name);
    event ProtocolEnabled(string name);
    event FeesUpdated(uint256 depositFeeBps, uint256 orgYieldFeeBps, uint256 vaultYieldFeeBps);
    event TreasuryUpdated(address newTreasury);

    error ProtocolAlreadyExists();
    error ProtocolNotFound();
    error InvalidYieldType();
    error DepositFeeTooHigh();
    error YieldFeeTooHigh();
    error ZeroTreasury();

    /// @param admin Address granted admin + both operational roles (the deployer).
    /// @param treasury_ Fee recipient. Defaults fees to zero (set later via setFees).
    constructor(address admin, address treasury_) {
        if (treasury_ == address(0)) revert ZeroTreasury();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(FEE_MANAGER_ROLE, admin);
        _grantRole(PROTOCOL_MANAGER_ROLE, admin);
        treasury = treasury_;
    }

    // ------------------------------------------------------------------ protocols

    function addProtocol(string calldata name, address adapter, uint8 yieldType)
        external
        onlyRole(PROTOCOL_MANAGER_ROLE)
    {
        if (_protocols[name].exists) revert ProtocolAlreadyExists();
        if (yieldType > YIELD_TYPE_LST) revert InvalidYieldType();
        _protocols[name] =
            ProtocolEntry({adapter: adapter, yieldType: yieldType, enabled: true, exists: true});
        _protocolNames.push(name);
        emit ProtocolAdded(name, adapter, yieldType);
    }

    function disableProtocol(string calldata name) external onlyRole(PROTOCOL_MANAGER_ROLE) {
        if (!_protocols[name].exists) revert ProtocolNotFound();
        _protocols[name].enabled = false;
        emit ProtocolDisabled(name);
    }

    function enableProtocol(string calldata name) external onlyRole(PROTOCOL_MANAGER_ROLE) {
        if (!_protocols[name].exists) revert ProtocolNotFound();
        _protocols[name].enabled = true;
        emit ProtocolEnabled(name);
    }

    // ------------------------------------------------------------------ fees / treasury

    function setFees(uint256 depositFeeBps_, uint256 orgYieldFeeBps_, uint256 vaultYieldFeeBps_)
        external
        onlyRole(FEE_MANAGER_ROLE)
    {
        if (depositFeeBps_ > MAX_DEPOSIT_FEE_BPS) revert DepositFeeTooHigh();
        if (orgYieldFeeBps_ > MAX_YIELD_FEE_BPS || vaultYieldFeeBps_ > MAX_YIELD_FEE_BPS) {
            revert YieldFeeTooHigh();
        }
        depositFeeBps = depositFeeBps_;
        orgYieldFeeBps = orgYieldFeeBps_;
        vaultYieldFeeBps = vaultYieldFeeBps_;
        emit FeesUpdated(depositFeeBps_, orgYieldFeeBps_, vaultYieldFeeBps_);
    }

    function setTreasury(address treasury_) external onlyRole(FEE_MANAGER_ROLE) {
        if (treasury_ == address(0)) revert ZeroTreasury();
        treasury = treasury_;
        emit TreasuryUpdated(treasury_);
    }

    // ------------------------------------------------------------------ views

    function isApproved(string calldata name) external view returns (bool) {
        ProtocolEntry storage p = _protocols[name];
        return p.exists && p.enabled;
    }

    function protocol(string calldata name)
        external
        view
        returns (address adapter, uint8 yieldType, bool enabled, bool exists)
    {
        ProtocolEntry storage p = _protocols[name];
        return (p.adapter, p.yieldType, p.enabled, p.exists);
    }

    function protocolsByType(uint8 yieldType) external view returns (string[] memory) {
        uint256 n = _protocolNames.length;
        string[] memory tmp = new string[](n);
        uint256 k;
        for (uint256 i; i < n; ++i) {
            ProtocolEntry storage p = _protocols[_protocolNames[i]];
            if (p.enabled && p.yieldType == yieldType) {
                tmp[k++] = _protocolNames[i];
            }
        }
        string[] memory out = new string[](k);
        for (uint256 i; i < k; ++i) {
            out[i] = tmp[i];
        }
        return out;
    }

    function allProtocolNames() external view returns (string[] memory) {
        return _protocolNames;
    }
}
