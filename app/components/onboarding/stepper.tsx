"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type StepKey = "connect" | "done";

export const STEPS: { key: StepKey; label: string }[] = [
  { key: "connect", label: "Organization" },
  { key: "done", label: "Done" },
];

export function Stepper({ current }: { current: StepKey }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="mb-8 flex items-center justify-center gap-1.5 sm:gap-2">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.key} className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold transition-colors",
                  done && "border-[var(--sw-mint)] bg-[var(--sw-mint)] text-black",
                  active && "border-[var(--sw-mint)] text-[var(--sw-mint)]",
                  !done && !active && "border-[var(--sw-border)] text-[var(--sw-text-dim)]"
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-[12.5px] font-medium transition-colors sm:block",
                  active ? "text-[var(--sw-text)]" : "text-[var(--sw-text-muted)]"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="relative h-px w-6 overflow-hidden rounded bg-[var(--sw-border)] sm:w-10">
                <motion.div
                  className="absolute inset-0 bg-[var(--sw-mint)]"
                  initial={false}
                  animate={{ scaleX: done ? 1 : 0 }}
                  style={{ originX: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
