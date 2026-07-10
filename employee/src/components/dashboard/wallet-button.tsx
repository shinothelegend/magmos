"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { toast } from "sonner";
import { HASHKEY_CHAIN_ID } from "@/lib/magmos";

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

// Arc wallet button. Same premium visuals as the Sui-era ConnectModal button — only the
// hooks changed (useCurrentAccount → useAccount, dapp-kit ConnectModal → wagmi useConnect).
export function WalletButton() {
  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [copied, setCopied] = useState(false);

  if (isConnected && address) {
    const copy = async () => {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        toast.success("Address copied");
        setTimeout(() => setCopied(false), 1400);
      } catch {
        toast.error("Couldn't copy address");
      }
    };

    const wrongChain = chainId !== HASHKEY_CHAIN_ID;

    return (
      <div className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--sw-border)] bg-[var(--sw-card)] pl-2.5 pr-1">
        {wrongChain ? (
          <button
            onClick={() => switchChain({ chainId: HASHKEY_CHAIN_ID })}
            type="button"
            className="rounded-full px-2 py-1 text-[12px] font-semibold text-[#ff794b] transition-colors hover:text-[#ff9a75]"
          >
            Switch to HashKey Chain
          </button>
        ) : (
          <button
            onClick={copy}
            title="Copy full address"
            type="button"
            className="flex items-center gap-1.5 rounded-full px-1.5 py-1 font-mono text-[12.5px] font-medium text-[var(--sw-text)] transition-colors hover:text-[var(--sw-mint)]"
          >
            <span>{shortAddr(address)}</span>
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12.5 9.5 17 19 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="2" />
                <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        )}
        <span className="h-4 w-px bg-[var(--sw-border)]" aria-hidden="true" />
        <button
          onClick={() => disconnect()}
          title="Disconnect wallet"
          type="button"
          className="flex size-7 items-center justify-center rounded-full text-[var(--sw-text-muted)] transition-colors hover:bg-[rgba(239,68,68,0.12)] hover:text-[#ef4444]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 12H5m0 0 4-4m-4 4 4 4M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    );
  }

  const onConnect = () => {
    const connector = connectors[0];
    if (!connector) {
      toast.error("No wallet found — install MetaMask");
      return;
    }
    connect({ connector });
  };

  return (
    <button
      type="button"
      onClick={onConnect}
      disabled={isPending}
      className="rounded-full bg-[var(--sw-mint)] px-4 py-2 text-[13px] font-semibold text-black transition-colors hover:bg-[#ff8340] disabled:opacity-60"
    >
      {isPending ? "Connecting…" : "Connect wallet"}
    </button>
  );
}
