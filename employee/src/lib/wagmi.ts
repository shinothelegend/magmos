// wagmi + viem setup for HashKey testnet. Replaces the Sui dapp-kit client config.
//
// Besides Arc (the app's primary chain), the config registers the four CCTP v2
// destination testnets the recipient can "send home" to. Registering them lets
// useSwitchChain move the injected wallet there (the connector falls back to
// wallet_addEthereumChain when the wallet doesn't know the chain yet) for the final
// MessageTransmitterV2.receiveMessage mint, and lets @wagmi/core actions wait for the
// destination-side receipt. viem/chains default public RPCs are fine for that one call.

import { http, createConfig, createStorage, cookieStorage } from 'wagmi'
import { defineChain } from 'viem'
import { sepolia, avalancheFuji, arbitrumSepolia, baseSepolia } from 'viem/chains'
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
  // hashkeyTestnet FIRST — the app's primary chain. The rest are CCTP v2 mint destinations.
  chains: [hashkeyTestnet, sepolia, avalancheFuji, arbitrumSepolia, baseSepolia],
  connectors: [injected({ target: 'metaMask' })],
  multiInjectedProviderDiscovery: false,
  transports: {
    [hashkeyTestnet.id]: http(HASHKEY_RPC_URL),
    // Destination testnets use their viem/chains default public RPCs — only exercised for
    // the destination-side receiveMessage mint + receipt wait.
    [sepolia.id]: http(),
    [avalancheFuji.id]: http(),
    [arbitrumSepolia.id]: http(),
    [baseSepolia.id]: http(),
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
