// GET /api/orgs/[wallet]/pools — the org's on-chain payroll pools.
//
// Reads `orgPools(wallet)` from MagmosPayroll and enriches each with its token
// symbol. Magmos is USDC-only, so the deterministic pool is poolIdFor(wallet, USDC).
// Public read — no funds touched, purely reflects chain state.

import { NextResponse, type NextRequest } from 'next/server'
import { isAddress, type Address } from 'viem'
import { getOrgPools, getPool } from '@/lib/reads'
import { poolIdFor, USDC } from '@/lib/magmos'
import { TOKENS } from '@/lib/tokens'

export const runtime = 'nodejs'

type Params = { params: Promise<{ wallet: string }> }

function symbolForToken(token: string): string {
  return token.toLowerCase() === USDC.toLowerCase() ? TOKENS.USDC.symbol : 'UNKNOWN'
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { wallet } = await params
  if (!isAddress(wallet)) {
    return NextResponse.json({ error: 'Invalid wallet' }, { status: 400 })
  }

  try {
    const org = wallet as Address
    const usdcPoolId = poolIdFor(org, USDC)

    // Enumerate on-chain pools; fall back to the deterministic USDC id.
    let poolIds: `0x${string}`[] = []
    try {
      poolIds = await getOrgPools(org)
    } catch {
      poolIds = []
    }
    if (poolIds.length === 0) poolIds = [usdcPoolId]

    const pools = await Promise.all(
      poolIds.map(async (id) => {
        try {
          const p = await getPool(id)
          return {
            onChainPoolId: id,
            orgWallet: wallet.toLowerCase(),
            token: p.exists ? symbolForToken(p.token) : TOKENS.USDC.symbol,
            exists: p.exists,
            totalDeposited: p.totalDeposited.toString(),
            totalClaimed: p.totalClaimed.toString(),
            balance: p.balance.toString(),
          }
        } catch {
          return {
            onChainPoolId: id,
            orgWallet: wallet.toLowerCase(),
            token: TOKENS.USDC.symbol,
            exists: false,
            totalDeposited: '0',
            totalClaimed: '0',
            balance: '0',
          }
        }
      })
    )

    return NextResponse.json(pools)
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? 'chain read failed' },
      { status: 502 }
    )
  }
}
