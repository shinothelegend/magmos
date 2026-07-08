// GET  /api/orgs/[wallet]  — fetch org profile (public read; 404 if none).
// POST /api/orgs/[wallet]  — create/ensure org profile (wallet-signed).
//
// Org identity = the connected wallet address (lowercased). Metadata only.

import { NextResponse, type NextRequest } from 'next/server'
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
  const org = await db
    .collection(COLLECTIONS.orgs)
    .findOne({ wallet: wallet.toLowerCase() }, { projection: { _id: 0 } })
  if (!org) return NextResponse.json(null, { status: 404 })
  return NextResponse.json(org)
}

export async function POST(req: NextRequest, { params }: Params) {
  const { wallet } = await params
  if (!isAddress(wallet)) {
    return NextResponse.json({ error: 'Invalid wallet' }, { status: 400 })
  }

  const auth = await requireOwner(req, wallet)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as {
    name?: string
    email?: string
  }
  const name = (body.name ?? '').trim()
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const w = wallet.toLowerCase()
  const db = await getDb()
  const col = db.collection(COLLECTIONS.orgs)

  const existing = await col.findOne({ wallet: w }, { projection: { _id: 0 } })
  if (existing) {
    // Idempotent create — update name/email if provided, return existing.
    const patch: Record<string, unknown> = { name }
    if (body.email !== undefined) patch.email = body.email
    await col.updateOne({ wallet: w }, { $set: patch })
    return NextResponse.json({ ...existing, ...patch }, { status: 200 })
  }

  const doc = {
    wallet: w,
    name,
    email: body.email ?? null,
    createdAt: new Date().toISOString(),
  }
  await col.insertOne({ ...doc })
  return NextResponse.json(doc, { status: 201 })
}
