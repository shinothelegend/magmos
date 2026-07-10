"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SUPPORTED_TOKENS, type TokenConfig, type TokenSymbol } from "@/lib/tokens";
import { TokenIcon } from "@/components/sweem-ui/token-icon";

// Pill segmented control for switching the active token. The active background is a
// shared-layout element so it slides smoothly between tabs on switch.
export function TokenTabs({
  value,
  onChange,
  tokens = SUPPORTED_TOKENS,
  className,
  layoutId = "tokenTabActive",
}: {
  value: TokenSymbol;
  onChange: (token: TokenSymbol) => void;
  tokens?: TokenConfig[];
  className?: string;
  layoutId?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-[var(--sw-border)] bg-[var(--sw-card-inset)] p-1",
        className,
      )}
    >
      {tokens.map((t) => {
        const active = t.symbol === value;
        return (
          <button
            key={t.symbol}
            type="button"
            onClick={() => onChange(t.symbol)}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors",
              active ? "text-black" : "text-[var(--sw-text-muted)] hover:text-[var(--sw-text)]",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-[var(--sw-mint)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              <TokenIcon token={t} size={16} />
              {t.symbol}
            </span>
          </button>
        );
      })}
    </div>
  );
}
