// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MagmosUSDC — faucet-mintable test USDC for Arc testnet
/// @notice A 6-decimal ERC-20 that anyone can mint from, so testers/judges can try Magmos
///         without waiting on an external faucet. Identical shape (6 dp) to real Circle USDC —
///         point the app at real USDC (`0x3600…0000`) via NEXT_PUBLIC_USDC for the official run;
///         nothing else changes because MagmosPayroll is token-agnostic.
/// @dev Testnet only. Open mint by design — do NOT deploy to mainnet.
contract MagmosUSDC is ERC20 {
    /// @notice Amount dispensed per `faucet()` call.
    uint256 public constant FAUCET_AMOUNT = 10_000e6; // 10,000 test USDC

    event Faucet(address indexed to, uint256 amount);

    constructor() ERC20("Magmos Test USDC", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Mint FAUCET_AMOUNT test USDC to the caller. Repeatable (testnet).
    function faucet() external {
        _mint(msg.sender, FAUCET_AMOUNT);
        emit Faucet(msg.sender, FAUCET_AMOUNT);
    }

    /// @notice Mint a specific amount to any address (test convenience).
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
        emit Faucet(to, amount);
    }
}
