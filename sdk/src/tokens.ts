// Tokens the SDK can accept on Arc. USDC-only (Circle's native USDC on Arc).

export type TokenSymbol = "USDC";

export interface TokenConfig {
  symbol: TokenSymbol;
  address: `0x${string}`; // ERC-20 contract address on Arc
  decimals: number;
  icon: string; // remote logo URL (no local assets in a published package)
}

export const TOKENS: Record<TokenSymbol, TokenConfig> = {
  USDC: {
    symbol: "USDC",
    address: "0x3600000000000000000000000000000000000000", // Circle USDC on Arc
    decimals: 6,
    icon: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
  },
};

export const SUPPORTED_TOKENS = Object.values(TOKENS);

export function toRaw(token: TokenConfig, amount: number): bigint {
  return BigInt(Math.round(amount * 10 ** token.decimals));
}
