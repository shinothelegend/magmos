"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { splitMoney } from "@/lib/format";
import type { TokenConfig } from "@/lib/tokens";
import { TokenIcon } from "./token-icon";
import { cardVariants, spring } from "./motion";

/* ── Money value: large whole part + smaller raised cents ─────────────── */
// Pass a `token` to lead with the coin logo instead of the "$" symbol.

interface MoneyValueProps {
  value: number;
  decimals?: number;
  className?: string;
  centsClassName?: string;
  token?: TokenConfig;
  iconSize?: number;
}

export function MoneyValue({
  value,
  decimals = 2,
  className,
  centsClassName,
  token,
  iconSize = 18,
}: MoneyValueProps) {
  const { whole, cents } = splitMoney(value, decimals, "");
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold tracking-[-0.02em] tabular-nums",
        className
      )}
    >
      {token ? <TokenIcon token={token} size={iconSize} className="mr-1.5" /> : null}
      <span className="inline-flex items-baseline">
        <span>{whole}</span>
        {cents ? (
          <span className={cn("text-[0.6em] font-medium text-[var(--sw-text-dim)]", centsClassName)}>
            {cents}
          </span>
        ) : null}
      </span>
    </span>
  );
}

/* ── Icon chip: small rounded-square holding a line icon ──────────────── */

interface IconChipProps {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "dark";
}

export function IconChip({ children, className, tone = "default" }: IconChipProps) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border",
        tone === "dark"
          ? "border-black/10 bg-black/10 text-black/80"
          : "border-[var(--sw-border)] bg-[var(--sw-card-inset)] text-[var(--sw-text-muted)]",
        className
      )}
    >
      {children}
    </span>
  );
}

/* ── Corner arrow button (↗) ──────────────────────────────────────────── */

export function CornerArrow({
  tone = "default",
  className,
}: {
  tone?: "default" | "dark";
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ rotate: 45 }}
      whileTap={{ scale: 0.9 }}
      transition={spring}
      aria-label="Open"
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-lg border transition-colors",
        tone === "dark"
          ? "border-black/15 text-black/70 hover:bg-black/10"
          : "border-[var(--sw-border)] text-[var(--sw-text-muted)] hover:bg-[var(--sw-card-inset)] hover:text-[var(--sw-text)]",
        className
      )}
    >
      <ArrowUpRight className="size-3.5" strokeWidth={2.2} />
    </motion.button>
  );
}

/* ── Section label (muted, small caps-ish) ────────────────────────────── */

export function CardLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-[13px] font-medium text-[var(--sw-text-muted)]",
        className
      )}
    >
      {children}
    </span>
  );
}

/* ── Card shell: entrance variant + hover elevation ───────────────────── */

interface SweemCardProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
  hover?: boolean;
  accent?: boolean;
}

export function SweemCard({
  className,
  children,
  hover = false,
  accent = false,
  ...props
}: SweemCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={hover ? { y: -3, scale: 1.006 } : undefined}
      transition={spring}
      className={cn(
        "group relative overflow-hidden rounded-[22px] border p-5",
        accent
          ? "border-transparent bg-[var(--sw-mint)] text-black shadow-[0_18px_50px_-12px_rgba(196,245,107,0.45)]"
          : "border-[var(--sw-border)] bg-[var(--sw-card)] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_48px_-32px_rgba(0,0,0,0.8)] hover:border-[var(--sw-border-strong)]",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
