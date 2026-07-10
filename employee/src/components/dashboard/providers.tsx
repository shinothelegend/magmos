"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";

// Scopes the wagmi wallet + react-query context to the employee portal. (Was
// SuiClientProvider + WalletProvider; now WagmiProvider on HashKey Chain testnet — see
// lib/wagmi.ts.)
export function DashboardProviders({ children }: { children: React.ReactNode }) {
  // One QueryClient per browser session (avoid re-creating across renders).
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
