"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MarqueeItem = {
  name: string;
  node: ReactNode;
};

type InfiniteMovingCardsProps = {
  items: MarqueeItem[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  className?: string;
};

/**
 * Aceternity-style infinite marquee (hand-ported, themed). Renders the items
 * twice so the `animate-marquee` keyframe (translateX(-50%)) loops seamlessly;
 * pauses on hover and disables under prefers-reduced-motion (see globals.css).
 */
export function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "slow",
  className,
}: InfiniteMovingCardsProps) {
  const duration = speed === "fast" ? "22s" : speed === "normal" ? "38s" : "55s";

  const style = {
    "--marquee-duration": duration,
    "--marquee-direction": direction === "left" ? "forwards" : "reverse",
  } as CSSProperties;

  return (
    <div
      style={style}
      className={cn(
        "relative max-w-full overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        className,
      )}
    >
      <ul className="animate-marquee flex w-max min-w-full shrink-0 flex-nowrap items-center">
        {[...items, ...items].map((item, i) => (
          <li
            key={`${item.name}-${i}`}
            aria-hidden={i >= items.length}
            className="flex shrink-0 items-center px-7 md:px-10"
          >
            {item.node}
          </li>
        ))}
      </ul>
    </div>
  );
}
