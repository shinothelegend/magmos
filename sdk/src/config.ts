import type { CheckoutConfig } from "./types";
import type { TokenSymbol } from "./tokens";

export const DEFAULT_API_BASE = "https://api.magmos.app";

// Resolve a publishable key into merchant checkout config. Throws on failure so
// the modal can show an error state. `overrides` let dev integrations skip the
// backend by supplying the recipient/merchant directly.
export async function fetchCheckoutConfig(opts: {
  apiKey: string;
  apiBase?: string;
  overrides?: Partial<CheckoutConfig>;
}): Promise<CheckoutConfig> {
  const { apiKey, apiBase = DEFAULT_API_BASE, overrides } = opts;

  // Full local override — no network call needed.
  if (overrides?.recipient) {
    return {
      merchant: overrides.merchant ?? "Merchant",
      logoUrl: overrides.logoUrl ?? null,
      recipient: overrides.recipient,
      tokens: overrides.tokens ?? (["USDC"] as TokenSymbol[]),
    };
  }

  const res = await fetch(`${apiBase}/v1/checkout/config?pk=${encodeURIComponent(apiKey)}`);
  if (!res.ok) {
    throw new Error(
      res.status === 404 ? "Invalid Magmos API key" : `Magmos config error (${res.status})`,
    );
  }
  const data = (await res.json()) as CheckoutConfig;
  return {
    merchant: overrides?.merchant ?? data.merchant,
    logoUrl: overrides?.logoUrl ?? data.logoUrl ?? null,
    recipient: data.recipient,
    tokens: overrides?.tokens ?? data.tokens ?? (["USDC"] as TokenSymbol[]),
  };
}
