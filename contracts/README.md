# Magmos Contracts (Arc / Solidity)

Streaming payroll + cross-border remittance core for Arc. Solidity port of Sweem's Move
contracts (`sweem_core::stream_pool`, `sweem_core::employee_vault`, `sweem_registry::registry`).

## Contracts

| Contract | Purpose | Ported from |
|---|---|---|
| `MagmosRegistry` | Fee schedule, treasury, yield-protocol allowlist (AccessControl) | `registry.move` |
| `MagmosPayroll` | Per-second streaming pools: create / fund / claim / pause / resume / stop | `stream_pool.move` |
| `MagmosVault` | Recipient-owned multi-token savings vaults | `employee_vault.move` |

### Key translations Move → Solidity
- **Time in seconds** (`block.timestamp`), not milliseconds. Rate = `rateAmount` per `ratePeriod` seconds.
- **ERC-20 custody** via `SafeERC20` (Arc USDC, 6 decimals) instead of `Balance<T>`.
- **One `StreamPool<T>` object → one `_pools[poolId]`**, `poolId = keccak256(abi.encode(org, token))`.
- **`Table<address,Stream>` → mapping** plus enumerable `employeesOf` / `orgPools` / `employeePools`
  indexes, so the frontend reads all streams without an off-chain indexer.
- Streaming math, crystallize-on-rate-change, min-claim floor (10% of a week's pay), and the
  deposit-fee split are preserved exactly. `nonReentrant` + checks-effects-interactions on claims.

### MagmosPayroll surface (frontend wiring reference)
```
createPool(token) -> poolId
createPoolAndDeposit(token, amount, employees[], rateAmounts[], ratePeriods[]) -> poolId
deposit(poolId, amount, employees[], rateAmounts[], ratePeriods[])   // org; approve USDC first
topup(poolId, amount)                                                // org
claim(poolId) -> amount                                              // recipient
pauseStream(poolId, employee) / resumeStream(...) / stopStream(...)
grantPoolRole(poolId, account, role) / revokePoolRole(...)           // role: PAUSER_ROLE = 0x01
// views
claimableAmount(poolId, employee)  getPool(poolId)  getStream(poolId, employee)
employeesOf(poolId)  orgPools(org)  employeePools(employee)  hasStream(poolId, employee)
```

## Develop

```bash
forge build
forge test            # 36 tests: streaming math, pause/resume, min-claim, fees, access control
forge test --gas-report
forge fmt
```

## Deploy (HashKey testnet)

Fund the deployer with native USDC for gas first: https://faucet.circle.com (select HashKey testnet).

```bash
export $(grep -v '^#' .env.deployer | xargs)
forge script script/Deploy.s.sol:Deploy --rpc-url arc_testnet --broadcast -vvv
# addresses written to deployments/arc-testnet.json
```

Post-deploy (optional): `registry.setFees(depositBps, orgYieldBps, vaultYieldBps)` — starts at 0.

## HashKey testnet reference
Chain `5042002` · RPC `https://rpc.testnet.arc.network` · explorer `https://testnet.arcscan.app`
USDC (6dp) `0x3600000000000000000000000000000000000000` · USYC `0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C`
CCTP TokenMessengerV2 `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA` (domain 26)
