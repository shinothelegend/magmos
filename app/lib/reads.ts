// viem read helpers against Arc. Replaces the Sui `readPoolSummary`/`readClaimable`/
// `findMyStreamPools`/etc. The deployed contracts expose enumerable indexes so the whole
// dashboard can be built chain-first (no indexer): orgPools → getPool → employeesOf →
// getStream/claimableAmount.

import { createPublicClient, http, erc20Abi, type Address } from 'viem'
import { arcTestnet } from './wagmi'
import { MAGMOS_PAYROLL, MAGMOS_VAULT, PAYROLL_ABI, VAULT_ABI, ARC_RPC_URL, USDC } from './magmos'

export const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(ARC_RPC_URL),
})

export interface PoolSummary {
  org: Address
  token: Address
  totalDeposited: bigint
  totalClaimed: bigint
  balance: bigint
  exists: boolean
}

export interface StreamView {
  rateAmount: bigint
  ratePeriod: bigint
  pendingBalance: bigint
  startedAt: bigint
  claimedAt: bigint
  totalPausedSecs: bigint
  pausedAt: bigint
  stoppedAt: bigint
  exists: boolean
}

async function readPayroll<T>(functionName: string, args: readonly unknown[]): Promise<T> {
  return (await publicClient.readContract({
    address: MAGMOS_PAYROLL,
    abi: PAYROLL_ABI,
    functionName,
    args,
  })) as T
}

// ---- Payroll reads ----
export async function getPool(poolId: `0x${string}`): Promise<PoolSummary> {
  const r = await readPayroll<[Address, Address, bigint, bigint, bigint, boolean]>('getPool', [
    poolId,
  ])
  return {
    org: r[0],
    token: r[1],
    totalDeposited: r[2],
    totalClaimed: r[3],
    balance: r[4],
    exists: r[5],
  }
}

export const getOrgPools = (org: Address) => readPayroll<`0x${string}`[]>('orgPools', [org])
export const getEmployeePools = (emp: Address) =>
  readPayroll<`0x${string}`[]>('employeePools', [emp])
export const getEmployees = (poolId: `0x${string}`) =>
  readPayroll<Address[]>('employeesOf', [poolId])
export const getClaimable = (poolId: `0x${string}`, emp: Address) =>
  readPayroll<bigint>('claimableAmount', [poolId, emp])
export const hasStream = (poolId: `0x${string}`, emp: Address) =>
  readPayroll<boolean>('hasStream', [poolId, emp])
export const getStream = (poolId: `0x${string}`, emp: Address) =>
  readPayroll<StreamView>('getStream', [poolId, emp])

// ---- ERC-20 USDC ----
export async function getUsdcBalance(owner: Address): Promise<bigint> {
  return (await publicClient.readContract({
    address: USDC,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [owner],
  })) as bigint
}

export async function getUsdcAllowance(owner: Address, spender: Address): Promise<bigint> {
  return (await publicClient.readContract({
    address: USDC,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [owner, spender],
  })) as bigint
}

// ---- Vault reads ----
export async function getOwnerVaults(owner: Address): Promise<bigint[]> {
  return (await publicClient.readContract({
    address: MAGMOS_VAULT,
    abi: VAULT_ABI,
    functionName: 'ownerVaults',
    args: [owner],
  })) as bigint[]
}

export async function getVaultBalance(vaultId: bigint, token: Address): Promise<bigint> {
  return (await publicClient.readContract({
    address: MAGMOS_VAULT,
    abi: VAULT_ABI,
    functionName: 'balanceOf',
    args: [vaultId, token],
  })) as bigint
}
