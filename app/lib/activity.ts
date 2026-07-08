// On-chain activity feed ("receipts") for a payroll pool. Reads MagmosPayroll
// events for one poolId via eth_getLogs and decodes them into a typed,
// desc-sorted ActivityItem[] — every row links back to its tx on arcscan,
// which is the receipt.
//
// Arc testnet's RPC caps eth_getLogs at a 10,000-block range (code -32614) and
// the chain mints ~2 blocks/s (a 10k chunk ≈ 1.4h), so a from-genesis scan is
// impossible. Instead:
//   1. All event types share one request per chunk (topic0 OR-list + topic1 =
//      poolId), so a chunk costs a single RPC call.
//   2. The scan floor is estimated from on-chain state: the pool's earliest
//      stream `startedAt` (streams are created in the pool-creation tx) mapped
//      to a block via the measured block time, with generous margin.
//   3. Chunks are walked newest→oldest in parallel waves, stopping early once
//      MAX_ITEMS are found or the pool's PoolCreated marker is seen.
//   4. Results are cached per pool; later calls only scan blocks minted since
//      the previous scan (typically one cheap call every refetch).

import { decodeEventLog, numberToHex, hexToBigInt, hexToNumber, parseAbiItem, toEventSelector, type Hex } from 'viem'
import { publicClient, getEmployees, getPool, getStream } from './reads'
import { MAGMOS_PAYROLL } from './magmos'

export type ActivityKind =
  | 'fund' // PoolFunded — initial deposit that created the pool
  | 'topup' // PoolToppedUp — subsequent deposit
  | 'stream' // StreamCreated — new salary stream
  | 'claim' // FundsClaimed — recipient withdrew accrued pay
  | 'pause' // StreamPaused
  | 'resume' // StreamResumed
  | 'stop' // StreamStopped

export interface ActivityItem {
  kind: ActivityKind
  employee?: `0x${string}`
  amountRaw?: bigint // raw 6dp USDC (gross for fund/topup, rate for stream, amount for claim)
  feeRaw?: bigint // protocol fee for fund/topup
  ratePeriodSecs?: bigint // stream rate period (StreamCreated only)
  txHash: `0x${string}`
  blockNumber: bigint
  logIndex: number
  timestamp?: number // unix seconds; from the event args where present, else the block
}

// Event definitions (mirror PAYROLL_ABI — a const tuple keeps decodeEventLog
// fully typed). PoolCreated is fetched only as a "start of history" marker.
const ACTIVITY_EVENTS = [
  parseAbiItem('event PoolCreated(bytes32 indexed poolId, address indexed org, address indexed token)'),
  parseAbiItem('event PoolFunded(bytes32 indexed poolId, address indexed org, uint256 gross, uint256 fee, uint256 net, uint256 timestamp)'),
  parseAbiItem('event PoolToppedUp(bytes32 indexed poolId, address indexed org, uint256 gross, uint256 fee, uint256 net)'),
  parseAbiItem('event StreamCreated(bytes32 indexed poolId, address indexed employee, uint256 rateAmount, uint256 ratePeriod, uint64 startedAt)'),
  parseAbiItem('event FundsClaimed(bytes32 indexed poolId, address indexed employee, uint256 amount, uint256 timestamp)'),
  parseAbiItem('event StreamPaused(bytes32 indexed poolId, address indexed employee, uint256 pausedAt)'),
  parseAbiItem('event StreamResumed(bytes32 indexed poolId, address indexed employee, uint256 resumedAt)'),
  parseAbiItem('event StreamStopped(bytes32 indexed poolId, address indexed employee, uint256 stoppedAt)'),
] as const

const TOPIC0S = ACTIVITY_EVENTS.map((e) => toEventSelector(e)) as Hex[]

const MAX_ITEMS = 50
const CHUNK = 10_000n // Arc RPC getLogs range limit
const WAVE = 6 // parallel chunk requests per wave
const MAX_CHUNKS = 100 // absolute cold-scan cap (~1M blocks ≈ 6 days @ ~0.5s blocks)
const DEFAULT_LOOKBACK_S = 3 * 24 * 3600 // floor when the pool has no streams to anchor on
const FLOOR_MARGIN_BLOCKS = 20_000n // slack under the estimated creation block
const REORG_OVERLAP = 50n // blocks re-scanned on every refetch
const MAX_INCREMENTAL_CHUNKS = 12 // beyond this gap (tab slept), rescan cold

interface PoolCache {
  items: ActivityItem[]
  scannedTo: bigint // highest block covered by `items`
}

const poolCache = new Map<string, PoolCache>()
const blockTsCache = new Map<bigint, number>()

