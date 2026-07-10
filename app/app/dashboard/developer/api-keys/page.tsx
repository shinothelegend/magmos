"use client";

import { useMemo, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { waitForTransactionReceipt } from "@wagmi/core";
import { erc20Abi } from "viem";
import { toast } from "sonner";
import { Copy, Key, Plus, Trash2, TrendingUp } from "lucide-react";

import { CardLabel, IconChip, MoneyValue, SweemCard } from "@/components/sweem-ui/primitives";
import { ActionButton, Modal, ConnectGate } from "@/components/dashboard/sweem/ui";
import { wagmiConfig } from "@/lib/wagmi";
import {
  MAGMOS_YIELD_VAULT,
  YIELD_VAULT_ABI,
  USDC,
  USDC_DECIMALS,
  EXPLORER_TX,
} from "@/lib/magmos";
import { useSweemApi, type ApiKeyRecord } from "@/lib/api";

const fromRaw6 = (raw: bigint) => Number(raw) / 10 ** USDC_DECIMALS;

function fmtCreated(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ApiKeysPage() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const api = useSweemApi();

  // ── API keys (persisted via the Magmos API → MongoDB) ───────────────────
  const keysQuery = useQuery<ApiKeyRecord[]>({
    queryKey: ["apiKeys", address],
    enabled: !!address,
    queryFn: () => api.listKeys(address!),
  });
  const keys = keysQuery.data ?? [];
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [reveal, setReveal] = useState<ApiKeyRecord | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyRecord | null>(null);

  async function createKey() {
    if (!address) return;
    setCreating(true);
    try {
      const key = await api.createKey(address, newName.trim() || "Untitled key");
      await keysQuery.refetch();
      setCreateOpen(false);
      setNewName("");
      setReveal(key); // key.secret is present exactly once
    } catch {
      toast.error("Could not create key");
    } finally {
      setCreating(false);
    }
  }

  // ── Treasury yield (real MagmosYieldVault, ERC-4626) ────────────────────
  const common = { query: { enabled: !!address, refetchInterval: 8000 } } as const;
  const { data: apyBps } = useReadContract({
    address: MAGMOS_YIELD_VAULT,
    abi: YIELD_VAULT_ABI,
    functionName: "apyBps",
    ...common,
  });
  const { data: position, refetch: refetchPos } = useReadContract({
    address: MAGMOS_YIELD_VAULT,
    abi: YIELD_VAULT_ABI,
    functionName: "maxWithdraw",
    args: address ? [address] : undefined,
    ...common,
  });
  const { data: shares, refetch: refetchShares } = useReadContract({
    address: MAGMOS_YIELD_VAULT,
    abi: YIELD_VAULT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    ...common,
  });
  const { data: usdcBal } = useReadContract({
    address: USDC,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    ...common,
  });

  const apy = apyBps !== undefined ? Number(apyBps as bigint) / 100 : 0;
  const positionUsdc = fromRaw6((position as bigint | undefined) ?? 0n);
  const walletUsdc = fromRaw6((usdcBal as bigint | undefined) ?? 0n);

  const [depositOpen, setDepositOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleDeposit() {
    const amt = Number(amount) || 0;
    if (!address) return toast.error("Connect a wallet first");
    if (amt <= 0) return toast.error("Enter an amount");
    const amtRaw = BigInt(Math.round(amt * 10 ** USDC_DECIMALS));
    if ((usdcBal as bigint | undefined ?? 0n) < amtRaw) return toast.error("Insufficient USDC");
    setBusy(true);
    try {
      const approveHash = await writeContractAsync({
        address: USDC,
        abi: erc20Abi,
        functionName: "approve",
        args: [MAGMOS_YIELD_VAULT, amtRaw],
      });
      toast.message("Approving USDC", { description: "Confirm in your wallet" });
      await waitForTransactionReceipt(wagmiConfig, { hash: approveHash });
      const hash = await writeContractAsync({
        address: MAGMOS_YIELD_VAULT,
        abi: YIELD_VAULT_ABI,
        functionName: "deposit",
        args: [amtRaw, address],
      });
      toast.success(`Deposited ${amt.toLocaleString()} USDC to treasury`, {
        description: `Tx ${hash.slice(0, 12)}…${hash.slice(-10)}`,
        action: { label: "Receipt", onClick: () => window.open(EXPLORER_TX(hash), "_blank") },
      });
      await waitForTransactionReceipt(wagmiConfig, { hash });
      setDepositOpen(false);
      setAmount("");
      refetchPos();
      refetchShares();
    } catch {
      toast.error("Deposit failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleWithdraw() {
    if (!address) return;
    const sh = (shares as bigint | undefined) ?? 0n;
    if (sh <= 0n) return toast.error("Nothing to withdraw");
    setBusy(true);
    try {
      const hash = await writeContractAsync({
        address: MAGMOS_YIELD_VAULT,
        abi: YIELD_VAULT_ABI,
        functionName: "redeem",
        args: [sh, address, address],
      });
      toast.success("Withdrew treasury position", {
        description: `Tx ${hash.slice(0, 12)}…${hash.slice(-10)}`,
        action: { label: "Receipt", onClick: () => window.open(EXPLORER_TX(hash), "_blank") },
      });
      await waitForTransactionReceipt(wagmiConfig, { hash });
      refetchPos();
      refetchShares();
    } catch {
      toast.error("Withdraw failed");
    } finally {
      setBusy(false);
    }
  }

  const snippet = useMemo(
    () =>
      `import { Magmos } from "@magmos/sdk";\n\nconst magmos = new Magmos({ apiKey: process.env.MAGMOS_API_KEY });\n\n// Stream USDC payroll on Arc\nawait magmos.streams.create({\n  recipient: "0x…",\n  monthlyUsdc: 4000,\n});`,
    []
  );

  if (!address) {
    return (
      <div className="dashboard-content">
        <ConnectGate message="Connect your wallet to manage API keys and treasury yield." />
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="mb-6">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-[var(--sw-text)]">Developer</h1>
        <p className="mt-1 text-[14px] text-[var(--sw-text-muted)]">
          API keys, SDK, and treasury yield for building on Magmos.
        </p>
      </div>

      {/* Treasury yield */}
      <SweemCard className="mb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <IconChip className="text-[var(--sw-mint)]"><TrendingUp size={18} /></IconChip>
            <div>
              <CardLabel>Earn yield on idle treasury</CardLabel>
              <p className="mt-1 text-[13px] text-[var(--sw-text-muted)]">
                Testnet yield rail (ERC-4626); routes to Circle&rsquo;s USYC in production.
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[30px] font-semibold tracking-[-0.02em] text-[var(--sw-mint)]">
              {apy.toFixed(2)}%
              <span className="ml-1.5 text-[13px] font-medium text-[var(--sw-text-muted)]">APY</span>
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--sw-border)] bg-[var(--sw-card-inset)] p-4">
            <CardLabel>Your position</CardLabel>
            <div className="mt-2 flex items-baseline gap-1.5">
              <MoneyValue value={positionUsdc} className="text-[24px] text-[var(--sw-text)]" />
              <span className="text-[13px] font-medium text-[var(--sw-text-muted)]">USDC</span>
            </div>
          </div>
          <div className="flex items-end gap-2.5">
            <ActionButton variant="primary" onClick={() => setDepositOpen(true)}>Deposit</ActionButton>
            <ActionButton onClick={handleWithdraw} disabled={busy || !(shares && (shares as bigint) > 0n)}>
              Withdraw
            </ActionButton>
          </div>
        </div>
      </SweemCard>

      {/* API keys */}
      <SweemCard className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardLabel>API keys</CardLabel>
            <p className="mt-1 text-[13px] text-[var(--sw-text-muted)]">
              Authenticate with EIP-191 wallet signatures or a secret key.
            </p>
          </div>
          <ActionButton variant="primary" onClick={() => setCreateOpen(true)}>
            <span className="inline-flex items-center gap-1.5"><Plus size={15} /> Create key</span>
          </ActionButton>
        </div>
        <div className="mt-4 divide-y divide-[var(--sw-border)]">
          {keys.map((k) => (
            <div key={k.id} className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <IconChip><Key size={16} /></IconChip>
                <div>
                  <p className="text-[14px] font-medium text-[var(--sw-text)]">{k.name}</p>
                  <p className="font-mono text-[12.5px] text-[var(--sw-text-muted)]">{k.prefix}••••••••</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[12.5px] text-[var(--sw-text-dim)]">{fmtCreated(k.createdAt)}</span>
                <button
                  type="button"
                  onClick={() => setRevokeTarget(k)}
                  className="text-[var(--sw-text-muted)] transition-colors hover:text-[#ff794b]"
                  aria-label="Revoke key"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {keys.length === 0 && (
            <p className="py-8 text-center text-[13px] text-[var(--sw-text-muted)]">
              {keysQuery.isLoading ? "Loading…" : "No API keys yet — create your first one."}
            </p>
          )}
        </div>
      </SweemCard>

      {/* SDK snippet */}
      <SweemCard>
        <CardLabel>Quickstart</CardLabel>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-[var(--sw-border)] bg-[#141416] p-4 text-[12.5px] leading-relaxed text-[var(--sw-text)]">
          <code>{snippet}</code>
        </pre>
      </SweemCard>

      {/* Create key modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create API key"
        subtitle="Name it so you can recognize it later."
        footer={
          <>
            <ActionButton onClick={() => setCreateOpen(false)}>Cancel</ActionButton>
            <ActionButton variant="primary" disabled={creating} onClick={createKey}>{creating ? "Creating…" : "Create key"}</ActionButton>
          </>
        }
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          autoFocus
          placeholder="e.g. Production"
          className="w-full rounded-xl border border-[var(--sw-border)] bg-[#1b1b1f] px-3 py-2.5 text-[14px] text-[var(--sw-text)] outline-none focus:border-[var(--sw-mint)]/60"
        />
      </Modal>

      {/* Reveal-once modal */}
      <Modal
        open={!!reveal}
        onClose={() => setReveal(null)}
        title="Copy your API key"
        subtitle="You won't be able to see this secret again."
        footer={<ActionButton variant="primary" onClick={() => setReveal(null)}>Done</ActionButton>}
      >
        <div className="flex items-center gap-2 rounded-xl border border-[var(--sw-border)] bg-[#1b1b1f] px-3 py-2.5">
          <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-[var(--sw-mint)]">{reveal?.secret}</code>
          <button
            type="button"
            onClick={() => {
              if (reveal?.secret) {
                navigator.clipboard?.writeText(reveal.secret);
                toast.success("Copied to clipboard");
              }
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--sw-border)] bg-[var(--sw-card-inset)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--sw-text-muted)] hover:text-[var(--sw-text)]"
          >
            <Copy size={13} /> Copy
          </button>
        </div>
      </Modal>

      {/* Revoke confirm modal */}
      <Modal
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        title="Revoke API key"
        subtitle={revokeTarget ? `${revokeTarget.name} (${revokeTarget.prefix}) will stop working immediately.` : ""}
        footer={
          <>
            <ActionButton onClick={() => setRevokeTarget(null)}>Cancel</ActionButton>
            <ActionButton
              variant="primary"
              onClick={async () => {
                if (!address || !revokeTarget) return;
                try {
                  await api.revokeKey(address, revokeTarget.id);
                  await keysQuery.refetch();
                  toast.success("Key revoked");
                } catch {
                  toast.error("Could not revoke key");
                }
                setRevokeTarget(null);
              }}
            >
              Revoke
            </ActionButton>
          </>
        }
      >
        <p className="text-[13.5px] text-[var(--sw-text-muted)]">This cannot be undone.</p>
      </Modal>

      {/* Deposit modal */}
      <Modal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        title="Deposit to treasury"
        subtitle={`Wallet balance: ${walletUsdc.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC`}
        footer={
          <>
            <ActionButton onClick={() => setDepositOpen(false)}>Cancel</ActionButton>
            <ActionButton variant="primary" disabled={busy} onClick={handleDeposit}>
              {busy ? "Confirming…" : "Approve & deposit"}
            </ActionButton>
          </>
        }
      >
        <div className="flex items-center gap-2 rounded-xl border border-[var(--sw-border)] bg-[#1b1b1f] px-3 py-2.5 focus-within:border-[var(--sw-mint)]/60">
          <input
            type="number"
            inputMode="decimal"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="min-w-0 flex-1 bg-transparent text-[20px] font-semibold tabular-nums text-[var(--sw-text)] outline-none"
          />
          <span className="text-[13px] font-semibold text-[var(--sw-text-muted)]">USDC</span>
        </div>
      </Modal>
    </div>
  );
}
