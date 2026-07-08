'use client'

// Chain-first recipient portal: streams, claimable, and vault balances are all read
// directly from Arc (see lib/reads.ts), so the backend is OPTIONAL. The only thing the
// backend can add is a human-readable org name for a pool's org address — and that is
// strictly best-effort (never throws, never blocks the UI).
//
// Was: a wallet-signed (`useSignPersonalMessage`) client for the Sui sweem-server.

import { API_BASE } from './magmos'

interface OrgMeta {
  wallet: string
  name: string
}

// Best-effort org-name lookup for a pool's org address. NEVER throws — if the backend
// is down/unreachable/disabled the portal just falls back to the address.
export async function getOrgName(orgWallet: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/v1/orgs/${orgWallet}`)
    if (!res.ok) return null
    const org = (await res.json()) as OrgMeta
    return org?.name ?? null
  } catch {
    return null
  }
}
