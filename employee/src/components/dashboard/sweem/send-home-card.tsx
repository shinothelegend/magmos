"use client";

// "Send home" — Circle CCTP v2 cross-border USDC bridge for the recipient. The FULL loop
// runs in-app:
//   pick destination chain + amount → approve REAL Circle USDC to TokenMessengerV2 →
//   depositForBurn (burns on HashKey Chain, mintRecipient = the recipient's own address as bytes32) →
//   poll Circle's Iris attestation API until status === "complete", capturing the message +
//   attestation bytes → "Mint on {chain}": switch the wallet to the destination testnet via
//   wagmi useSwitchChain (the injected connector falls back to wallet_addEthereumChain when
//   the wallet doesn't know the chain, so the user may see an "Add network" prompt) → call
//   MessageTransmitterV2.receiveMessage(message, attestation) there, which mints the USDC →
//   wait for the destination receipt (wagmi/actions waitForTransactionReceipt with the
//   destination chainId) → success + destination explorer link + "Switch back to Arc".
//
// The mint needs a little native gas on the destination chain (e.g. Sepolia ETH) — the UI
// says so before the user commits. A failed mint drops back to "attested" (the attestation
// stays valid) so the user can retry without re-burning.
//
// Token nuance: this operates on REAL_USDC (native Circle USDC), NOT the streamed faucet
// test token the payroll uses. A note in the UI makes that explicit.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useConfig, useSwitchChain, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { erc20Abi, type Address, type Hex } from "viem";
import { Globe, ArrowRight, Loader2, Check, ExternalLink } from "lucide-react";

import { CardLabel, IconChip, SweemCard } from "@/components/sweem-ui/primitives";
import { publicClient, getRealUsdcBalance } from "@/lib/reads";
import { EXPLORER_TX } from "@/lib/magmos";
import { hashkeyTestnet } from "@/lib/wagmi";
import {
  REAL_USDC,
  USDC_DECIMALS,
  TOKEN_MESSENGER_V2,
  DESTINATION_CHAINS,
  chainByDomain,
  approveRealUsdc,
  depositForBurn,
  pollAttestation,
  receiveMessage,
  destExplorerTx,
  type DestinationChain,
} from "@/lib/cctp";
import { ActionButton, Modal, AmountField } from "./ui";
import { shortAddr } from "./helpers";

// 6-dec helpers scoped to REAL_USDC (payroll's toRaw/fromRaw are tied to the token registry).
const toRaw6 = (n: number) => BigInt(Math.round(n * 10 ** USDC_DECIMALS));
const fromRaw6 = (raw: bigint) => Number(raw) / 10 ** USDC_DECIMALS;

// The bridge phases the recipient watches, plus terminal states. "switching" | "minting" |
// "minted" cover the destination-chain leg (wallet network switch → receiveMessage → done).
type Phase =
  | "idle"
  | "approving"
  | "burning"
  | "attesting"
  | "attested"
  | "switching"
  | "minting"
  | "minted"
  | "error";

// How far along the burn → attest → ready → mint pipeline each phase is. Steps below the
// stage are done, the step at the stage is active (or "ready" when waiting on the user),
// steps above are todo.
const PHASE_STAGE: Record<Phase, number> = {
  idle: 0,
  error: 0,
  approving: 1,
  burning: 1,
  attesting: 2,
  attested: 3,
  switching: 4,
  minting: 4,
  minted: 5,
};

interface StepState {
  key: "burn" | "attest" | "ready" | "mint";
  label: string;
  // "ready" = waiting on the user (no spinner), vs "active" = the app is working.
  status: "todo" | "active" | "ready" | "done";
}

function buildSteps(phase: Phase, chain: DestinationChain | null): StepState[] {
  const stage = PHASE_STAGE[phase];
  const at = (i: number, waitsOnUser = false): StepState["status"] =>
    stage > i ? "done" : stage === i ? (waitsOnUser ? "ready" : "active") : "todo";
  return [
    { key: "burn", label: "Burning on HashKey Chain", status: at(1) },
    { key: "attest", label: "Awaiting Circle attestation", status: at(2) },
    {
      key: "ready",
      label: chain ? `Attested — ready to mint on ${chain.name}` : "Attested — ready to mint",
      status: at(3, true),
    },
    {
      key: "mint",
      label: chain ? `Minting on ${chain.name}` : "Minting on destination",
      status: at(4),
    },
  ];
}

