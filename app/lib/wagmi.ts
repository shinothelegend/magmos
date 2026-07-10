// wagmi + viem setup for HashKey testnet. Replaces the Sui dapp-kit client config.

import { http, createConfig, createStorage, cookieStorage } from 'wagmi'
import { defineChain } from 'viem'
import { injected } from 'wagmi/connectors'
import { HASHKEY_CHAIN_ID, HASHKEY_RPC_URL, HASHKEY_WS_URL, HASHKEY_EXPLORER, MULTICALL3 } from './magmos'

/// HashKey testnet. Native gas token is HSK.
export const hashkeyTestnet = defineChain({
  id: HASHKEY_CHAIN_ID,
  name: 'HashKey Chain Testnet',
  nativeCurrency: { name: 'HSK', symbol: 'HSK', decimals: 18 },
  rpcUrls: {
    default: { http: [HASHKEY_RPC_URL], webSocket: [HASHKEY_WS_URL] },
  },
  blockExplorers: {
    default: { name: 'HashKey Testnet Explorer', url: HASHKEY_EXPLORER },
  },
  contracts: {
    multicall3: { address: MULTICALL3 },
  },
  testnet: true,
})

export const wagmiConfig = createConfig({
  chains: [hashkeyTestnet],
  connectors: [injected({ target: 'metaMask' })],
  multiInjectedProviderDiscovery: false,
  transports: {
    [hashkeyTestnet.id]: http(HASHKEY_RPC_URL),
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
