// Server-only EIP-191 auth for the Magmos API routes. The org signs a fresh
// message client-side (see lib/api.ts) and sends it as three headers:
//   x-magmos-address   — the claimed signer (org identity = wallet address)
//   x-magmos-message   — `magmos-auth:<address>:<unixMs>`
//   x-magmos-signature — personal_sign (EIP-191) over that message
//
// verifyAuth checks the signature recovers to x-magmos-address AND that the
// embedded timestamp is within a 5-minute freshness window. A single signature
// can authorize a short burst of requests (e.g. bulk employee add) within that
// window — there is no nonce. Metadata only; this NEVER touches funds.

import { verifyMessage, isAddress, type Address } from 'viem'
import type { NextRequest } from 'next/server'

const FRESHNESS_MS = 5 * 60 * 1000 // 5 minutes

export const authMessageFor = (address: string, unixMs: number) =>
  `magmos-auth:${address.toLowerCase()}:${unixMs}`

export interface AuthResult {
  ok: boolean
  address?: Address
  error?: string
}

// Validate the wallet-signed headers on a request. On success returns the
// lowercased signer address. Callers should additionally check the signer
// matches the resource owner (the `wallet` path segment).
export async function verifyAuth(req: NextRequest): Promise<AuthResult> {
  const address = req.headers.get('x-magmos-address')
  const message = req.headers.get('x-magmos-message')
  const signature = req.headers.get('x-magmos-signature')

  if (!address || !message || !signature) {
    return { ok: false, error: 'Missing auth headers' }
  }
  if (!isAddress(address)) {
    return { ok: false, error: 'Invalid address' }
  }

  // message shape: magmos-auth:<address>:<unixMs>
  const parts = message.split(':')
  if (parts.length !== 3 || parts[0] !== 'magmos-auth') {
    return { ok: false, error: 'Malformed auth message' }
  }
  if (parts[1].toLowerCase() !== address.toLowerCase()) {
    return { ok: false, error: 'Auth message address mismatch' }
  }
  const ts = Number(parts[2])
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > FRESHNESS_MS) {
    return { ok: false, error: 'Auth message expired' }
  }

  try {
    const valid = await verifyMessage({
      address: address as Address,
      message,
      signature: signature as `0x${string}`,
    })
    if (!valid) return { ok: false, error: 'Bad signature' }
  } catch {
    return { ok: false, error: 'Signature verification failed' }
  }

  return { ok: true, address: address.toLowerCase() as Address }
}

// Convenience: verify AND assert the signer owns the given wallet resource.
export async function requireOwner(
  req: NextRequest,
  wallet: string
): Promise<AuthResult> {
  const res = await verifyAuth(req)
  if (!res.ok) return res
  if (res.address!.toLowerCase() !== wallet.toLowerCase()) {
    return { ok: false, error: 'Signer is not the resource owner' }
  }
  return res
}
