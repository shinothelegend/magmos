// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {MagmosRegistry} from "../src/MagmosRegistry.sol";
import {MagmosPayroll} from "../src/MagmosPayroll.sol";
import {MagmosVault} from "../src/MagmosVault.sol";

/// @notice Deploys the Magmos core to Arc. Reads DEPLOYER_PRIVATE_KEY (and optional TREASURY)
///         from the environment; treasury defaults to the deployer. Fees start at 0 — set later
///         via registry.setFees. Writes addresses to deployments/arc-testnet.json.
///
/// Usage (after funding the deployer with native USDC for gas):
///   export $(grep -v '^#' .env.deployer | xargs)
///   forge script script/Deploy.s.sol:Deploy --rpc-url arc_testnet --broadcast -vvv
contract Deploy is Script {
    // Arc testnet reference (informational; written into the deployment file).
    address constant ARC_USDC = 0x3600000000000000000000000000000000000000;

    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(pk);
        address treasury = vm.envOr("TREASURY", deployer);

        vm.startBroadcast(pk);
        MagmosRegistry registry = new MagmosRegistry(deployer, treasury);
        MagmosPayroll payroll = new MagmosPayroll(address(registry));
        MagmosVault vault = new MagmosVault();
        vm.stopBroadcast();

        console2.log("== Magmos deployed on chain", block.chainid, "==");
        console2.log("MagmosRegistry:", address(registry));
        console2.log("MagmosPayroll :", address(payroll));
        console2.log("MagmosVault   :", address(vault));
        console2.log("treasury      :", treasury);
        console2.log("deployer      :", deployer);

        string memory obj = "magmos";
        vm.serializeUint(obj, "chainId", block.chainid);
        vm.serializeAddress(obj, "MagmosRegistry", address(registry));
        vm.serializeAddress(obj, "MagmosPayroll", address(payroll));
        vm.serializeAddress(obj, "MagmosVault", address(vault));
        vm.serializeAddress(obj, "treasury", treasury);
        vm.serializeAddress(obj, "deployer", deployer);
        string memory json = vm.serializeAddress(obj, "USDC", ARC_USDC);
        vm.writeJson(json, "./deployments/arc-testnet.json");
        console2.log("wrote deployments/arc-testnet.json");
    }
}
