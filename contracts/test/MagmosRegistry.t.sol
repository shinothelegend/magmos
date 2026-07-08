// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {MagmosRegistry} from "../src/MagmosRegistry.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";

contract MagmosRegistryTest is Test {
    MagmosRegistry registry;
    address admin = makeAddr("admin");
    address treasury = makeAddr("treasury");
    address rando = makeAddr("rando");

    function setUp() public {
        registry = new MagmosRegistry(admin, treasury);
    }

    function test_Constructor_SetsTreasuryAndRoles() public view {
        assertEq(registry.treasury(), treasury);
        assertTrue(registry.hasRole(registry.FEE_MANAGER_ROLE(), admin));
        assertTrue(registry.hasRole(registry.PROTOCOL_MANAGER_ROLE(), admin));
        assertEq(registry.depositFeeBps(), 0);
    }

    function test_Constructor_RevertsOnZeroTreasury() public {
        vm.expectRevert(MagmosRegistry.ZeroTreasury.selector);
        new MagmosRegistry(admin, address(0));
    }

    function test_SetFees_WithinLimits() public {
        vm.prank(admin);
        registry.setFees(500, 5000, 5000);
        assertEq(registry.depositFeeBps(), 500);
        assertEq(registry.orgYieldFeeBps(), 5000);
        assertEq(registry.vaultYieldFeeBps(), 5000);
    }

    function test_SetFees_RevertsAboveDepositCeiling() public {
        vm.prank(admin);
        vm.expectRevert(MagmosRegistry.DepositFeeTooHigh.selector);
        registry.setFees(501, 0, 0);
    }

    function test_SetFees_RevertsAboveYieldCeiling() public {
        vm.prank(admin);
        vm.expectRevert(MagmosRegistry.YieldFeeTooHigh.selector);
        registry.setFees(0, 5001, 0);
    }

    function test_SetFees_OnlyFeeManager() public {
        bytes32 feeRole = registry.FEE_MANAGER_ROLE(); // cache before prank
        vm.prank(rando);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, rando, feeRole
            )
        );
        registry.setFees(100, 0, 0);
    }

    function test_SetTreasury_RevertsOnZero() public {
        vm.prank(admin);
        vm.expectRevert(MagmosRegistry.ZeroTreasury.selector);
        registry.setTreasury(address(0));
    }

    function test_Protocol_AddEnableDisable() public {
        vm.startPrank(admin);
        registry.addProtocol("USYC", makeAddr("usycAdapter"), registry.YIELD_TYPE_STABLE());
        assertTrue(registry.isApproved("USYC"));

        registry.disableProtocol("USYC");
        assertFalse(registry.isApproved("USYC"));

        registry.enableProtocol("USYC");
        assertTrue(registry.isApproved("USYC"));
        vm.stopPrank();
    }

    function test_Protocol_RevertsOnDuplicate() public {
        vm.startPrank(admin);
        registry.addProtocol("USYC", makeAddr("a"), 1);
        vm.expectRevert(MagmosRegistry.ProtocolAlreadyExists.selector);
        registry.addProtocol("USYC", makeAddr("b"), 1);
        vm.stopPrank();
    }

    function test_Protocol_RevertsOnInvalidYieldType() public {
        vm.prank(admin);
        vm.expectRevert(MagmosRegistry.InvalidYieldType.selector);
        registry.addProtocol("X", makeAddr("a"), 3);
    }

    function test_ProtocolsByType_Filters() public {
        vm.startPrank(admin);
        registry.addProtocol("USYC", makeAddr("a"), registry.YIELD_TYPE_STABLE());
        registry.addProtocol("SomeLST", makeAddr("b"), registry.YIELD_TYPE_LST());
        registry.addProtocol("USYC2", makeAddr("c"), registry.YIELD_TYPE_STABLE());
        vm.stopPrank();

        string[] memory stables = registry.protocolsByType(registry.YIELD_TYPE_STABLE());
        assertEq(stables.length, 2);
        string[] memory lsts = registry.protocolsByType(registry.YIELD_TYPE_LST());
        assertEq(lsts.length, 1);
    }

    function test_IsApproved_FalseForUnknown() public view {
        assertFalse(registry.isApproved("nope"));
    }
}