const bmax = (...xs: bigint[]) => xs.reduce((a, b) => (a > b ? a : b))
const bmin = (a: bigint, b: bigint) => (a < b ? a : b)

/* ── One chunk: a single eth_getLogs for every event kind of this pool ── */

async function fetchChunk(
  poolId: `0x${string}`,
  fromBlock: bigint,
  toBlock: bigint
): Promise<{ items: ActivityItem[]; sawCreation: boolean }> {
  const logs = await publicClient.request({
    method: 'eth_getLogs',
    params: [
      {
        address: MAGMOS_PAYROLL,
        topics: [TOPIC0S, poolId], // any of our events, this pool only
        fromBlock: numberToHex(fromBlock),
        toBlock: numberToHex(toBlock),
      },
    ],
  })

  const items: ActivityItem[] = []
  let sawCreation = false

  for (const l of logs) {
    if (l.blockNumber == null || l.logIndex == null || l.transactionHash == null) continue
    let decoded: ReturnType<typeof decodeEventLog<typeof ACTIVITY_EVENTS>>
    try {
      decoded = decodeEventLog({
        abi: ACTIVITY_EVENTS,
        data: l.data,
        topics: l.topics as [Hex, ...Hex[]],
      })
    } catch {
      continue // not one of ours (shouldn't happen given the topic filter)
    }

    const base = {
      txHash: l.transactionHash,
      blockNumber: hexToBigInt(l.blockNumber),
      logIndex: hexToNumber(l.logIndex),
    }

    switch (decoded.eventName) {
      case 'PoolCreated':
        sawCreation = true // history starts here — nothing to render (PoolFunded is the receipt)
        break
      case 'PoolFunded':
        items.push({
          kind: 'fund',
          amountRaw: decoded.args.gross,
          feeRaw: decoded.args.fee,
          timestamp: Number(decoded.args.timestamp),
          ...base,
        })
        break
      case 'PoolToppedUp':
        items.push({ kind: 'topup', amountRaw: decoded.args.gross, feeRaw: decoded.args.fee, ...base })
        break
      case 'StreamCreated':
        items.push({
          kind: 'stream',
          employee: decoded.args.employee,
          amountRaw: decoded.args.rateAmount,
          ratePeriodSecs: decoded.args.ratePeriod,
          timestamp: Number(decoded.args.startedAt),
          ...base,
        })
        break
      case 'FundsClaimed':
        items.push({
          kind: 'claim',
          employee: decoded.args.employee,
          amountRaw: decoded.args.amount,
          timestamp: Number(decoded.args.timestamp),
          ...base,
        })
        break
      case 'StreamPaused':
        items.push({ kind: 'pause', employee: decoded.args.employee, timestamp: Number(decoded.args.pausedAt), ...base })
        break
      case 'StreamResumed':
        items.push({ kind: 'resume', employee: decoded.args.employee, timestamp: Number(decoded.args.resumedAt), ...base })
        break
      case 'StreamStopped':
        items.push({ kind: 'stop', employee: decoded.args.employee, timestamp: Number(decoded.args.stoppedAt), ...base })
        break
    }
  }

  return { items, sawCreation }
}

/* ── Scan floor: estimated pool-creation block, from on-chain state ───── */

// Streams are created inside the pool-creation tx, so the earliest stream's
// `startedAt` ≈ the creation timestamp. Map it to a block number using the
// measured block time, pad generously, and never look back further than
// MAX_CHUNKS anyway.
async function estimateFloor(poolId: `0x${string}`, latest: bigint): Promise<bigint> {
  const hardFloor = bmax(0n, latest - CHUNK * BigInt(MAX_CHUNKS))

  try {
    const sampleBack = bmin(latest, 200_000n)
    const [head, old] = await Promise.all([
      publicClient.getBlock({ blockNumber: latest }),
      publicClient.getBlock({ blockNumber: latest - sampleBack }),
    ])
    const blockTimeS = Math.max(
      0.05,
      Number(head.timestamp - old.timestamp) / Math.max(1, Number(sampleBack))
    )

    let anchorTs = 0
    const roster = await getEmployees(poolId).catch(() => [] as `0x${string}`[])
    if (roster.length > 0) {
      const streams = await Promise.all(
        roster.slice(0, 12).map((addr) => getStream(poolId, addr).catch(() => null))
      )
      const starts = streams
        .map((s) => (s ? Number(s.startedAt) : 0))
        .filter((t) => t > 0)
      if (starts.length > 0) anchorTs = Math.min(...starts)
    }
    if (anchorTs === 0) anchorTs = Number(head.timestamp) - DEFAULT_LOOKBACK_S

    const ageS = Math.max(0, Number(head.timestamp) - anchorTs)
    const blocksBack = BigInt(Math.ceil((ageS / blockTimeS) * 1.3)) + FLOOR_MARGIN_BLOCKS
    return bmax(hardFloor, latest - blocksBack)
  } catch {
    return hardFloor // estimation failed — scan the capped window
  }
}

