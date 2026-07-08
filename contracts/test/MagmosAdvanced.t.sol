// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {MagmosRegistry} from "../src/MagmosRegistry.sol";
import {MagmosPayroll} from "../src/MagmosPayroll.sol";
import {MagmosUSDC} from "../src/MagmosUSDC.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

/// Fuzz, full-lifecycle integration, faucet-token, and reentrancy-guard coverage.
contract MagmosAdvancedTest is Test {
    MagmosRegistry registry;
    MagmosPayroll payroll;
    MockERC20 usdc;

    address admin = makeAddr("admin");
    address treasury = makeAddr("treasury");
    address org = makeAddr("org");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    uint256 constant MONTH = 30 days;

    function setUp() public {
        vm.warp(1_700_000_000);
        registry = new MagmosRegistry(admin, treasury);
        payroll = new MagmosPayroll(address(registry));
        usdc = new MockERC20("USD Coin", "USDC", 6);
        usdc.mint(org, 100_000_000e6);
        vm.prank(org);
        usdc.approve(address(payroll), type(uint256).max);
    }

    function _one(address who, uint256 rate, uint256 period)
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

    // ---- Fuzz: claimable always equals the streaming formula ----
    function testFuzz_ClaimableMatchesFormula(uint128 rate, uint64 period, uint32 elapsed) public {
        rate = uint128(bound(rate, 1, 1e30));
        period = uint64(bound(period, 1, 3650 days));
        elapsed = uint32(bound(elapsed, 0, 3650 days));

        (address[] memory e, uint256[] memory r, uint256[] memory p) = _one(alice, rate, period);
        vm.prank(org);
        bytes32 poolId = payroll.createPoolAndDeposit(address(usdc), 0, e, r, p);

        vm.warp(block.timestamp + elapsed);
        uint256 expected = Math.mulDiv(elapsed, rate, period);
        assertEq(payroll.claimableAmount(poolId, alice), expected);
    }

    // ---- Fuzz: a claim never transfers more than was funded, and drains the pool by exactly the claim ----
    function testFuzz_ClaimBoundedByPoolBalance(uint96 monthly, uint32 elapsed, uint96 funded)
        public
    {
        monthly = uint96(bound(monthly, 1e6, 1_000_000e6));
        elapsed = uint32(bound(elapsed, 1 days, 400 days));
        funded = uint96(bound(funded, 1e6, 1_000_000e6));

        (address[] memory e, uint256[] memory r, uint256[] memory p) = _one(alice, monthly, MONTH);
        vm.prank(org);
        bytes32 poolId = payroll.createPoolAndDeposit(address(usdc), funded, e, r, p);

        vm.warp(block.timestamp + elapsed);
        uint256 claimable = payroll.claimableAmount(poolId, alice);
        (,,,, uint256 bal,) = payroll.getPool(poolId);

        if (claimable == 0 || claimable > bal) {
            // either nothing accrued or the pool can't cover it — claim must revert
            vm.prank(alice);
            vm.expectRevert();
            payroll.claim(poolId);
        } else {
            uint256 before = usdc.balanceOf(alice);
            vm.prank(alice);
            uint256 got = payroll.claim(poolId);
            assertEq(got, claimable);
            assertEq(usdc.balanceOf(alice) - before, claimable);
            assertLe(got, funded);
        }
    }

    // ---- Full lifecycle integration ----
    function test_FullLifecycle() public {
        // 2 recipients, fund 50k, stream 3000 & 6000 /mo
        address[] memory e = new address[](2);
        uint256[] memory r = new uint256[](2);
        uint256[] memory p = new uint256[](2);
        e[0] = alice;
        e[1] = bob;
        r[0] = 3000e6;
        r[1] = 6000e6;
        p[0] = MONTH;
        p[1] = MONTH;

        vm.prank(org);
        bytes32 poolId = payroll.createPoolAndDeposit(address(usdc), 50_000e6, e, r, p);

        // 10 days pass
        vm.warp(block.timestamp + 10 days);
        assertEq(payroll.claimableAmount(poolId, alice), 1000e6); // 3000/mo * 10/30
        assertEq(payroll.claimableAmount(poolId, bob), 2000e6);

        // alice claims
        vm.prank(alice);
        assertEq(payroll.claim(poolId), 1000e6);

        // org pauses bob for 5 days
        vm.prank(org);
        payroll.pauseStream(poolId, bob);
        vm.warp(block.timestamp + 5 days);
        assertEq(payroll.claimableAmount(poolId, bob), 2000e6); // frozen
        vm.prank(org);
        payroll.resumeStream(poolId, bob);

        // 10 more days; bob accrues only active time
        vm.warp(block.timestamp + 10 days);
        assertEq(payroll.claimableAmount(poolId, bob), 2000e6 + 2000e6);

        // topup extends runway
        vm.prank(org);
        payroll.topup(poolId, 10_000e6);

        // org stops alice; she can still claim the tail
        vm.prank(org);
        payroll.stopStream(poolId, alice);
        uint256 aliceTail = payroll.claimableAmount(poolId, alice);
        vm.warp(block.timestamp + 30 days);
        assertEq(payroll.claimableAmount(poolId, alice), aliceTail); // no accrual after stop
        vm.prank(alice);
        payroll.claim(poolId);

        (,, uint256 dep, uint256 claimed, uint256 bal,) = payroll.getPool(poolId);
        assertEq(dep, 60_000e6); // 50k + 10k topup
        assertGt(claimed, 0);
        assertGt(bal, 0);
    }

    // ---- Faucet token ----
    function test_FaucetToken() public {
        MagmosUSDC t = new MagmosUSDC();
        assertEq(t.decimals(), 6);
        assertEq(t.symbol(), "USDC");
        vm.prank(alice);
        t.faucet();
        assertEq(t.balanceOf(alice), 10_000e6);
        vm.prank(alice);
        t.faucet();
        assertEq(t.balanceOf(alice), 20_000e6); // repeatable
    }

    // ---- Reentrancy: a malicious pool token cannot re-enter claim ----
    function test_Claim_ReentrancyBlocked() public {
        ReentrantToken evil = new ReentrantToken();
        MagmosPayroll pay2 = new MagmosPayroll(address(registry));
        Attacker attacker = new Attacker(pay2);

        evil.mint(org, 1_000_000e6);
        vm.prank(org);
        evil.approve(address(pay2), type(uint256).max);

        (address[] memory e, uint256[] memory r, uint256[] memory p) =
            _one(address(attacker), 3000e6, MONTH);
        vm.prank(org);
        bytes32 poolId = pay2.createPoolAndDeposit(address(evil), 100_000e6, e, r, p);
        attacker.setPool(poolId);
        evil.setHook(address(attacker));

        vm.warp(block.timestamp + 30 days); // accrue ~3000

        uint256 expected = pay2.claimableAmount(poolId, address(attacker));
        attacker.doClaim();

        // Reentrant claim was blocked → exactly one claim's worth received, no double-drain.
        assertEq(attacker.reentered(), 0, "reentrancy not blocked");
        assertEq(evil.balanceOf(address(attacker)), expected);
    }
}

/// ERC-20 that pokes a hook on the recipient during transfer (to attempt reentrancy).
contract ReentrantToken is ERC20 {
    address public hook;
    bool private _inHook;

    constructor() ERC20("Evil", "EVIL") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 a) external {
        _mint(to, a);
    }

    function setHook(address h) external {
        hook = h;
    }

    function _update(address from, address to, uint256 value) internal override {
        super._update(from, to, value);
        if (to == hook && hook != address(0) && !_inHook) {
            _inHook = true;
            Attacker(hook).onTokens();
            _inHook = false;
        }
    }
}

contract Attacker {
    MagmosPayroll public payroll;
    bytes32 public poolId;
    uint256 public reentered;

    constructor(MagmosPayroll p) {
        payroll = p;
    }

    function setPool(bytes32 id) external {
        poolId = id;
    }

    function doClaim() external {
        payroll.claim(poolId);
    }

    function onTokens() external {
        // Attempt to re-enter claim; nonReentrant must make this revert (caught here).
        try payroll.claim(poolId) {
            reentered++;
        } catch {}
    }
}
