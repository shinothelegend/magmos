// POST /api/orgs/[wallet]/employees/bulk — add/update many employees with a
// SINGLE wallet signature (the auth message is reused for the whole batch).
// Body: { employees: Array<{ walletAddress, name, email?, monthlyUsdc, group? }> }

import { NextResponse, type NextRequest } from 'next/server'
import { isAddress } from 'viem'
import { getDb, COLLECTIONS } from '@/lib/mongo'
import { requireOwner } from '@/lib/auth'

export const runtime = 'nodejs'

type Params = { params: Promise<{ wallet: string }> }

interface BulkRow {
  walletAddress?: string
  name?: string
  email?: string
  monthlyUsdc?: number
  group?: string
}

export async function POST(req: NextRequest, { params }: Params) {
  const { wallet } = await params
  if (!isAddress(wallet)) {
    return NextResponse.json({ error: 'Invalid wallet' }, { status: 400 })
  }

  const auth = await requireOwner(req, wallet)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as { employees?: BulkRow[] }
  const employees = Array.isArray(body.employees) ? body.employees : []

  const orgWallet = wallet.toLowerCase()
  const db = await getDb()
  const col = db.collection(COLLECTIONS.employees)

  let created = 0
  let updated = 0
  const skipped: { walletAddress: string; reason: string }[] = []

  for (const e of employees) {
    const recipient = (e.walletAddress ?? '').trim().toLowerCase()
    const name = (e.name ?? '').trim()
    if (!isAddress(recipient)) {
      skipped.push({ walletAddress: e.walletAddress ?? '', reason: 'invalid address' })
      continue
    }
    if (!name) {
      skipped.push({ walletAddress: recipient, reason: 'missing name' })
      continue
    }
    const monthlyUsdc = Number(e.monthlyUsdc ?? 0)
    const res = await col.updateOne(
      { orgWallet, walletAddress: recipient },
      {
        $set: {
          orgWallet,
          walletAddress: recipient,
          name,
          email: e.email ?? null,
          monthlyUsdc: Number.isFinite(monthlyUsdc) ? monthlyUsdc : 0,
          group: e.group ?? null,
          updatedAt: new Date().toISOString(),
        },
        $setOnInsert: { createdAt: new Date().toISOString() },
      },
      { upsert: true }
    )
    if (res.upsertedCount > 0) created++
    else updated++
  }

  return NextResponse.json({ created, updated, skipped }, { status: 200 })
}
