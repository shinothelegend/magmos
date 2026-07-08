// Token registry — single source of truth for every streamable token. On Arc the
// recipient portal deals in USDC only (6-dec ERC-20). Adding a token later is one
// entry here; the screens and icons read from it.

import { USDC, USDC_DECIMALS } from './magmos'

export type TokenSymbol = 'USDC'

export interface TokenConfig {
  symbol: TokenSymbol
  address: `0x${string}` // ERC-20 contract address on Arc
  decimals: number
  icon: string // public path to the coin logo
}

export const TOKENS: Record<TokenSymbol, TokenConfig> = {
  USDC: {
    symbol: 'USDC',
    address: USDC,
    decimals: USDC_DECIMALS,
    icon: '/tokens/usdc.svg',
  },
}

export const SUPPORTED_TOKENS: TokenConfig[] = Object.values(TOKENS)
export const TOKEN_SYMBOLS = Object.keys(TOKENS) as TokenSymbol[]

export function tokenBySymbol(symbol: string): TokenConfig | undefined {
  return TOKENS[symbol as TokenSymbol]
}

export function toRaw(token: TokenConfig, amount: number): bigint {
  return BigInt(Math.round(amount * 10 ** token.decimals))
}

export function fromRaw(token: TokenConfig, raw: bigint | string | number): number {
  return Number(BigInt(raw)) / 10 ** token.decimals
}
