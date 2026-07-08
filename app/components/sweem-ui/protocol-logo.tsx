import Image from "next/image";
import { cn } from "@/lib/utils";

// Lending-protocol logos (pasted under public/protocols/lending). Keyed by the
// protocol display name, case-insensitive. Falls back to a tinted dot.
const LOGOS: Record<string, string> = {
  navi: "/protocols/lending/navi.webp",
  scallop: "/protocols/lending/scallop.png",
  suilend: "/protocols/lending/suilend.png",
  stsui: "/protocols/lending/alphafi.png",
  usdy: "/coins/usdy.svg",
};

export function ProtocolLogo({
  name,
  size = 20,
  accent,
  className,
}: {
  name: string;
  size?: number;
  accent?: string;
  className?: string;
}) {
  const src = LOGOS[name.toLowerCase()];

  if (!src) {
    return (
      <span
        className={cn("inline-block shrink-0 rounded-full", className)}
        style={{ width: size, height: size, background: accent ?? "var(--sw-text-dim)" }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={`${name} logo`}
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}
