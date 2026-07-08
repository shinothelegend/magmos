// GET  /api/orgs/[wallet]/groups — list optional recipient groups (public read).
// POST /api/orgs/[wallet]/groups — create a group (wallet-signed).

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
  const rows = await db
    .collection(COLLECTIONS.groups)
    .find({ orgWallet: wallet.toLowerCase() }, { projection: { _id: 0 } })
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
  const name = (body.name ?? '').trim()
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const orgWallet = wallet.toLowerCase()
  const id = `${orgWallet}:${name.toLowerCase()}`
  const db = await getDb()
  await db
    .collection(COLLECTIONS.groups)
    .updateOne(
      { id },
      { $set: { id, orgWallet, name }, $setOnInsert: { createdAt: new Date().toISOString() } },
      { upsert: true }
    )
  return NextResponse.json({ id, orgWallet, name }, { status: 201 })
}
