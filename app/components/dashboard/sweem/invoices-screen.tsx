"use client";

import { useMemo, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, Receipt, Send } from "lucide-react";
import { erc20Abi, isAddress, type Address } from "viem";

import { CardLabel, IconChip, MoneyValue, SweemCard } from "@/components/sweem-ui/primitives";
import { TokenIcon } from "@/components/sweem-ui/token-icon";
import { cn } from "@/lib/utils";
import { toRaw, TOKENS } from "@/lib/tokens";
import { wagmiConfig } from "@/lib/wagmi";
import { EXPLORER_TX, USDC } from "@/lib/magmos";
import { ActionButton, ConnectGate, Modal } from "./ui";
import { shortAddr } from "./helpers";

// Magmos has no on-chain invoice contract, so the list is scaffolded from a few
// tasteful sample invoices in local state (mirrors how Sweem seeded mock data).
// "Pay" is real, though: it fires an ERC-20 USDC transfer on Arc, waits for the
// receipt, then flips the row to paid.

type InvoiceStatus = "paid" | "pending" | "overdue";

interface Invoice {
  id: string;
  recipient: { name: string; address: Address };
  amount: number; // USDC
  status: InvoiceStatus;
  issuedDate: string; // ISO yyyy-mm-dd
  dueDate: string; // ISO yyyy-mm-dd
}

const token = TOKENS.USDC;

