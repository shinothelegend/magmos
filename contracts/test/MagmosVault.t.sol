// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {MagmosVault} from "../src/MagmosVault.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract MagmosVaultTest is Test {
    MagmosVault vault;
    MockERC20 usdc;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        vault = new MagmosVault();
        usdc = new MockERC20("USD Coin", "USDC", 6);
        usdc.mint(alice, 1000e6);
        vm.prank(alice);
        usdc.approve(address(vault), type(uint256).max);
    }

    function test_CreateVault_AssignsOwnerAndId() public {
        vm.prank(alice);
        uint256 id = vault.createVault("Savings");
        assertEq(id, 1);
        assertEq(vault.vaultOwner(id), alice);
        assertEq(vault.vaultName(id), "Savings");
        assertEq(vault.ownerVaults(alice).length, 1);
    }

    function test_DepositWithdraw_Roundtrip() public {
        vm.startPrank(alice);
        uint256 id = vault.createVault("Savings");
        vault.deposit(id, address(usdc), 400e6);
        assertEq(vault.balanceOf(id, address(usdc)), 400e6);
        assertEq(usdc.balanceOf(address(vault)), 400e6);

        vault.withdraw(id, address(usdc), 150e6);
        assertEq(vault.balanceOf(id, address(usdc)), 250e6);
        assertEq(usdc.balanceOf(alice), 1000e6 - 250e6);
        vm.stopPrank();
    }

    function test_Deposit_OnlyOwner() public {
        vm.prank(alice);
        uint256 id = vault.createVault("Savings");
        vm.prank(bob);
        vm.expectRevert(MagmosVault.NotVaultOwner.selector);
        vault.deposit(id, address(usdc), 1e6);
    }

    function test_Withdraw_OnlyOwner() public {
        vm.startPrank(alice);
        uint256 id = vault.createVault("Savings");
        vault.deposit(id, address(usdc), 100e6);
        vm.stopPrank();
        vm.prank(bob);
        vm.expectRevert(MagmosVault.NotVaultOwner.selector);
        vault.withdraw(id, address(usdc), 1e6);
    }

    function test_Withdraw_RevertsOnInsufficient() public {
        vm.startPrank(alice);
        uint256 id = vault.createVault("Savings");
        vault.deposit(id, address(usdc), 100e6);
        vm.expectRevert(MagmosVault.InsufficientVaultBalance.selector);
        vault.withdraw(id, address(usdc), 101e6);
        vm.stopPrank();
    }

    function test_Deposit_RevertsOnZeroAmount() public {
        vm.startPrank(alice);
        uint256 id = vault.createVault("Savings");
        vm.expectRevert(MagmosVault.ZeroAmount.selector);
        vault.deposit(id, address(usdc), 0);
        vm.stopPrank();
    }
}
