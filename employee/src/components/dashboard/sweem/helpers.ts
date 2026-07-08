// Small display helpers for the recipient portal.

export const NANO = 1_000_000_000n;

// Format nano-USDC (1e-9 USDC, bigint) as "int.fffffffff" (9 decimals).
export function formatNano(nano: bigint): string {
  return `${nano / NANO}.${(nano % NANO).toString().padStart(9, "0")}`;
}

export function shortAddr(a: string): string {
  return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}
