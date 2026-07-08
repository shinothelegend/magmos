import type { Employee } from "@/lib/api";

// Monthly USDC salary for an employee. Magmos is USDC-only, so this is the
// single rate the on-chain stream is created from (rateAmount over MONTH_S).
export function monthlyRate(e: Employee): number {
  return Number(e.monthlyUsdc) || 0;
}

// USDC has 6 decimals; format a raw (6dp) bigint as "int.ffffff".
const USDC_SCALE = 1_000_000n;

export function formatUsdc(raw: bigint, decimals = 6): string {
  const scale = 10n ** BigInt(decimals);
  const int = raw / scale;
  const frac = (raw % scale).toString().padStart(decimals, "0");
  return `${int}.${frac}`;
}

// Format raw 6dp USDC with a fixed number of fraction digits (rounded down).
export function usdcFixed(raw: bigint, fractionDigits = 2): string {
  const whole = raw / USDC_SCALE;
  const frac = ((raw % USDC_SCALE) / 10n ** BigInt(6 - fractionDigits))
    .toString()
    .padStart(fractionDigits, "0");
  return `${whole.toLocaleString("en-US")}.${frac}`;
}

export function shortAddr(a: string): string {
  return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}
