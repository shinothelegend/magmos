"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { TokenConfig } from "@/lib/tokens";

export function TokenIcon({
  token,
  size = 16,
  className,
}: {
  token: TokenConfig;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={token.icon}
      alt={token.symbol}
      width={size}
      height={size}
      unoptimized
      className={cn("inline-block shrink-0 rounded-full object-cover align-[-0.15em]", className)}
    />
  );
}

// Inline amount with a leading coin logo — the per-token replacement for "$N".
export function TokenAmount({
  token,
  value,
  decimals = 2,
  size = 14,
  className,
}: {
  token: TokenConfig;
  value: number;
  decimals?: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 tabular-nums", className)}>
      <TokenIcon token={token} size={size} />
      {value.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}
