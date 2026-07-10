import type { TokenSymbol } from "./tokens";

// Merchant checkout configuration resolved from a publishable key. In production
// this comes from GET {apiBase}/v1/checkout/config?pk=… ; during local dev you
// can bypass the backend by passing `recipient`/`merchant` props directly.
export interface CheckoutConfig {
  merchant: string;
  logoUrl?: string | null;
  recipient: string; // merchant's receiving Arc (EVM) address
  tokens: TokenSymbol[]; // accepted tokens
}

export interface PaymentResult {
  txHash: string;
  amount: number;
  token: TokenSymbol;
  recipient: string;
}

export type MagmosNetwork = "mainnet" | "testnet";
