// GET   /api/orgs/[wallet]/invoices — list invoices for an org (public read).
// POST  /api/orgs/[wallet]/invoices — create an invoice (wallet-signed).
// PATCH /api/orgs/[wallet]/invoices — update an invoice's status/txHash (owner).

import { NextResponse, type NextRequest } from 'next/server'
import { randomUUID } from 'node:crypto'
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
    .collection(COLLECTIONS.invoices)
    .find({ orgWallet: wallet.toLowerCase() }, { projection: { _id: 0 } })
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

  const body = (await req.json().catch(() => ({}))) as {
    name?: string
    address?: string
    amount?: number
    dueDate?: string
  }
  const name = (body.name ?? '').trim()
  const address = (body.address ?? '').trim()
  const amount = Number(body.amount ?? 0)
  if (!name) return NextResponse.json({ error: 'recipient name is required' }, { status: 400 })
  if (!isAddress(address)) return NextResponse.json({ error: 'invalid recipient address' }, { status: 400 })
  if (!(amount > 0)) return NextResponse.json({ error: 'amount must be > 0' }, { status: 400 })

  const now = new Date()
  const doc = {
    id: `INV-${randomUUID().slice(0, 8)}`,
    orgWallet: wallet.toLowerCase(),
    recipient: { name, address: address.toLowerCase() },
    amount,
    status: 'pending' as const,
    issuedDate: now.toISOString().slice(0, 10),
    dueDate: body.dueDate || now.toISOString().slice(0, 10),
    txHash: null as string | null,
    createdAt: now.toISOString(),
  }
  const db = await getDb()
  await db.collection(COLLECTIONS.invoices).insertOne({ ...doc })
  return NextResponse.json(doc, { status: 201 })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { wallet } = await params
  if (!isAddress(wallet)) {
    return NextResponse.json({ error: 'Invalid wallet' }, { status: 400 })
  }
  const auth = await requireOwner(req, wallet)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as { id?: string; status?: string; txHash?: string }
  const id = (body.id ?? '').trim()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const set: Record<string, unknown> = { updatedAt: new Date().toISOString() }
  if (body.status) set.status = body.status
  if (body.txHash) set.txHash = body.txHash

  const db = await getDb()
  await db
    .collection(COLLECTIONS.invoices)
    .updateOne({ orgWallet: wallet.toLowerCase(), id }, { $set: set })
  return NextResponse.json({ ok: true })
}
