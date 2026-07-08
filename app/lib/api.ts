'use client'

// Client for the Magmos metadata API (same-origin Next.js route handlers under
// /api/*). Writes are authenticated with an EIP-191 personal_sign over
//   `magmos-auth:<address>:<unixMs>`
// sent as headers x-magmos-address / x-magmos-message / x-magmos-signature
// (see lib/auth.ts). Org identity = the connected wallet address.
//
// One signature authorizes a short burst of requests (5-min window), so bulk
// operations reuse a single wallet popup.

import { useAccount, useSignMessage } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { authMessageFor } from './auth'

// Empty base = same-origin. (Kept as a constant so callers read cleanly.)
const API_BASE = ''

export interface Org {
  wallet: string
  name: string
  email?: string | null
  createdAt?: string
}

export interface Group {
  id: string
  orgWallet: string
  name: string
}

// Employee metadata mirror of the on-chain roster.
export interface Employee {
  orgWallet: string
  walletAddress: string
  name: string
  email?: string | null
  monthlyUsdc: number
  group?: string | null
}

export interface Pool {
  onChainPoolId: string
  orgWallet: string
  token: string
  exists: boolean
  totalDeposited: string
  totalClaimed: string
  balance: string
}

export interface AddEmployeeInput {
  walletAddress: string
  name: string
  email?: string | null
  monthlyUsdc: number
  group?: string | null
}

export interface BulkResult {
  created: number
  updated: number
  skipped: { walletAddress: string; reason: string }[]
}

export function useSweemApi() {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const wallet = address?.toLowerCase()

  type AuthCreds = { message: string; signature: string; address: string }

  // Sign one auth message (a single wallet popup). Reusable within the 5-min window.
  async function signAuth(): Promise<AuthCreds> {
    if (!address) throw new Error('Connect a wallet first')
    const message = authMessageFor(address, Date.now())
    const signature = await signMessageAsync({ message })
    return { message, signature, address }
  }

  async function sendAuthed(
    creds: AuthCreds,
    path: string,
    method: string,
    body?: unknown
  ) {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-magmos-address': creds.address,
        'x-magmos-message': creds.message,
        'x-magmos-signature': creds.signature,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    if (!res.ok && res.status !== 409) {
      throw new Error(`${method} ${path} → ${res.status}: ${await res.text()}`)
    }
    return {
      status: res.status,
      data: res.status === 204 ? null : await res.json().catch(() => null),
    }
  }

  async function authedFetch(path: string, method: string, body?: unknown) {
    return sendAuthed(await signAuth(), path, method, body)
  }

  async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`)
    if (!res.ok) throw new Error(`GET ${path} → ${res.status}`)
    return res.json() as Promise<T>
  }

  // ----- reads (react-query) -----
  const orgQuery = useQuery<Org | null>({
    queryKey: ['org', wallet],
    enabled: !!wallet,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/orgs/${wallet}`)
      if (res.status === 404) return null
      if (!res.ok) throw new Error(`GET /api/orgs/${wallet} → ${res.status}`)
      return res.json() as Promise<Org>
    },
  })

  const hasOrg = !!orgQuery.data

  const groupsQuery = useQuery<Group[]>({
    queryKey: ['groups', wallet],
    enabled: !!wallet && hasOrg,
    queryFn: () => get<Group[]>(`/api/orgs/${wallet}/groups`),
  })

  const employeesQuery = useQuery<Employee[]>({
    queryKey: ['employees', wallet],
    enabled: !!wallet && hasOrg,
    queryFn: () => get<Employee[]>(`/api/orgs/${wallet}/employees`),
  })

  return {
    address: wallet,

    // queries
    orgQuery,
    groupsQuery,
    employeesQuery,

    // ----- org -----
    // Idempotent create/ensure. POST /api/orgs/[wallet].
    ensureOrg: (name: string, email?: string) =>
      authedFetch(`/api/orgs/${wallet}`, 'POST', { name, ...(email ? { email } : {}) }),

    getOrg: (w: string) => get<Org | null>(`/api/orgs/${w.toLowerCase()}`),

    // ----- groups -----
    createGroup: (w: string, name: string) =>
      authedFetch(`/api/orgs/${w.toLowerCase()}/groups`, 'POST', { name }),

    listGroups: (w: string) => get<Group[]>(`/api/orgs/${w.toLowerCase()}/groups`),

    // ----- employees -----
    addEmployee: (w: string, input: AddEmployeeInput) =>
      authedFetch(`/api/orgs/${w.toLowerCase()}/employees`, 'POST', input),

    listEmployees: (w: string) => get<Employee[]>(`/api/orgs/${w.toLowerCase()}/employees`),

    // Add many recipients with a SINGLE wallet signature.
    bulkAddEmployees: async (
      w: string,
      employees: AddEmployeeInput[]
    ): Promise<BulkResult> => {
      const { data } = await authedFetch(
        `/api/orgs/${w.toLowerCase()}/employees/bulk`,
        'POST',
        { employees }
      )
      return data as BulkResult
    },

    // ----- pools (chain read) -----
    listPools: (w: string) => get<Pool[]>(`/api/orgs/${w.toLowerCase()}/pools`),

    // Best-effort org-name lookup (never throws) for lightweight display.
    getOrgName: async (orgWallet: string): Promise<string | null> => {
      try {
        const res = await fetch(`${API_BASE}/api/orgs/${orgWallet.toLowerCase()}`)
        if (!res.ok) return null
        const org = (await res.json()) as Org | null
        return org?.name ?? null
      } catch {
        return null
      }
    },
  }
}
