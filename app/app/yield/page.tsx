"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import { toast } from "sonner";
import { WalletButton } from "@/components/dashboard/wallet-button";
import {
  USDC,
  USDC_DECIMALS,
  ARC_CHAIN_ID,
  EXPLORER_TX,
  MAGMOS_YIELD_VAULT,
  YIELD_VAULT_ABI,
} from "@/lib/magmos";

const YEAR = 31_536_000;

// Treasury yield vault — "payroll that pays for itself". Org parks idle USDC → earns yield.
// Standalone route (global wagmi context). Testnet yield rail; routes to USYC in production.
export default function YieldPage() {
  const { address, isConnected, chainId } = useAccount();
  const [amount, setAmount] = useState("");

  const common = { query: { enabled: !!address, refetchInterval: 8000 } } as const;

  const { data: usdcBal } = useReadContract({
    address: USDC, abi: erc20Abi, functionName: "balanceOf",
    args: address ? [address] : undefined, ...common,
  });
  const { data: shares, refetch: refetchShares } = useReadContract({
    address: MAGMOS_YIELD_VAULT, abi: YIELD_VAULT_ABI, functionName: "balanceOf",
    args: address ? [address] : undefined, ...common,
  });
  const { data: position, refetch: refetchPos, dataUpdatedAt } = useReadContract({
    address: MAGMOS_YIELD_VAULT, abi: YIELD_VAULT_ABI, functionName: "maxWithdraw",
    args: address ? [address] : undefined, ...common,
  });
  const { data: apyBps } = useReadContract({
    address: MAGMOS_YIELD_VAULT, abi: YIELD_VAULT_ABI, functionName: "apyBps",
    query: { enabled: true },
  });
  const { data: allowance, refetch: refetchAllow } = useReadContract({
    address: USDC, abi: erc20Abi, functionName: "allowance",
    args: address ? [address, MAGMOS_YIELD_VAULT] : undefined, ...common,
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      refetchShares(); refetchPos(); refetchAllow();
      toast.success("Done");
    }
  }, [isSuccess, refetchShares, refetchPos, refetchAllow]);

  const apy = apyBps !== undefined ? Number(apyBps as bigint) / 100 : 0;
  const positionNum = position !== undefined ? Number(formatUnits(position as bigint, USDC_DECIMALS)) : 0;
  const usdc = usdcBal !== undefined ? Number(formatUnits(usdcBal as bigint, USDC_DECIMALS)) : 0;
  const hasShares = shares !== undefined && (shares as bigint) > 0n;

  // Live-interpolate the position between chain reads (grows at APY).
  const [live, setLive] = useState(0);
  const anchor = useRef({ value: 0, at: 0 });
  useEffect(() => {
    anchor.current = { value: positionNum, at: dataUpdatedAt || Date.now() };
  }, [positionNum, dataUpdatedAt]);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const { value, at } = anchor.current;
      const elapsed = (Date.now() - at) / 1000;
      setLive(value * (1 + (apy / 100) * (elapsed / YEAR)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [apy]);

  const amtRaw = useMemo(() => {
    try { return amount ? parseUnits(amount, USDC_DECIMALS) : 0n; } catch { return 0n; }
  }, [amount]);
  const needsApproval = allowance !== undefined && amtRaw > (allowance as bigint);
  const busy = isPending || confirming;

  const guard = () => {
    if (!isConnected) { toast.error("Connect your wallet"); return false; }
    if (chainId !== ARC_CHAIN_ID) { toast.error("Switch to Arc testnet"); return false; }
    return true;
  };

  const onDeposit = () => {
    if (!guard()) return;
    if (amtRaw <= 0n) return toast.error("Enter an amount");
    if (needsApproval) {
      writeContract({ address: USDC, abi: erc20Abi, functionName: "approve", args: [MAGMOS_YIELD_VAULT, amtRaw] },
        { onError: (e) => toast.error(e.message.slice(0, 140)) });
    } else {
      writeContract({ address: MAGMOS_YIELD_VAULT, abi: YIELD_VAULT_ABI, functionName: "deposit", args: [amtRaw, address!] },
        { onError: (e) => toast.error(e.message.slice(0, 140)), onSuccess: () => setAmount("") });
    }
  };

  const onWithdraw = () => {
    if (!guard()) return;
    if (!hasShares) return toast.error("No position to withdraw");
    writeContract({ address: MAGMOS_YIELD_VAULT, abi: YIELD_VAULT_ABI, functionName: "redeem", args: [shares as bigint, address!, address!] },
      { onError: (e) => toast.error(e.message.slice(0, 140)) });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0b] px-5 py-10 text-[#f4f4f5]">
      <div className="w-full max-w-md">
        <div className="mb-5 flex items-center justify-between">
          <Link href="/" style={{ fontFamily: "var(--font-display)" }} className="text-lg font-bold tracking-tight">
            Magmos
          </Link>
          <WalletButton />
        </div>

        <div className="rounded-2xl border border-[#26262b] bg-[#151517] p-7 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-[#3a2410] bg-[#1c1408] px-3 py-1 text-[11px] font-medium text-[#ffb43d]">
            <span className="size-1.5 rounded-full bg-[#ff6a1a]" />
            Treasury yield · {apy}% APY
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Payroll that pays for itself</h1>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#a1a1aa]">
            Park idle treasury USDC and earn yield while it waits to be streamed. Testnet yield
            rail (ERC-4626); routes to Circle&apos;s USYC in production.
          </p>

          <div className="mt-5 rounded-xl border border-[#3a2410] bg-gradient-to-b from-[#1c1408] to-[#0f0f11] px-4 py-4">
            <div className="text-[11px] uppercase tracking-wide text-[#b8813e]">Your position</div>
            <div className="mt-0.5 font-mono text-[30px] font-semibold tabular-nums text-[#ffb43d]">
              {live.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
              <span className="ml-1.5 text-[15px] text-[#a1a1aa]">USDC</span>
            </div>
            <div className="mt-1 text-[12px] text-[#71717a]">
              Projected 1-year: {(positionNum * (1 + apy / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-[12px] text-[#a1a1aa]">
              <span>Deposit idle USDC</span>
              <button onClick={() => setAmount(String(usdc))} className="text-[#ff6a1a] hover:underline">
                Balance: {usdc.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </button>
            </div>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              className="w-full rounded-xl border border-[#26262b] bg-[#0f0f11] px-4 py-3 font-mono text-[16px] tabular-nums outline-none focus:border-[#ff6a1a]"
            />
          </div>

          <button
            type="button"
            onClick={onDeposit}
            disabled={busy || !isConnected}
            className="mt-3 w-full rounded-xl bg-[#ff6a1a] py-3 text-[14px] font-semibold text-black transition-colors hover:bg-[#ff8340] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Confirming…" : needsApproval ? "Approve USDC" : "Deposit & earn"}
          </button>

          {hasShares && (
            <button
              type="button"
              onClick={onWithdraw}
              disabled={busy}
              className="mt-2.5 w-full rounded-xl border border-[#2a2a2e] bg-transparent py-2.5 text-[13.5px] font-medium text-[#f4f4f5] transition-colors hover:bg-[#1f1f24] disabled:opacity-50"
            >
              Withdraw all (principal + yield)
            </button>
          )}

          {isSuccess && hash && (
            <a href={EXPLORER_TX(hash)} target="_blank" rel="noreferrer"
              className="mt-3 block text-center text-[12.5px] text-[#ff6a1a] hover:underline">
              View transaction ↗
            </a>
          )}

          <Link href="/dashboard" className="mt-4 block text-center text-[13px] font-medium text-[#a1a1aa] hover:text-[#f4f4f5]">
            Go to dashboard →
          </Link>
        </div>
      </div>
    </main>
  );
}
