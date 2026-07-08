"use client";

import { useEffect, useState } from "react";

const RATE = 0.0188; // USD per ms (visual only)

// Dashboard "Total Streamed" equalizer — lime first half, violet second half.
const EQ = Array.from({ length: 32 }, (_, i) =>
  Math.min(1, 0.4 + 0.4 * Math.abs(Math.sin(i * 0.9 + 0.5)) + 0.18 * Math.abs(Math.cos(i * 0.37))),
);
const MINT = "linear-gradient(to top, #a6e34a, #ff6a1a)";
const LAVENDER = "linear-gradient(to top, #a593f2, #ffb43d)";

/**
 * Live "salary streaming" visual for the Core Service feature tile: a counter
 * that accrues every animation frame above an equalizer of pulsing bars.
 * Both halves stop under prefers-reduced-motion (frame loop guarded here,
 * bars via the .stream-bar media query in globals.css).
 */
export function StreamMeter() {
  const [total, setTotal] = useState(128540.42);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setTotal((v) => v + dt * RATE);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const [whole, cents] = total
    .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .split(".");

  return (
    <div className="rounded-2xl border border-border bg-white/70 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-text-muted">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-brand" />
          </span>
          Streaming now
        </span>
        <span className="text-[11px] font-medium text-text-muted">+${(RATE * 1000).toFixed(2)}/s</span>
      </div>

      <div className="mt-3 font-semibold tracking-tight text-text-primary tabular-nums">
        <span className="text-[34px] leading-none">${whole}</span>
        <span className="text-[18px] text-text-muted">.{cents}</span>
      </div>

      {/* equalizer — dashboard lime/violet bars */}
      <div className="mt-5 flex h-12 items-end gap-[3px]">
        {EQ.map((h, i) => (
          <span
            key={i}
            className="eq-bar flex-1 rounded-[2px]"
            style={{
              height: `${h * 100}%`,
              background: i < EQ.length / 2 ? MINT : LAVENDER,
              animationDelay: `${(i % 8) * 0.12}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
