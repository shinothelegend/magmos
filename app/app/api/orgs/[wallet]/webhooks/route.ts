// GET    /api/orgs/[wallet]/webhooks — list webhook endpoints (public; non-secret fields).
// POST   /api/orgs/[wallet]/webhooks — add an endpoint (owner). Returns the signing secret ONCE.
// DELETE /api/orgs/[wallet]/webhooks?id=… — delete an endpoint (owner).

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
    .collection(COLLECTIONS.webhooks)
    .find(
      { orgWallet: wallet.toLowerCase() },
      { projection: { _id: 0, id: 1, url: 1, events: 1, secretPrefix: 1, createdAt: 1 } }
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

  const body = (await req.json().catch(() => ({}))) as { url?: string; events?: string[] }
  const url = (body.url ?? '').trim()
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:') throw new Error('https required')
  } catch {
    return NextResponse.json({ error: 'a valid https URL is required' }, { status: 400 })
  }

  const secret = `whsec_${randomBytes(20).toString('hex')}`
  const doc = {
    id: `wh_${randomUUID().slice(0, 8)}`,
    orgWallet: wallet.toLowerCase(),
    url,
    events: Array.isArray(body.events) && body.events.length ? body.events : ['*'],
    secretPrefix: secret.slice(0, 12),
    createdAt: new Date().toISOString(),
  }
  const db = await getDb()
  await db.collection(COLLECTIONS.webhooks).insertOne({ ...doc })
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
  await db.collection(COLLECTIONS.webhooks).deleteOne({ orgWallet: wallet.toLowerCase(), id })
  return NextResponse.json({ ok: true })
}
