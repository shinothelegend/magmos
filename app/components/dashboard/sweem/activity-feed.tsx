"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  ArrowUpRight,
  HandCoins,
  Pause,
  Play,
  Plus,
  ReceiptText,
  Square,
  UserPlus,
} from "lucide-react";

import { EXPLORER_TX, MONTH_S } from "@/lib/magmos";
import {
  fetchPoolActivity,
  type ActivityItem,
  type ActivityKind,
} from "@/lib/activity";
import { CardLabel, Skeleton } from "@/components/sweem-ui/primitives";
import { shortAddr, usdcFixed } from "./helpers";

/* ── Activity & receipts ──────────────────────────────────────────────────
   Every payroll event for this pool, read straight from MagmosPayroll logs.
   Each row links to its transaction on arcscan — the on-chain receipt. */

export function ActivityFeed({
  poolId,
  enabled,
  names,
}: {
  poolId: `0x${string}`;
  enabled: boolean;
  names: Record<string, string>; // lowercased wallet -> display name
}) {
  const query = useQuery({
    queryKey: ["poolActivity", poolId],
    enabled,
    refetchInterval: 15_000,
    queryFn: () => fetchPoolActivity(poolId),
  });

  // Keep relative timestamps fresh between refetches.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const items = query.data ?? [];
  const loading = query.isLoading;

  return (
    <div className="mt-4 rounded-[22px] border border-[var(--sw-border)] bg-[var(--sw-card)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <CardLabel className="text-[15px] text-[var(--sw-text)]">
            Activity &amp; receipts
          </CardLabel>
          <p className="mt-0.5 text-[12.5px] text-[var(--sw-text-dim)]">
            Every payroll event, receipted on-chain
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--sw-border)] bg-[var(--sw-card-inset)] px-3 py-1.5 text-[12px] font-medium text-[var(--sw-text-muted)]">
          <ReceiptText className="size-3.5" strokeWidth={2} />
          {loading ? "Syncing…" : `${items.length} on-chain`}
        </span>
      </div>

      {loading ? (
        <ActivitySkeleton />
      ) : items.length === 0 ? (
        <div className="flex h-[110px] items-center justify-center text-[13px] text-[var(--sw-text-dim)]">
          No activity yet — fund a payroll to get started.
        </div>
      ) : (
        <ul className="flex flex-col">
          {items.map((item) => (
            <ActivityRow
              key={`${item.txHash}-${item.logIndex}`}
              item={item}
              names={names}
              now={now}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── One receipt row ──────────────────────────────────────────────────── */

function ActivityRow({
  item,
  names,
  now,
}: {
  item: ActivityItem;
  names: Record<string, string>;
  now: number;
}) {
  const who = item.employee
    ? names[item.employee.toLowerCase()] || shortAddr(item.employee)
    : "";
  const { icon, tint, title, detail } = describe(item, who);

  return (
    <li className="flex items-center gap-3 border-b border-[var(--sw-border)] py-3 last:border-b-0 last:pb-0">
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--sw-card-inset)] ${tint}`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium text-[var(--sw-text)]">
          {title}
        </p>
        <p className="mt-0.5 truncate text-[11.5px] text-[var(--sw-text-dim)]">
          {detail}
        </p>
      </div>
      <span className="shrink-0 text-[11.5px] tabular-nums text-[var(--sw-text-dim)]">
        {item.timestamp ? timeAgo(item.timestamp, now) : `#${item.blockNumber}`}
      </span>
      <a
        href={EXPLORER_TX(item.txHash)}
        target="_blank"
        rel="noopener noreferrer"
        title="View receipt on arcscan"
        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--sw-border)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--sw-text-muted)] transition-colors hover:border-[var(--sw-border-strong)] hover:bg-[var(--sw-card-inset)] hover:text-[var(--sw-text)]"
      >
        arcscan
        <ArrowUpRight className="size-3" strokeWidth={2.4} />
      </a>
    </li>
  );
}

/* ── Copy + icon per event kind ───────────────────────────────────────── */

function describe(item: ActivityItem, who: string) {
  const amt = (raw?: bigint) => `${usdcFixed(raw ?? 0n)} USDC`;
  const feeNote =
    item.feeRaw && item.feeRaw > 0n ? ` · fee ${amt(item.feeRaw)}` : "";
  const monthlyRaw =
    item.ratePeriodSecs && item.ratePeriodSecs > 0n
      ? ((item.amountRaw ?? 0n) * BigInt(MONTH_S)) / item.ratePeriodSecs
      : (item.amountRaw ?? 0n);

  const map: Record<
    ActivityKind,
    { icon: React.ReactNode; tint: string; title: string; detail: string }
  > = {
    fund: {
      icon: <ArrowDownToLine className="size-3.5" strokeWidth={2.2} />,
      tint: "text-[var(--sw-mint)]",
      title: `Funded ${amt(item.amountRaw)}`,
      detail: `Payroll deposit${feeNote}`,
    },
    topup: {
      icon: <Plus className="size-3.5" strokeWidth={2.4} />,
      tint: "text-[var(--sw-mint)]",
      title: `Topped up ${amt(item.amountRaw)}`,
      detail: `Pool top-up${feeNote}`,
    },
    stream: {
      icon: <UserPlus className="size-3.5" strokeWidth={2.2} />,
      tint: "text-[var(--sw-lavender)]",
      title: `Stream started for ${who}`,
      detail: `${usdcFixed(monthlyRaw)} USDC / month, streamed per second`,
    },
    claim: {
      icon: <HandCoins className="size-3.5" strokeWidth={2.2} />,
      tint: "text-[var(--sw-lavender)]",
      title: `${who} claimed ${amt(item.amountRaw)}`,
      detail: "Salary paid out on-chain",
    },
    pause: {
      icon: <Pause className="size-3.5" strokeWidth={2.2} />,
      tint: "text-[#ff794b]",
      title: `Paused ${who}'s stream`,
      detail: "Accrual halted",
    },
    resume: {
      icon: <Play className="size-3.5" strokeWidth={2.2} />,
      tint: "text-[var(--sw-mint)]",
      title: `Resumed ${who}'s stream`,
      detail: "Streaming live again",
    },
    stop: {
      icon: <Square className="size-3.5" strokeWidth={2.2} />,
      tint: "text-[var(--sw-text-dim)]",
      title: `Stopped ${who}'s stream`,
      detail: "Stream ended",
    },
  };

  return map[item.kind];
}

/* ── Loading shimmer (matches row layout) ─────────────────────────────── */

function ActivitySkeleton() {
  return (
    <div className="flex flex-col">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 border-b border-[var(--sw-border)] py-3 last:border-b-0 last:pb-0"
        >
          <Skeleton className="size-8 rounded-full" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-3.5 w-44 max-w-full" />
            <Skeleton className="mt-1.5 h-2.5 w-28" />
          </div>
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-6 w-[74px] rounded-full" />
        </div>
      ))}
    </div>
  );
}

/* ── Relative time ────────────────────────────────────────────────────── */

function timeAgo(ts: number, nowMs: number): string {
  const s = Math.max(0, Math.floor(nowMs / 1000 - ts));
  if (s < 45) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
