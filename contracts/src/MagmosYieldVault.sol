// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IMintableUnderlying {
    function mint(address to, uint256 amount) external;
}

/// @title MagmosYieldVault — "payroll that pays for itself"
/// @notice An ERC-4626 vault where an organization parks idle USDC and earns yield. The share
///         price grows continuously at a set APY, so `convertToAssets(shares)` ticks up live.
/// @dev TESTNET yield rail. Yield is realized by minting the (openly-mintable test) underlying
///      into the vault, so growth is real and on-chain. NOTE: this minting model requires a
///      MINTABLE underlying. Production **USYC** (Circle/Hashnote, `0xe918…b86C`) is NOT openly
///      mintable (KYC/teller-gated), so a USYC deployment must realize yield from USYC's
///      exchange-rate appreciation instead — this contract is a testnet demonstration, not a
///      drop-in USYC vault.
contract MagmosYieldVault is ERC4626, Ownable {
    uint256 public constant YEAR = 365 days;
    uint256 public constant MAX_APY_BPS = 5000; // 50% cap (sanity)

    uint256 public apyBps;
    uint64 public lastAccrued;

    event ApySet(uint256 apyBps);
    event Accrued(uint256 amount);

    error ApyTooHigh();

    constructor(IERC20 asset_, uint256 apyBps_, address owner_)
        ERC4626(asset_)
        ERC20("Magmos Yield USDC", "myUSDC")
        Ownable(owner_)
    {
        if (apyBps_ > MAX_APY_BPS) revert ApyTooHigh();
        apyBps = apyBps_;
        lastAccrued = uint64(block.timestamp);
    }

    /// @notice Live total assets = realized balance + accrued-but-unrealized yield.
    function totalAssets() public view override returns (uint256) {
        return IERC20(asset()).balanceOf(address(this)) + _pending();
    }

    /// @dev Yield accrued since `lastAccrued` on the current realized balance.
    function _pending() internal view returns (uint256) {
        uint256 bal = IERC20(asset()).balanceOf(address(this));
        uint256 elapsed = block.timestamp - lastAccrued;
        if (bal == 0 || apyBps == 0 || elapsed == 0) return 0;
        return (bal * apyBps * elapsed) / (10_000 * YEAR);
    }

    /// @notice Realize accrued yield by minting the underlying into the vault. Anyone may poke.
    function accrue() public {
        uint256 p = _pending();
        lastAccrued = uint64(block.timestamp);
        if (p > 0) {
            // Realize yield by minting the (mintable, testnet) underlying. Guarded so the
            // accrue/setApy path can never hard-revert on a non-mintable underlying.
            try IMintableUnderlying(asset()).mint(address(this), p) {
                emit Accrued(p);
            } catch {}
        }
    }

    /// @notice Current APY in basis points and the projected 1-year value of `assets`.
    function projectedAnnual(uint256 assets) external view returns (uint256) {
        return assets + (assets * apyBps) / 10_000;
    }

    function setApy(uint256 apyBps_) external onlyOwner {
        if (apyBps_ > MAX_APY_BPS) revert ApyTooHigh();
        accrue(); // settle at the old rate first
        apyBps = apyBps_;
        emit ApySet(apyBps_);
    }

    // Realize yield before any share-price-sensitive movement so withdrawals never underflow
    // the vault's actual balance (totalAssets is virtual until accrue mints it).
    function _deposit(address caller, address receiver, uint256 assets, uint256 shares)
        internal
        override
    {
        accrue();
        super._deposit(caller, receiver, assets, shares);
    }

    function _withdraw(
        address caller,
        address receiver,
        address owner_,
        uint256 assets,
        uint256 shares
    ) internal override {
        accrue();
        super._withdraw(caller, receiver, owner_, assets, shares);
    }
}
