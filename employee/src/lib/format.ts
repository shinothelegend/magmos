/**
 * Money formatting helpers for the Sweem dashboard.
 * Values render as a large whole part with a smaller, raised cents part
 * (e.g. "$12,521" + ".15"), matching the design spec.
 */

export interface SplitMoney {
  whole: string;
  cents: string;
}

export function splitMoney(value: number, decimals = 2, symbol = "$"): SplitMoney {
  const fixed = Math.abs(value).toFixed(decimals);
  const [int, dec] = fixed.split(".");
  const sign = value < 0 ? "-" : "";
  const whole = `${sign}${symbol}${Number(int).toLocaleString("en-US")}`;
  return { whole, cents: dec ? `.${dec}` : "" };
}

export function formatMoney(value: number, decimals = 2): string {
  const { whole, cents } = splitMoney(value, decimals);
  return `${whole}${cents}`;
}

/** Compact currency, e.g. 12200 -> "$12.2K". */
export function formatCompact(value: number): string {
  if (Math.abs(value) >= 1000) {
    const k = value / 1000;
    const str = k % 1 === 0 ? k.toFixed(0) : k.toFixed(1);
    return `$${str}K`;
  }
  return `$${value}`;
}

/** Axis tick label, e.g. 5000 -> "5K", 3000 -> "3K". */
export function formatAxisK(value: number): string {
  return value >= 1000 ? `${value / 1000}K` : `${value}`;
}
