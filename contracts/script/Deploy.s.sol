// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {MagmosRegistry} from "../src/MagmosRegistry.sol";
import {MagmosPayroll} from "../src/MagmosPayroll.sol";
import {MagmosVault} from "../src/MagmosVault.sol";
import {MagmosUSDC} from "../src/MagmosUSDC.sol";
import {MagmosYieldVault} from "../src/MagmosYieldVault.sol";

/// @notice Deploys the Magmos core to HashKey Testnet. Reads DEPLOYER_PRIVATE_KEY (and optional TREASURY)
///         from the environment; treasury defaults to the deployer. Fees start at 0 — set later
///         via registry.setFees. Writes addresses to deployments/hashkey-testnet.json.
///
/// Usage (after funding the deployer with native HSK for gas):
///   export $(grep -v '^#' .env.deployer | xargs)
///   forge script script/Deploy.s.sol:Deploy --rpc-url hashkey_testnet --broadcast -vvv
contract Deploy is Script {

    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(pk);
        address treasury = vm.envOr("TREASURY", deployer);

        vm.startBroadcast(pk);
        MagmosRegistry registry = new MagmosRegistry(deployer, treasury);
        MagmosPayroll payroll = new MagmosPayroll(address(registry));
        MagmosVault vault = new MagmosVault();
        MagmosUSDC usdc = new MagmosUSDC();
        // APY set to 500 bps (5%)
        MagmosYieldVault yieldVault = new MagmosYieldVault(usdc, 500, deployer);
        vm.stopBroadcast();

        console2.log("== Magmos deployed on chain", block.chainid, "==");
        console2.log("MagmosRegistry:", address(registry));
        console2.log("MagmosPayroll :", address(payroll));
        console2.log("MagmosVault   :", address(vault));
        console2.log("MagmosUSDC    :", address(usdc));
        console2.log("MagmosYield   :", address(yieldVault));
        console2.log("treasury      :", treasury);
        console2.log("deployer      :", deployer);

        string memory obj = "magmos";
        vm.serializeUint(obj, "chainId", block.chainid);
        vm.serializeAddress(obj, "MagmosRegistry", address(registry));
        vm.serializeAddress(obj, "MagmosPayroll", address(payroll));
        vm.serializeAddress(obj, "MagmosVault", address(vault));
        vm.serializeAddress(obj, "MagmosYieldVault", address(yieldVault));
        vm.serializeAddress(obj, "MagmosUSDC", address(usdc));
        vm.serializeAddress(obj, "treasury", treasury);
        vm.serializeAddress(obj, "deployer", deployer);
        string memory json = vm.serializeAddress(obj, "USDC", address(usdc));
        vm.writeJson(json, "./deployments/hashkey-testnet.json");
        console2.log("wrote deployments/hashkey-testnet.json");
    }
}