/* ── Cold scan: newest→oldest waves with early stop ───────────────────── */

async function backwardScan(
  poolId: `0x${string}`,
  latest: bigint,
  floor: bigint
): Promise<ActivityItem[]> {
  const chunks: Array<[bigint, bigint]> = []
  for (let to = latest; to >= floor; ) {
    const from = bmax(floor, to - CHUNK + 1n)
    chunks.push([from, to])
    if (from === floor) break
    to = from - 1n
  }

  const found: ActivityItem[] = []
  for (let i = 0; i < chunks.length; i += WAVE) {
    const wave = chunks.slice(i, i + WAVE)
    const results = await Promise.all(wave.map(([f, t]) => fetchChunk(poolId, f, t)))
    let sawCreation = false
    for (const r of results) {
      found.push(...r.items)
      sawCreation = sawCreation || r.sawCreation
    }
    // Waves run newest→oldest, so once we have a full page (or hit the pool's
    // creation) everything older would be cut by the cap anyway.
    if (sawCreation || found.length >= MAX_ITEMS) break
  }
  return found
}

/* ── Merge helpers ────────────────────────────────────────────────────── */

function dedupeSortCap(items: ActivityItem[]): ActivityItem[] {
  const seen = new Set<string>()
  const out: ActivityItem[] = []
  for (const it of items) {
    const key = `${it.txHash}:${it.logIndex}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(it)
  }
  // Newest first: blockNumber desc, then logIndex desc within a block.
  out.sort((a, b) => {
    if (a.blockNumber !== b.blockNumber) return a.blockNumber > b.blockNumber ? -1 : 1
    return b.logIndex - a.logIndex
  })
  return out.slice(0, MAX_ITEMS)
}

// Only PoolToppedUp lacks a timestamp arg — backfill from block headers
// (cached), one getBlock per unique block, in parallel.
async function backfillTimestamps(items: ActivityItem[]): Promise<void> {
  const missing = [
    ...new Set(
      items
        .filter((i) => i.timestamp === undefined && !blockTsCache.has(i.blockNumber))
        .map((i) => i.blockNumber)
    ),
  ]
  if (missing.length > 0) {
    const blocks = await Promise.all(
      missing.map((bn) => publicClient.getBlock({ blockNumber: bn }).catch(() => null))
    )
    blocks.forEach((b, i) => {
      if (b) blockTsCache.set(missing[i], Number(b.timestamp))
    })
  }
  for (const item of items) {
    if (item.timestamp === undefined) item.timestamp = blockTsCache.get(item.blockNumber)
  }
}

/* ── Public API ───────────────────────────────────────────────────────── */

// Fetch the pool's activity, newest first, capped at MAX_ITEMS. First call
// per pool does the bounded backward scan; subsequent calls only scan blocks
// minted since (plus a small reorg overlap), so polling stays ~1 RPC call.
export async function fetchPoolActivity(poolId: `0x${string}`): Promise<ActivityItem[]> {
  const latest = await publicClient.getBlockNumber()
  const cached = poolCache.get(poolId)

  // Incremental path — cache is fresh enough to just top up.
  if (cached && latest - cached.scannedTo <= CHUNK * BigInt(MAX_INCREMENTAL_CHUNKS)) {
    if (latest > cached.scannedTo - REORG_OVERLAP) {
      const from = bmax(0n, cached.scannedTo - REORG_OVERLAP)
      let fresh: ActivityItem[] = []
      for (let f = from; f <= latest; f += CHUNK) {
        const t = bmin(latest, f + CHUNK - 1n)
        const r = await fetchChunk(poolId, f, t)
        fresh = fresh.concat(r.items)
      }
      cached.items = dedupeSortCap([...fresh, ...cached.items])
      cached.scannedTo = latest
      await backfillTimestamps(cached.items)
    }
    return cached.items
  }

  // No pool yet → no history can exist (every event requires the pool). Skip
  // the scan and start watching from here; the incremental path (with reorg
  // overlap) picks up the creation tx as soon as it lands.
  const pool = await getPool(poolId).catch(() => null)
  if (pool && !pool.exists) {
    const entry: PoolCache = { items: [], scannedTo: latest }
    poolCache.set(poolId, entry)
    return entry.items
  }

  // Cold path — bounded backward scan from the head.
  const floor = await estimateFloor(poolId, latest)
  const items = dedupeSortCap(await backwardScan(poolId, latest, floor))
  await backfillTimestamps(items)
  poolCache.set(poolId, { items, scannedTo: latest })
  return items
}
