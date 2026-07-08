"use client";

import { useEffect, useState } from "react";
import { DottedMap, type Marker } from "@/components/ui/dotted-map";

// Recipients across a global workforce — every dot receives streamed USDC.
const markers: Marker[] = [
  { lat: 37.77, lng: -122.42, size: 0.9 },
  { lat: 40.71, lng: -74.0, size: 0.9 },
  { lat: 51.51, lng: -0.13, size: 0.9 },
  { lat: 6.52, lng: 3.38, size: 0.9 },
  { lat: 25.2, lng: 55.27, size: 0.9 },
  { lat: 12.97, lng: 77.59, size: 0.9 },
  { lat: 1.35, lng: 103.82, size: 0.9 },
  { lat: -33.87, lng: 151.21, size: 0.9 },
  { lat: -23.55, lng: -46.63, size: 0.9 },
];

// Live settlement counter — streamed USDC accrues every animation frame.
function YieldTicker({ base, perSec }: { base: number; perSec: number }) {
  const [value, setValue] = useState(base);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setValue((v) => v + (dt / 1000) * perSec);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [perSec]);

  return <>{value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>;
}

export function IdleYieldMap() {
  return (
    <div className="absolute inset-0 bg-[#131316]">
      <DottedMap
        className="absolute inset-0 h-full w-full text-white/[0.1]"
        markers={markers}
        pulse
        dotColor="currentColor"
        markerColor="#ff6a1a"
        dotRadius={0.2}
        width={150}
        height={100}
      />

      {/* edge vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_45%,transparent_45%,#131316_100%)]" />

      {/* live USDC streamed cross-border */}
      <div className="absolute bottom-4 left-4 z-10 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/60">
          <span className="size-1.5 rounded-full bg-[#ff6a1a] shadow-[0_0_8px_#ff6a1a]" />
          USDC streamed cross-border
        </div>
        <div className="mt-0.5 text-[15px] font-semibold tabular-nums text-white">
          $<YieldTicker base={3128.42} perSec={0.07} />
        </div>
        <div className="text-[10px] font-medium text-[#ff6a1a]">Settled per second on Arc</div>
      </div>
    </div>
  );
}