const SAMPLE_INVOICES: Invoice[] = [
  {
    id: "INV-2041",
    recipient: { name: "Amara Okafor", address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" },
    amount: 4200,
    status: "pending",
    issuedDate: "2026-07-01",
    dueDate: "2026-07-18",
  },
  {
    id: "INV-2040",
    recipient: { name: "Horizon Design Studio", address: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30" },
    amount: 1850,
    status: "paid",
    issuedDate: "2026-07-02",
    dueDate: "2026-07-09",
  },
  {
    id: "INV-2039",
    recipient: { name: "Priya Nair", address: "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E" },
    amount: 3600,
    status: "overdue",
    issuedDate: "2026-06-16",
    dueDate: "2026-07-02",
  },
  {
    id: "INV-2038",
    recipient: { name: "Mateo Duarte", address: "0x8ba1f109551bD432803012645Ac136ddd64DBA72" },
    amount: 920,
    status: "pending",
    issuedDate: "2026-07-05",
    dueDate: "2026-07-20",
  },
  {
    id: "INV-2037",
    recipient: { name: "Layla Haddad", address: "0xdD870fA1b7C4700F2BD7f44238821C26f7392148" },
    amount: 5400,
    status: "paid",
    issuedDate: "2026-07-03",
    dueDate: "2026-07-08",
  },
  {
    id: "INV-2036",
    recipient: { name: "Kenji Watanabe", address: "0x583031D1113aD414F02576BD6afaBfb302140225" },
    amount: 2750,
    status: "pending",
    issuedDate: "2026-07-03",
    dueDate: "2026-07-15",
  },
];

const STATUS: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "var(--sw-lavender)", bg: "rgba(255,180,61,0.14)" },
  paid: { label: "Paid", color: "var(--sw-mint)", bg: "rgba(255,106,26,0.14)" },
  overdue: { label: "Overdue", color: "#ff794b", bg: "rgba(255,121,75,0.14)" },
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function StatusPill({ status }: { status: InvoiceStatus }) {
  const s = STATUS[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      <span className="size-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

export function InvoicesScreen() {
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [invoices, setInvoices] = useState<Invoice[]>(SAMPLE_INVOICES);
  const [seq, setSeq] = useState(2042);
  const [payingId, setPayingId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", amount: "", dueDate: "" });

  // Metrics derived from the sample data. Outstanding = everything unpaid
  // (pending + overdue); Overdue is the risk subset, surfaced on its own.
  const metrics = useMemo(() => {
    let outstanding = 0;
    let outstandingCount = 0;
    let paid = 0;
    let paidCount = 0;
    let overdue = 0;
    let overdueCount = 0;
    for (const inv of invoices) {
      if (inv.status === "paid") {
        paid += inv.amount;
        paidCount++;
      } else {
        outstanding += inv.amount;
        outstandingCount++;
      }
      if (inv.status === "overdue") {
        overdue += inv.amount;
        overdueCount++;
      }
    }
    return { outstanding, outstandingCount, paid, paidCount, overdue, overdueCount };
  }, [invoices]);

  // Real payment: an ERC-20 USDC transfer to the invoice recipient on Arc.
  async function handlePay(inv: Invoice) {
    if (!isConnected) return toast.error("Connect a wallet first");
    if (payingId) return;
    setPayingId(inv.id);
    try {
      const hash = await writeContractAsync({
        address: USDC,
        abi: erc20Abi,
        functionName: "transfer",
        args: [inv.recipient.address, toRaw(token, inv.amount)],
      });
      toast.success(`Paid ${inv.amount.toLocaleString()} USDC to ${inv.recipient.name}`, {
        description: "View on Arcscan",
        action: { label: "Receipt", onClick: () => window.open(EXPLORER_TX(hash), "_blank") },
      });
      await waitForTransactionReceipt(wagmiConfig, { hash });
      setInvoices((prev) =>
        prev.map((x) => (x.id === inv.id ? { ...x, status: "paid" as const } : x))
      );
    } catch {
      toast.error("Payment failed");
    } finally {
      setPayingId(null);
    }
  }

  function handleCreate() {
    const amt = Number(form.amount) || 0;
    const addr = form.address.trim();
    if (!form.name.trim()) return toast.error("Enter a recipient name");
    if (!isAddress(addr)) return toast.error("Enter a valid wallet address");
    if (amt <= 0) return toast.error("Enter an invoice amount");
    const inv: Invoice = {
      id: `INV-${seq}`,
      recipient: { name: form.name.trim(), address: addr },
      amount: amt,
      status: "pending",
      issuedDate: today(),
      dueDate: form.dueDate || today(),
    };
    setInvoices((prev) => [inv, ...prev]);
    setSeq((s) => s + 1);
    setCreateOpen(false);
    setForm({ name: "", address: "", amount: "", dueDate: "" });
    toast.success(`Invoice ${inv.id} created`, {
      description: `${amt.toLocaleString()} USDC to ${inv.recipient.name}`,
    });
  }

  if (!isConnected) {
    return (
      <div className="dashboard-content">
        <ConnectGate message="Connect your wallet to view and pay invoices." />
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-[var(--sw-text)]">Invoices</h1>
          <p className="mt-1 text-[14px] text-[var(--sw-text-muted)]">
            Bill clients and settle in USDC on Arc — one signature per invoice.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--sw-border)] bg-[var(--sw-card-inset)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--sw-text)]">
            <TokenIcon token={token} size={15} /> USDC
          </span>
          <ActionButton variant="primary" onClick={() => setCreateOpen(true)}>
            <span className="inline-flex items-center gap-1.5">
              <Plus size={15} /> Create invoice
            </span>
          </ActionButton>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SweemCard>
          <CardLabel>Outstanding</CardLabel>
          <div className="mt-2 flex items-baseline gap-1.5">
            <MoneyValue value={metrics.outstanding} className="text-[30px] text-[var(--sw-text)]" />
            <span className="text-[13px] font-medium text-[var(--sw-text-muted)]">USDC</span>
          </div>
          <p className="mt-1 text-[12.5px] text-[var(--sw-text-muted)]">
            {metrics.outstandingCount} open invoice{metrics.outstandingCount === 1 ? "" : "s"}
          </p>
        </SweemCard>
        <SweemCard>
          <CardLabel>Paid this month</CardLabel>
          <div className="mt-2 flex items-baseline gap-1.5">
            <MoneyValue value={metrics.paid} className="text-[30px] text-[var(--sw-mint)]" />
            <span className="text-[13px] font-medium text-[var(--sw-text-muted)]">USDC</span>
          </div>
          <p className="mt-1 text-[12.5px] text-[var(--sw-text-muted)]">
            {metrics.paidCount} settled on Arc
          </p>
        </SweemCard>
        <SweemCard>
          <CardLabel>Overdue</CardLabel>
          <div className="mt-2 flex items-baseline gap-1.5">
            <MoneyValue value={metrics.overdue} className="text-[30px] text-[#ff794b]" />
            <span className="text-[13px] font-medium text-[var(--sw-text-muted)]">USDC</span>
          </div>
          <p className="mt-1 text-[12.5px] text-[var(--sw-text-muted)]">
            {metrics.overdueCount} past due date
          </p>
        </SweemCard>
      </div>

      {/* Invoices table */}
      <SweemCard className="mt-4">
        <div className="flex items-center justify-between">
          <div>
            <CardLabel>All invoices</CardLabel>
            <p className="mt-1 text-[13px] text-[var(--sw-text-muted)]">
              Pay open invoices with a USDC transfer on Arc
            </p>
          </div>
          <IconChip>
            <Receipt size={16} />
          </IconChip>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-[var(--sw-border)] text-left text-[11px] uppercase tracking-wide text-[var(--sw-text-dim)]">
                <th className="pb-2.5 font-medium">Invoice</th>
                <th className="pb-2.5 font-medium">Recipient</th>
                <th className="pb-2.5 font-medium">Amount</th>
                <th className="pb-2.5 font-medium">Due</th>
                <th className="pb-2.5 font-medium">Status</th>
                <th className="pb-2.5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[13px] text-[var(--sw-text-muted)]">
                    No invoices yet — create your first one.
                  </td>
                </tr>
              )}
              {invoices.map((inv) => {
                const paying = payingId === inv.id;
                return (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-[var(--sw-border)] last:border-0"
                  >
                    <td className="py-3.5">
                      <div className="font-mono text-[13px] font-medium text-[var(--sw-text)]">{inv.id}</div>
                      <div className="text-[12px] text-[var(--sw-text-muted)]">
                        Issued {fmtDate(inv.issuedDate)}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-medium text-[var(--sw-text)]">{inv.recipient.name}</div>
                      <div className="text-[12px] text-[var(--sw-text-muted)]">
                        {shortAddr(inv.recipient.address)}
                      </div>
                    </td>
                    <td className="py-3.5 tabular-nums text-[var(--sw-text)]">
                      {inv.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      <span className="text-[12px] text-[var(--sw-text-muted)]">USDC</span>
                    </td>
                    <td className="py-3.5 tabular-nums">
                      <span
                        className={cn(
                          "text-[13px]",
                          inv.status === "overdue" ? "text-[#ff794b]" : "text-[var(--sw-text-muted)]"
                        )}
                      >
                        {fmtDate(inv.dueDate)}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <StatusPill status={inv.status} />
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center justify-end">
                        {inv.status === "paid" ? (
                          <span className="text-[12.5px] font-medium text-[var(--sw-text-dim)]">Settled</span>
                        ) : (
                          <button
                            type="button"
                            disabled={!!payingId}
                            onClick={() => handlePay(inv)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--sw-mint)] px-3 py-1.5 text-[12.5px] font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Send size={13} /> {paying ? "Paying…" : "Pay"}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SweemCard>

      {/* Create invoice modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create invoice"
        subtitle="Bill a client in USDC. Payable on Arc the moment it's created."
        footer={
          <>
            <ActionButton onClick={() => setCreateOpen(false)}>Cancel</ActionButton>
            <ActionButton variant="primary" onClick={handleCreate}>
              Create invoice
            </ActionButton>
          </>
        }
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-medium text-[var(--sw-text-muted)]">Recipient</span>
          <input
            type="text"
            autoFocus
            className="rounded-xl border border-[var(--sw-border)] bg-[#1b1b1f] px-3 py-2.5 text-[14px] text-[var(--sw-text)] outline-none transition-colors placeholder:text-[var(--sw-text-muted)] focus:border-[var(--sw-mint)]/60"
            placeholder="Acme Studio or Jane Doe"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-medium text-[var(--sw-text-muted)]">Wallet address</span>
          <input
            type="text"
            spellCheck={false}
            className="rounded-xl border border-[var(--sw-border)] bg-[#1b1b1f] px-3 py-2.5 font-mono text-[13px] text-[var(--sw-text)] outline-none transition-colors placeholder:text-[var(--sw-text-muted)] focus:border-[var(--sw-mint)]/60"
            placeholder="0x…"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-medium text-[var(--sw-text-muted)]">Amount</span>
          <div className="flex items-center gap-2 rounded-xl border border-[var(--sw-border)] bg-[#1b1b1f] px-3 py-2.5 focus-within:border-[var(--sw-mint)]/60">
            <input
              type="number"
              inputMode="decimal"
              className="min-w-0 flex-1 bg-transparent text-[20px] font-semibold tabular-nums text-[var(--sw-text)] outline-none placeholder:font-normal placeholder:text-[var(--sw-text-muted)]"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            />
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--sw-card-inset)] px-2.5 py-1 text-[12px] font-semibold text-[var(--sw-text)]">
              <TokenIcon token={token} size={15} /> USDC
            </span>
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-medium text-[var(--sw-text-muted)]">Due date</span>
          <input
            type="date"
            className="rounded-xl border border-[var(--sw-border)] bg-[#1b1b1f] px-3 py-2.5 text-[14px] text-[var(--sw-text)] outline-none transition-colors [color-scheme:dark] focus:border-[var(--sw-mint)]/60"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          />
        </label>
      </Modal>
    </div>
  );
}
