import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";
import type { MagmosNetwork } from "./types";

// HashKey testnet (Circle's stablecoin L1). USDC is the native gas token.
const hashkeyTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
  blockExplorers: { default: { name: "HashKey Explorer", url: "https://testnet.arcscan.app" } },
});

const wagmiConfig = createConfig({
  chains: [hashkeyTestnet],
  connectors: [injected()],
  transports: { [hashkeyTestnet.id]: http() },
});

// Self-contained wallet + query context for the SDK. Host apps that already run
// their own wagmi providers can render <PayModal/> directly instead and skip
// this wrapper (see README).
export function MagmosProvider({
  children,
}: {
  network?: MagmosNetwork;
  children: ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