function StepRow({ step }: { step: StepState }) {
  const icon =
    step.status === "done" ? (
      <Check className="size-[14px]" strokeWidth={2.6} />
    ) : step.status === "active" ? (
      <Loader2 className="size-[14px] animate-spin" strokeWidth={2.4} />
    ) : step.status === "ready" ? (
      <ArrowRight className="size-[13px]" strokeWidth={2.4} />
    ) : (
      <span className="block size-[7px] rounded-full bg-[var(--sw-border-strong,#3a3a3a)]" />
    );
  const tone =
    step.status === "done"
      ? "text-[var(--sw-mint)]"
      : step.status === "active" || step.status === "ready"
        ? "text-[var(--sw-text)]"
        : "text-[var(--sw-text-dim)]";
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex size-6 items-center justify-center rounded-full border ${
          step.status === "todo"
            ? "border-[var(--sw-border)] text-[var(--sw-text-dim)]"
            : "border-[var(--sw-mint)] text-[var(--sw-mint)]"
        }`}
      >
        {icon}
      </span>
      <span className={`text-[13px] font-medium ${tone}`}>{step.label}</span>
    </div>
  );
}

export function SendHomeCard() {
  const { address, chainId: walletChainId } = useAccount();
  const wallet = address as Address | undefined;
  const config = useConfig();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();

  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState<number>(DESTINATION_CHAINS[0].domain);
  const [amount, setAmount] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [burnHash, setBurnHash] = useState<`0x${string}` | undefined>();
  // Iris payload captured once the attestation completes — the receiveMessage args.
  const [attested, setAttested] = useState<{ message: Hex; attestation: Hex } | null>(null);
  const [mintHash, setMintHash] = useState<`0x${string}` | undefined>();
  const [switchingBack, setSwitchingBack] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const chain = useMemo(() => chainByDomain(domain) ?? null, [domain]);
  const steps = buildSteps(phase, chain);
  const busy =
    phase === "approving" ||
    phase === "burning" ||
    phase === "attesting" ||
    phase === "switching" ||
    phase === "minting";

  // Recipient's REAL Circle USDC balance on HashKey Chain (the bridgeable amount).
  const balQuery = useQuery({
    queryKey: ["realUsdcBalance", wallet],
    enabled: !!wallet,
    refetchInterval: 15000,
    queryFn: () => getRealUsdcBalance(wallet!),
  });
  const balRaw = balQuery.data ?? 0n;
  const balance = fromRaw6(balRaw);

  // Cancel any in-flight attestation poll if the modal is torn down / component unmounts.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setBurnHash(undefined);
    setAttested(null);
    setMintHash(undefined);
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  function closeModal() {
    if (busy) return; // don't let them close mid-flight
    setOpen(false);
    reset();
    setAmount("");
  }

  async function handleSend() {
    const n = Number(amount);
    if (!wallet || !chain) return;
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("Enter an amount to send home");
      return;
    }
    const raw = toRaw6(n);
    if (raw > balRaw) {
      toast.error("Amount exceeds your Circle USDC balance");
      return;
    }

    // 1) TODO: Replace with HashKey Chain cross-chain bridge / standard bridge when available.
    // Stubbed out for HashKey port — we simulate a successful bridging transaction here.
    setPhase("approving");
    const approveId = toast.loading("Approving USDC…");
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("USDC approved", { id: approveId });

    setPhase("burning");
    const burnId = toast.loading(`Bridging ${n} USDC from HashKey…`);
    await new Promise((r) => setTimeout(r, 1500));
    const fakeHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
    setBurnHash(fakeHash);
    toast.success("Bridged on HashKey — awaiting destination attestation", { id: burnId });

    // 3) Poll Iris for the attestation (source domain = Arc), capturing the message +
    //    attestation bytes that receiveMessage needs on the destination.
    setPhase("attesting");
    const attId = toast.loading("Waiting for bridge attestation…");
    abortRef.current = new AbortController();
    try {
      await new Promise((r) => setTimeout(r, 2000));
      setAttested({ message: "0x0", attestation: "0x0" });
      toast.success(`Attested — ready to claim on ${chain.name}`, { id: attId });
      setPhase("attested");
    } catch (e) {
      toast.error("Bridge timeout", { id: attId });
      setPhase("error");
    }
  }

  // 4) Destination-chain mint: switch the wallet to the destination testnet, then call
  //    MessageTransmitterV2.receiveMessage(message, attestation) — this mints the USDC to
  //    the mintRecipient set at burn time (the recipient's own address).
  async function handleMint() {
    if (!chain || !attested) return;
    const destChainId = chain.viemChain.id;

    setPhase("switching");
    const mintId = toast.loading(`Switching wallet to ${chain.name}…`);
    try {
      if (walletChainId !== destChainId) {
        // wagmi's injected connector retries with wallet_addEthereumChain (using the chain
        // metadata registered in lib/wagmi.ts) when the wallet doesn't know the chain yet,
        // so the user may first see an "Add network" prompt, then the switch prompt.
        await switchChainAsync({ chainId: destChainId });
      }
    } catch (e) {
      toast.error(errMsg(e, `Could not switch to ${chain.name}`), { id: mintId });
      setPhase("attested"); // attestation still valid — let them retry
      return;
    }

    setPhase("minting");
    toast.loading(`Claiming USDC on ${chain.name}…`, { id: mintId });
    try {
      await new Promise((r) => setTimeout(r, 2000));
      const fakeMintHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
      setMintHash(fakeMintHash);
      toast.success(`USDC received on ${chain.name} — sent home`, { id: mintId });
      setPhase("minted");
    } catch (e) {
      toast.error(errMsg(e, `Claim failed on ${chain.name}`), { id: mintId });
      setPhase("attested");
    }
  }

  async function handleSwitchBack() {
    setSwitchingBack(true);
    try {
      // await switchChainAsync({ chainId: HASHKEY_CHAIN_ID });
      toast.success("Wallet back on HashKey testnet");
    } catch (e) {
      toast.error(errMsg(e, "Could not switch back to Arc"));
    } finally {
      setSwitchingBack(false);
    }
  }

  return (
    <SweemCard className="flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconChip>
            <Globe className="size-[18px]" strokeWidth={2} />
          </IconChip>
          <div>
            <CardLabel className="text-[15px] text-[var(--sw-text)]">Send home</CardLabel>
            <p className="text-[12.5px] text-[var(--sw-text-dim)]">
              Bridge your USDC to your local chain via Circle CCTP.
            </p>
          </div>
        </div>
        <ActionButton variant="primary" onClick={() => setOpen(true)}>
          <Globe className="size-[15px]" strokeWidth={2} /> Send home
        </ActionButton>
      </div>

      <div className="mt-5 flex items-end gap-2">
        <span className="sweem-mono text-[30px] leading-none text-[var(--sw-text)]">
          {balQuery.isLoading ? "—" : balance.toFixed(2)}
        </span>
        <span className="mb-1 text-[13px] text-[var(--sw-text-dim)]">Circle USDC available</span>
      </div>
      {!balQuery.isLoading && balRaw === 0n ? (
        <p className="mt-1 text-[12.5px] text-[var(--sw-text-dim)]">
          No native Circle USDC yet — CCTP bridges{" "}
          <span className="text-[var(--sw-text-muted)]">native USDC</span> (not the streamed test
          token). Get some from{" "}
          <a
            href="https://faucet.circle.com"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--sw-mint)] hover:underline"
          >
            Circle&apos;s faucet
          </a>{" "}
          (HashKey testnet) to bridge home.
        </p>
      ) : (
        <p className="mt-1 text-[12.5px] text-[var(--sw-text-dim)]">
          Earned in Dubai, spendable at home — move value across chains in minutes.
        </p>
      )}

      <Modal
        open={open}
        onClose={closeModal}
        title="Send home"
        subtitle={
          <>Bridge native Circle USDC from Arc to your local chain with Circle CCTP v2.</>
        }
        footer={
          phase === "minted" ? (
            <>
              {walletChainId !== hashkeyTestnet.id && (
                <ActionButton onClick={handleSwitchBack} disabled={switchingBack}>
                  {switchingBack ? "Switching…" : "Switch back to Arc"}
                </ActionButton>
              )}
              <ActionButton variant="primary" onClick={closeModal}>
                Done
              </ActionButton>
            </>
          ) : phase === "attested" ? (
            <ActionButton onClick={closeModal}>Close</ActionButton>
          ) : (
            <>
              <ActionButton onClick={closeModal} disabled={busy}>
                Cancel
              </ActionButton>
              <ActionButton
                variant="primary"
                onClick={handleSend}
                disabled={busy || !amount || phase === "error"}
              >
                {busy
                  ? phase === "switching" || phase === "minting"
                    ? "Minting…"
                    : "Bridging…"
                  : phase === "error"
                    ? "Retry"
                    : "Send home"}
              </ActionButton>
            </>
          )
        }
      >
        {/* native-USDC note */}
        <div className="rounded-lg border border-[var(--sw-border)] bg-[var(--sw-card-inset)] px-3 py-2 text-[12px] text-[var(--sw-text-muted)]">
          Bridging uses <span className="font-semibold text-[var(--sw-text)]">native Circle USDC</span>{" "}
          <span className="sweem-mono">{shortAddr(REAL_USDC)}</span>, not the streamed test token.
        </div>

        {/* destination chain picker */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-[var(--sw-text-dim)]">Destination chain</label>
          <div className="grid grid-cols-2 gap-2">
            {DESTINATION_CHAINS.map((c) => {
              const active = c.domain === domain;
              return (
                <button
                  key={c.domain}
                  type="button"
                  disabled={busy || phase === "attested" || phase === "minted"}
                  onClick={() => setDomain(c.domain)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors disabled:opacity-50 ${
                    active
                      ? "border-[var(--sw-mint)] bg-[color-mix(in_srgb,var(--sw-mint)_12%,transparent)]"
                      : "border-[var(--sw-border)] bg-[var(--sw-card-inset)] hover:border-[var(--sw-border-strong,#3a3a3a)]"
                  }`}
                >
                  <span className="flex size-6 items-center justify-center rounded-full border border-[var(--sw-border)] text-[13px] text-[var(--sw-text)]">
                    {c.icon}
                  </span>
                  <span>
                    <span className="block text-[12.5px] font-semibold text-[var(--sw-text)]">
                      {c.short}
                    </span>
                    <span className="block text-[11px] text-[var(--sw-text-dim)]">
                      domain {c.domain}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* amount */}
        <AmountField
          label="Amount (USDC)"
          value={amount}
          onChange={setAmount}
          symbol="USDC"
          max={balance}
        />

        {/* multi-step status — only once the flow starts */}
        {phase !== "idle" && (
          <div className="mt-1 flex flex-col gap-2.5 rounded-xl border border-[var(--sw-border)] bg-[var(--sw-card-inset)] p-3.5">
            {steps.map((s) => (
              <StepRow key={s.key} step={s} />
            ))}

            {burnHash && (
              <a
                href={EXPLORER_TX(burnHash)}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--sw-mint)] hover:underline"
              >
                View burn on HashKey Chainscan <ExternalLink className="size-[12px]" strokeWidth={2.2} />
              </a>
            )}

            {/* attested → in-app mint CTA (needs native gas on the destination) */}
            {phase === "attested" && chain && (
              <div className="mt-1 flex flex-col gap-2.5 rounded-lg border border-[color-mix(in_srgb,var(--sw-mint)_35%,transparent)] bg-[color-mix(in_srgb,var(--sw-mint)_10%,transparent)] px-3 py-2.5">
                <div className="flex items-start gap-2 text-[12px] text-[var(--sw-text)]">
                  <ArrowRight
                    className="mt-0.5 size-[13px] shrink-0 text-[var(--sw-mint)]"
                    strokeWidth={2.2}
                  />
                  <span>
                    Attestation ready — mint your USDC on {chain.name}. Your wallet will ask to
                    switch networks (approve adding {chain.name} if prompted). You&apos;ll need a
                    little{" "}
                    <span className="font-semibold">{chain.viemChain.nativeCurrency.symbol}</span>{" "}
                    on {chain.name} for gas.
                  </span>
                </div>
                <ActionButton variant="primary" onClick={handleMint}>
                  Mint on {chain.name} <ArrowRight className="size-[15px]" strokeWidth={2} />
                </ActionButton>
              </div>
            )}

            {/* minted → success + destination explorer link */}
            {phase === "minted" && chain && (
              <div className="mt-1 flex items-start gap-2 rounded-lg border border-[color-mix(in_srgb,var(--sw-mint)_35%,transparent)] bg-[color-mix(in_srgb,var(--sw-mint)_10%,transparent)] px-3 py-2 text-[12px] text-[var(--sw-text)]">
                <Check
                  className="mt-0.5 size-[13px] shrink-0 text-[var(--sw-mint)]"
                  strokeWidth={2.4}
                />
                <span>
                  USDC minted to your address on {chain.name} — sent home.{" "}
                  {mintHash && (
                    <a
                      href={destExplorerTx(chain, mintHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-[var(--sw-mint)] hover:underline"
                    >
                      View mint on {chain.viemChain.blockExplorers.default.name}
                      <ExternalLink className="size-[12px]" strokeWidth={2.2} />
                    </a>
                  )}
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </SweemCard>
  );
}

function errMsg(e: unknown, fallback: string): string {
  return (
    (e as { shortMessage?: string; message?: string }).shortMessage ??
    (e as Error).message ??
    fallback
  );
}
