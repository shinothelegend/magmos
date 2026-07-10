// GET    /api/orgs/[wallet]/keys — list API keys (public; only non-secret fields).
// POST   /api/orgs/[wallet]/keys — mint a key (owner). Returns the secret ONCE.
// DELETE /api/orgs/[wallet]/keys?id=… — revoke a key (owner).
//
// Only the key prefix is stored — the full secret is shown exactly once at creation.

import { NextResponse, type NextRequest } from 'next/server'
import { randomBytes, randomUUID } from 'node:crypto'
import { isAddress } from 'viem'
import { getDb, COLLECTIONS } from '@/lib/mongo'
import { requireOwner } from '@/lib/auth'

export const runtime = 'nodejs'

type Params = { params: Promise<{ wallet: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { wallet } = await params
  if (!isAddress(wallet)) {
    return NextResponse.json({ error: 'Invalid wallet' }, { status: 400 })
  }
  const db = await getDb()
  const rows = await db
    .collection(COLLECTIONS.apiKeys)
    .find(
      { orgWallet: wallet.toLowerCase() },
      { projection: { _id: 0, id: 1, name: 1, prefix: 1, createdAt: 1 } }
    )
    .sort({ createdAt: -1 })
    .toArray()
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest, { params }: Params) {
  const { wallet } = await params
  if (!isAddress(wallet)) {
    return NextResponse.json({ error: 'Invalid wallet' }, { status: 400 })
  }
  const auth = await requireOwner(req, wallet)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as { name?: string }
  const name = (body.name ?? '').trim() || 'Untitled key'

  const hex = randomBytes(24).toString('hex')
  const secret = `mk_live_${hex}`
  const prefix = `mk_live_${hex.slice(0, 6)}`
  const doc = {
    id: `key_${randomUUID().slice(0, 8)}`,
    orgWallet: wallet.toLowerCase(),
    name,
    prefix,
    createdAt: new Date().toISOString(),
  }
  const db = await getDb()
  await db.collection(COLLECTIONS.apiKeys).insertOne({ ...doc })
  // Return the secret exactly once; it is never stored.
  return NextResponse.json({ ...doc, secret }, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { wallet } = await params
  if (!isAddress(wallet)) {
    return NextResponse.json({ error: 'Invalid wallet' }, { status: 400 })
  }
  const auth = await requireOwner(req, wallet)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 })

  const id = new URL(req.url).searchParams.get('id')?.trim()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const db = await getDb()
  await db.collection(COLLECTIONS.apiKeys).deleteOne({ orgWallet: wallet.toLowerCase(), id })
  return NextResponse.json({ ok: true })
}
