// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {MagmosRegistry} from "../src/MagmosRegistry.sol";
import {MagmosPayroll} from "../src/MagmosPayroll.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract MagmosPayrollTest is Test {
    MagmosRegistry registry;
    MagmosPayroll payroll;
    MockERC20 usdc;

    address admin = makeAddr("admin");
    address treasury = makeAddr("treasury");
    address org = makeAddr("org");
    address alice = makeAddr("alice"); // recipient
    address bob = makeAddr("bob"); // recipient
    address pauser = makeAddr("pauser");

    uint256 constant RATE = 3000e6; // 3,000 USDC ...
    uint256 constant PERIOD = 30 days; // ... per 30 days  => 100 USDC / day
    uint256 constant DAY = 1 days;
    uint256 constant PER_DAY = 100e6; // derived: RATE * DAY / PERIOD

    function setUp() public {
        vm.warp(1_700_000_000); // realistic base timestamp
        registry = new MagmosRegistry(admin, treasury);
        payroll = new MagmosPayroll(address(registry));
        usdc = new MockERC20("USD Coin", "USDC", 6);
        usdc.mint(org, 1_000_000e6);
        vm.prank(org);
        usdc.approve(address(payroll), type(uint256).max);
    }

    // ---- helpers ----------------------------------------------------------

    function _oneEmployee(address who, uint256 rate, uint256 period)
        internal
        pure
        returns (address[] memory e, uint256[] memory r, uint256[] memory p)
    {
        e = new address[](1);
        r = new uint256[](1);
        p = new uint256[](1);
        e[0] = who;
        r[0] = rate;
        p[0] = period;
    }

    function _createAndFund(uint256 amount, address who, uint256 rate, uint256 period)
        internal
        returns (bytes32 poolId)
    {
        (address[] memory e, uint256[] memory r, uint256[] memory p) =
            _oneEmployee(who, rate, period);
        vm.prank(org);
        poolId = payroll.createPoolAndDeposit(address(usdc), amount, e, r, p);
    }

    // ---- pool lifecycle ---------------------------------------------------

    function test_CreatePool_SetsOrgAndToken() public {
        vm.prank(org);
        bytes32 poolId = payroll.createPool(address(usdc));
        (address o, address t,,,, bool exists) = payroll.getPool(poolId);
        assertEq(o, org);
        assertEq(t, address(usdc));
        assertTrue(exists);
        assertEq(poolId, payroll.poolIdFor(org, address(usdc)));
    }

    function test_CreatePool_RevertsOnDuplicate() public {
        vm.startPrank(org);
        payroll.createPool(address(usdc));
        vm.expectRevert(MagmosPayroll.PoolAlreadyExists.selector);
        payroll.createPool(address(usdc));
        vm.stopPrank();
    }

    function test_Deposit_MovesFundsAndCreatesStream() public {
        bytes32 poolId = _createAndFund(3000e6, alice, RATE, PERIOD);
        (,, uint256 dep,, uint256 bal,) = payroll.getPool(poolId);
        assertEq(dep, 3000e6);
        assertEq(bal, 3000e6);
        assertEq(usdc.balanceOf(address(payroll)), 3000e6);
        assertTrue(payroll.hasStream(poolId, alice));
        assertEq(payroll.employeeCount(poolId), 1);
        // discovery indexes
        assertEq(payroll.orgPools(org).length, 1);
        assertEq(payroll.employeePools(alice).length, 1);
    }

    function test_Deposit_RevertsIfNotOrg() public {
        vm.prank(org);
        bytes32 poolId = payroll.createPool(address(usdc));
        (address[] memory e, uint256[] memory r, uint256[] memory p) =
            _oneEmployee(alice, RATE, PERIOD);
        vm.prank(alice);
        vm.expectRevert(MagmosPayroll.NotOrg.selector);
        payroll.deposit(poolId, 100e6, e, r, p);
    }

    function test_Deposit_RevertsOnArrayMismatch() public {
        vm.prank(org);
        bytes32 poolId = payroll.createPool(address(usdc));
        address[] memory e = new address[](2);
        uint256[] memory r = new uint256[](1);
        uint256[] memory p = new uint256[](1);
        vm.prank(org);
        vm.expectRevert(MagmosPayroll.ArrayMismatch.selector);
        payroll.deposit(poolId, 0, e, r, p);
    }

    // ---- streaming math ---------------------------------------------------

    function test_Claimable_AccruesLinearly() public {
        bytes32 poolId = _createAndFund(3000e6, alice, RATE, PERIOD);
        assertEq(payroll.claimableAmount(poolId, alice), 0);
        vm.warp(block.timestamp + DAY);
        assertEq(payroll.claimableAmount(poolId, alice), PER_DAY);
        vm.warp(block.timestamp + DAY);
        assertEq(payroll.claimableAmount(poolId, alice), 2 * PER_DAY);
    }

    function test_Claim_TransfersAndResets() public {
        bytes32 poolId = _createAndFund(3000e6, alice, RATE, PERIOD);
        vm.warp(block.timestamp + DAY);
        vm.prank(alice);
        uint256 got = payroll.claim(poolId);
        assertEq(got, PER_DAY);
        assertEq(usdc.balanceOf(alice), PER_DAY);
        (,,, uint256 claimed, uint256 bal,) = payroll.getPool(poolId);
        assertEq(claimed, PER_DAY);
        assertEq(bal, 3000e6 - PER_DAY);
        assertEq(payroll.claimableAmount(poolId, alice), 0);
    }

    function test_Claim_RevertsBelowMinClaim() public {
        bytes32 poolId = _createAndFund(3000e6, alice, RATE, PERIOD);
        vm.warp(block.timestamp + 5); // ~5,785 raw < 0.01 USDC (10,000 raw) min-claim floor
        vm.prank(alice);
        vm.expectRevert(MagmosPayroll.BelowMinClaim.selector);
        payroll.claim(poolId);
    }

    function test_ReDeposit_RehiresStoppedStream() public {
        bytes32 poolId = _createAndFund(10_000e6, alice, RATE, PERIOD);
        vm.warp(block.timestamp + DAY); // 100 USDC accrued
        vm.prank(org);
        payroll.stopStream(poolId, alice);
        assertEq(payroll.claimableAmount(poolId, alice), PER_DAY);

        // Re-hire: org re-deposits for the stopped employee at a new (2x) rate.
        (address[] memory e, uint256[] memory r, uint256[] memory p) =
            _oneEmployee(alice, 2 * RATE, PERIOD);
        vm.prank(org);
        payroll.deposit(poolId, 10_000e6, e, r, p);

        // Old earnings preserved as pending; new rate streams from now (no stranding, no backpay).
        assertEq(payroll.claimableAmount(poolId, alice), PER_DAY);
        vm.warp(block.timestamp + DAY); // +1 day at 2x = 200
        assertEq(payroll.claimableAmount(poolId, alice), PER_DAY + 2 * PER_DAY);
    }

    function test_Claim_RevertsIfNothingClaimable() public {
        bytes32 poolId = _createAndFund(3000e6, alice, RATE, PERIOD);
        vm.prank(alice);
        vm.expectRevert(MagmosPayroll.ZeroClaimable.selector);
        payroll.claim(poolId);
    }

    function test_Claim_RevertsIfInsufficientPoolBalance() public {
        // fund only 50 USDC but accrue 100 USDC of claim
        bytes32 poolId = _createAndFund(50e6, alice, RATE, PERIOD);
        vm.warp(block.timestamp + DAY);
        vm.prank(alice);
        vm.expectRevert(MagmosPayroll.InsufficientPoolBalance.selector);
        payroll.claim(poolId);
    }

    function test_Claim_RevertsForNonEmployee() public {
        bytes32 poolId = _createAndFund(3000e6, alice, RATE, PERIOD);
        vm.warp(block.timestamp + DAY);
        vm.prank(bob);
        vm.expectRevert(MagmosPayroll.StreamNotFound.selector);
        payroll.claim(poolId);
    }

    // ---- pause / resume / stop -------------------------------------------

    function test_PauseResume_ExcludesPausedTime() public {
        bytes32 poolId = _createAndFund(3000e6, alice, RATE, PERIOD);
        vm.warp(block.timestamp + DAY); // +1 active day
        vm.prank(org);
        payroll.pauseStream(poolId, alice);
        // claimable frozen while paused
        assertEq(payroll.claimableAmount(poolId, alice), PER_DAY);
        vm.warp(block.timestamp + DAY); // paused day - no accrual
        assertEq(payroll.claimableAmount(poolId, alice), PER_DAY);
        vm.prank(org);
        payroll.resumeStream(poolId, alice);
        vm.warp(block.timestamp + DAY); // +1 active day
        assertEq(payroll.claimableAmount(poolId, alice), 2 * PER_DAY);
    }

    function test_Pause_OnlyPauserOrOrg() public {
        uint8 role = payroll.PAUSER_ROLE(); // cache before prank (arg-eval would consume it)
        bytes32 poolId = _createAndFund(3000e6, alice, RATE, PERIOD);
        vm.prank(bob);
        vm.expectRevert(MagmosPayroll.NotAuthorized.selector);
        payroll.pauseStream(poolId, alice);

        // grant pauser role to `pauser`, then it works
        vm.prank(org);
        payroll.grantPoolRole(poolId, pauser, role);
        vm.prank(pauser);
        payroll.pauseStream(poolId, alice);
        assertEq(payroll.claimableAmount(poolId, alice), 0);
    }

    function test_Stop_FreezesAccrualButKeepsClaim() public {
        bytes32 poolId = _createAndFund(3000e6, alice, RATE, PERIOD);
        vm.warp(block.timestamp + DAY);
        vm.prank(org);
        payroll.stopStream(poolId, alice);
        uint256 owed = payroll.claimableAmount(poolId, alice);
        assertEq(owed, PER_DAY);
        vm.warp(block.timestamp + 10 * DAY); // no further accrual after stop
        assertEq(payroll.claimableAmount(poolId, alice), owed);
        // stopped recipient can still claim earned pay
        vm.prank(alice);
        assertEq(payroll.claim(poolId), owed);
    }

    function test_Stop_OnlyOrg() public {
        bytes32 poolId = _createAndFund(3000e6, alice, RATE, PERIOD);
        vm.prank(pauser);
        vm.expectRevert(MagmosPayroll.NotOrg.selector);
        payroll.stopStream(poolId, alice);
    }

    // ---- rate-change crystallization -------------------------------------

    function test_RateChange_CrystallizesOldEarnings() public {
        bytes32 poolId = _createAndFund(3000e6, alice, RATE, PERIOD);
        vm.warp(block.timestamp + DAY); // 100 USDC accrued at 3000/mo

        // org re-deposits with DOUBLE rate; old 100 USDC must be preserved
        (address[] memory e, uint256[] memory r, uint256[] memory p) =
            _oneEmployee(alice, 2 * RATE, PERIOD);
        vm.prank(org);
        payroll.deposit(poolId, 3000e6, e, r, p);

        // immediately after: exactly the crystallized 100 USDC, nothing more
        assertEq(payroll.claimableAmount(poolId, alice), PER_DAY);

        vm.warp(block.timestamp + DAY); // +1 day at 6000/mo = 200 USDC
        assertEq(payroll.claimableAmount(poolId, alice), PER_DAY + 2 * PER_DAY);

        // min-claim is bypassed because crystallized pending exists
        vm.prank(alice);
        assertEq(payroll.claim(poolId), 3 * PER_DAY);
    }

    // ---- fees -------------------------------------------------------------

    function test_DepositFee_RoutedToTreasury() public {
        vm.prank(admin);
        registry.setFees(100, 0, 0); // 1% deposit fee
        bytes32 poolId = _createAndFund(1000e6, alice, RATE, PERIOD);
        assertEq(usdc.balanceOf(treasury), 10e6); // 1% of 1000
        (,, uint256 dep,, uint256 bal,) = payroll.getPool(poolId);
        assertEq(dep, 990e6);
        assertEq(bal, 990e6);
    }

    // ---- multi-recipient --------------------------------------------------

    function test_MultiRecipient_IndependentStreams() public {
        address[] memory e = new address[](2);
        uint256[] memory r = new uint256[](2);
        uint256[] memory p = new uint256[](2);
        e[0] = alice;
        e[1] = bob;
        r[0] = RATE;
        r[1] = 2 * RATE;
        p[0] = PERIOD;
        p[1] = PERIOD;
        vm.prank(org);
        bytes32 poolId = payroll.createPoolAndDeposit(address(usdc), 10_000e6, e, r, p);
        vm.warp(block.timestamp + DAY);
        assertEq(payroll.claimableAmount(poolId, alice), PER_DAY);
        assertEq(payroll.claimableAmount(poolId, bob), 2 * PER_DAY);
        assertEq(payroll.employeeCount(poolId), 2);
    }
}
