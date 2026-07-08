// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IMagmosRegistry
/// @notice Fee schedule, treasury, and yield-protocol allowlist consumed by MagmosPayroll.
/// @dev Port of the read surface of `sweem_registry::registry` (ProtocolConfig + allowlist).
interface IMagmosRegistry {
    /// @notice Fee (bps) charged on every deposit/topup, routed to the treasury.
    function depositFeeBps() external view returns (uint256);

    /// @notice Fee (bps) the protocol takes on organization-side yield. (Reserved for USYC adapter.)
    function orgYieldFeeBps() external view returns (uint256);

    /// @notice Fee (bps) the protocol takes on recipient-vault yield. (Reserved for USYC adapter.)
    function vaultYieldFeeBps() external view returns (uint256);

    /// @notice Address that receives protocol fees.
    function treasury() external view returns (address);

    /// @notice Whether a named yield protocol is on the allowlist and enabled.
    function isApproved(string calldata name) external view returns (bool);
}
