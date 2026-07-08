// wagmi + viem setup for Arc testnet. Replaces the Sui dapp-kit client config.

import { http, createConfig, createStorage, cookieStorage } from 'wagmi'
import { defineChain } from 'viem'
import { injected } from 'wagmi/connectors'
import { ARC_CHAIN_ID, ARC_RPC_URL, ARC_WS_URL, ARC_EXPLORER, MULTICALL3 } from './magmos'

/// Arc testnet. Native gas token is USDC (18-dec native); the ERC-20 USDC used for
/// payroll is a separate 6-dec token (see lib/magmos.ts USDC).
export const arcTestnet = defineChain({
  id: ARC_CHAIN_ID,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: [ARC_RPC_URL], webSocket: [ARC_WS_URL] },
  },
  blockExplorers: {
    default: { name: 'Arcscan', url: ARC_EXPLORER },
  },
  contracts: {
    multicall3: { address: MULTICALL3 },
  },
  testnet: true,
})

export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors: [injected()],
  transports: {
    [arcTestnet.id]: http(ARC_RPC_URL),
  },
  // SSR-safe hydration for Next.js
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
})

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
