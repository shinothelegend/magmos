// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {MagmosUSDC} from "../src/MagmosUSDC.sol";
import {MagmosYieldVault} from "../src/MagmosYieldVault.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MagmosYieldVaultTest is Test {
    MagmosUSDC usdc;
    MagmosYieldVault vault;
    address owner = makeAddr("owner");
    address alice = makeAddr("alice");

    function setUp() public {
        vm.warp(1_700_000_000);
        usdc = new MagmosUSDC();
        vault = new MagmosYieldVault(usdc, 500, owner); // 5% APY
        vm.startPrank(alice);
        usdc.faucet(); // 10,000 test USDC
        usdc.approve(address(vault), type(uint256).max);
        vm.stopPrank();
    }

    function test_DepositMintsShares() public {
        vm.prank(alice);
        uint256 shares = vault.deposit(10_000e6, alice);
        assertEq(vault.balanceOf(alice), shares);
        assertApproxEqAbs(vault.totalAssets(), 10_000e6, 1);
    }

    function test_YieldAccruesAt5Percent() public {
        vm.prank(alice);
        vault.deposit(10_000e6, alice);
        vm.warp(block.timestamp + 365 days);
        // 5% of 10,000 over exactly one year = 500
        assertEq(vault.totalAssets(), 10_500e6);
        // realize the yield on-chain
        vault.accrue();
        assertEq(usdc.balanceOf(address(vault)), 10_500e6);
    }

    function test_WithdrawGetsPrincipalPlusYield() public {
        vm.prank(alice);
        vault.deposit(10_000e6, alice);
        vm.warp(block.timestamp + 365 days);
        uint256 maxAssets = vault.maxWithdraw(alice);
        assertApproxEqAbs(maxAssets, 10_500e6, 2);
        uint256 shares = vault.balanceOf(alice); // cache before prank
        vm.prank(alice);
        vault.redeem(shares, alice, alice);
        assertApproxEqAbs(usdc.balanceOf(alice), 10_500e6, 2);
    }

    function test_SetApy_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice)
        );
        vault.setApy(1000);

        vm.prank(owner);
        vault.setApy(1000);
        assertEq(vault.apyBps(), 1000);
    }

    function test_SetApy_RevertsAboveMax() public {
        vm.prank(owner);
        vm.expectRevert(MagmosYieldVault.ApyTooHigh.selector);
        vault.setApy(5001);
    }

    function test_ProjectedAnnual() public view {
        assertEq(vault.projectedAnnual(10_000e6), 10_500e6);
    }

    function test_TwoDepositors_ShareYieldProRata() public {
        address bob = makeAddr("bob");
        vm.startPrank(bob);
        usdc.faucet();
        usdc.approve(address(vault), type(uint256).max);
        vm.stopPrank();

        vm.prank(alice);
        vault.deposit(10_000e6, alice);
        vm.warp(block.timestamp + 365 days); // alice earns ~500 alone
        vm.prank(bob);
        vault.deposit(10_000e6, bob);

        // alice's shares are now worth more than bob's freshly-minted ones
        uint256 aliceAssets = vault.convertToAssets(vault.balanceOf(alice));
        uint256 bobAssets = vault.convertToAssets(vault.balanceOf(bob));
        assertApproxEqAbs(aliceAssets, 10_500e6, 5);
        assertApproxEqAbs(bobAssets, 10_000e6, 5);
    }
}
