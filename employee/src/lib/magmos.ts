// Magmos on HashKey Chain — chain constants, deployed addresses, token config, and ABIs.
// Single source of truth for the chain layer (replaces the Sui-era lib/sweem.ts).

import type { Abi } from 'viem'
import { encodeAbiParameters, keccak256 } from 'viem'
import payrollAbi from './abi/MagmosPayroll.json'
import registryAbi from './abi/MagmosRegistry.json'
import vaultAbi from './abi/MagmosVault.json'

export const NETWORK = 'hashkey-testnet' as const

// ----- HashKey testnet chain -----
export const HASHKEY_CHAIN_ID = 133
export const HASHKEY_RPC_URL = process.env.NEXT_PUBLIC_HASHKEY_RPC || 'https://hashkey-chain-testnet.rpc.thirdweb.com'
export const HASHKEY_WS_URL = 'wss://hashkey-chain-testnet.rpc.thirdweb.com' // thirdweb ws fallback
export const HASHKEY_EXPLORER = 'https://testnet-explorer.hsk.xyz'
export const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11' as const

// ----- Deployed Magmos core (HashKey testnet) -----
export const MAGMOS_PAYROLL = (process.env.NEXT_PUBLIC_MAGMOS_PAYROLL || "0x5F7e31d28011b14faA202D96534979E5b068287c") as Address
export const MAGMOS_REGISTRY = (process.env.NEXT_PUBLIC_MAGMOS_REGISTRY || "0x490f92844481aB42EA00f8896672E8ca007c780a") as Address
export const MAGMOS_VAULT = (process.env.NEXT_PUBLIC_MAGMOS_VAULT || "0xAE97B9Ba6AAAB15FFbd76d636d52d8D93A8858F0") as Address
export const MAGMOS_YIELD_VAULT = (process.env.NEXT_PUBLIC_MAGMOS_YIELD_VAULT || "0xa21DceeaD63d7CD13f09d03ff2541ca84a4572D2") as Address
export const FAUCET_TOKEN = (process.env.NEXT_PUBLIC_FAUCET_TOKEN || "0x820017987FcaA1d4125397190830B8552F8A0f34") as Address

export const PAYROLL_ABI = payrollAbi as Abi
export const REGISTRY_ABI = registryAbi as Abi
export const VAULT_ABI = vaultAbi as Abi

// ----- HashKey testnet tokens -----
export const USDC = (process.env.NEXT_PUBLIC_USDC ||
  '0x0000000000000000000000000000000000000000') as `0x${string}`
export const USDC_DECIMALS = 6
export const USYC = '0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C' as `0x${string}`
export const EURC = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a' as `0x${string}`

// ----- Circle CCTP v2 on HashKey (domain 26 stub) — recipient "send home" bridge (Phase 3) -----
export const ARC_CCTP_DOMAIN = 26
export const CCTP_TOKEN_MESSENGER = '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA' as `0x${string}`
export const CCTP_MESSAGE_TRANSMITTER =
  '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275' as `0x${string}`

// Pool role bits (mirror MagmosPayroll.PAUSER_ROLE)
export const PAUSER_ROLE = 1

// Rate-period presets in SECONDS (Arc uses block.timestamp; Sweem used ms).
export const WEEK_S = 604_800
export const MONTH_S = 2_592_000 // 30 days — default stream rate period

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ''

export const EXPLORER_TX = (hash: string) => `${HASHKEY_EXPLORER}/tx/${hash}`
export const EXPLORER_ADDR = (addr: string) => `${HASHKEY_EXPLORER}/address/${addr}`

// poolId = keccak256(abi.encode(org, token)) — must match MagmosPayroll.poolIdFor.
export function poolIdFor(org: `0x${string}`, token: `0x${string}`): `0x${string}` {
  return keccak256(
    encodeAbiParameters([{ type: 'address' }, { type: 'address' }], [org, token])
  )
}

// Min claim (raw) the contract enforces: 10% of one week's pay at the stream rate.
export function minClaimRaw(rateRaw: bigint, periodS: bigint): bigint {
  if (periodS === 0n) return 0n
  return (BigInt(WEEK_S) * rateRaw) / (periodS * 10n)
}
