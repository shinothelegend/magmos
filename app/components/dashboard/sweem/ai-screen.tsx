"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowUp, Wallet } from "lucide-react";

import { CardLabel, IconChip, MoneyValue, SweemCard } from "@/components/sweem-ui/primitives";
import { fromRaw } from "@/lib/tokens";
import { useOrgPool } from "./use-org-pool";
import { ConnectGate } from "./ui";
import { shortAddr } from "./helpers";

const MONTH_S = 2_592_000n;

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What's my runway?",
  "How much am I streaming a month?",
  "Who's on payroll?",
  "How does send-home work?",
];

export function AiScreen() {
  const { wallet, org, state, token, anchorAt } = useOrgPool();
  const decimals = token.decimals;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const context = useMemo(() => {
    const monthlyFor = (rateRaw: bigint, period: bigint) =>
      rateRaw > 0n && period > 0n ? Number((rateRaw * MONTH_S) / period) / 10 ** decimals : 0;
    return {
      org: org?.name,
      monthly: fromRaw(token, state.monthlyRateRaw),
      balance: fromRaw(token, state.balanceRaw),
      runwayMonths:
        state.monthlyRateRaw > 0n ? Number(state.balanceRaw) / Number(state.monthlyRateRaw) : 0,
      streamedToDate: fromRaw(token, state.streamedRaw),
      recipients: state.recipients.map((r) => ({
        name: r.name || shortAddr(r.address),
        monthly: monthlyFor(r.rateRaw, r.ratePeriod) || r.monthlyUsdc,
        status: r.stopped ? "Stopped" : r.paused ? "Paused" : "Streaming",
      })),
    };
  }, [org, state, token, decimals]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    // scroll after paint
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }));
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next, context }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "Sorry, I couldn't answer that." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Something went wrong reaching the assistant." }]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }));
    }
  }

  if (!wallet) {
    return (
      <div className="dashboard-content">
        <ConnectGate message="Connect your wallet to chat with Magmos AI about your payroll." />
      </div>
    );
  }

  const runway = context.runwayMonths;

  return (
    <div className="dashboard-content">
      <div className="mb-6 flex items-center gap-3">
        <IconChip className="text-[var(--sw-mint)]"><Sparkles size={18} /></IconChip>
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-[var(--sw-text)]">Magmos AI</h1>
          <p className="text-[14px] text-[var(--sw-text-muted)]">Your payroll copilot — grounded in live on-chain data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* Chat column */}
        <SweemCard className="flex min-h-[560px] flex-col p-0">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="grid size-14 place-items-center rounded-2xl bg-[rgba(255,106,26,0.14)] text-[var(--sw-mint)]">
                  <Sparkles size={24} />
                </div>
                <p className="mt-4 text-[17px] font-semibold text-[var(--sw-text)]">Ask about your payroll</p>
                <p className="mt-1 max-w-sm text-[13.5px] text-[var(--sw-text-muted)]">
                  I read your live streams, pool balance, and runway from Arc. No signing — just answers.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-full border border-[var(--sw-border)] bg-[var(--sw-card-inset)] px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--sw-text-muted)] transition-colors hover:border-[var(--sw-border-strong)] hover:text-[var(--sw-text)]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                  >
                    <div
                      className={
                        m.role === "user"
                          ? "max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[var(--sw-mint)] px-4 py-2.5 text-[14px] font-medium text-black"
                          : "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-[var(--sw-border)] bg-[var(--sw-card-inset)] px-4 py-2.5 text-[14px] text-[var(--sw-text)]"
                      }
                    >
                      {m.content}
                    </div>
                  </motion.div>
                ))}
                {busy && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[var(--sw-border)] bg-[var(--sw-card-inset)] px-4 py-3">
                      {[0, 1, 2].map((d) => (
                        <motion.span
                          key={d}
                          className="size-1.5 rounded-full bg-[var(--sw-text-muted)]"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-[var(--sw-border)] p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 rounded-xl border border-[var(--sw-border)] bg-[#1b1b1f] px-3 py-2 focus-within:border-[var(--sw-mint)]/60"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your payroll…"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[var(--sw-text)] outline-none placeholder:text-[var(--sw-text-muted)]"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--sw-mint)] text-black transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <ArrowUp size={16} />
              </button>
            </form>
          </div>
        </SweemCard>

        {/* Context sidebar */}
        <div className="space-y-4">
          <SweemCard>
            <CardLabel>Live context</CardLabel>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[var(--sw-text-muted)]">Monthly commitment</span>
                <MoneyValue value={context.monthly} className="text-[15px] text-[var(--sw-text)]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[var(--sw-text-muted)]">Pool balance</span>
                <MoneyValue value={context.balance} className="text-[15px] text-[var(--sw-text)]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[var(--sw-text-muted)]">Runway</span>
                <span className="text-[15px] font-semibold tabular-nums text-[var(--sw-text)]">
                  {runway > 0 ? `${runway.toFixed(1)} mo` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[var(--sw-text-muted)]">Recipients</span>
                <span className="text-[15px] font-semibold tabular-nums text-[var(--sw-text)]">
                  {context.recipients.length}
                </span>
              </div>
            </div>
          </SweemCard>
          <SweemCard>
            <div className="flex items-center gap-2.5">
              <IconChip><Wallet size={16} /></IconChip>
              <div>
                <p className="text-[13px] font-semibold text-[var(--sw-text)]">Read-only assistant</p>
                <p className="text-[12px] text-[var(--sw-text-muted)]">Magmos AI never moves funds — it only reads your on-chain payroll to answer.</p>
              </div>
            </div>
          </SweemCard>
        </div>
      </div>
      {/* anchor kept in scope for future live tickers */}
      <span className="hidden">{anchorAt}</span>
    </div>
  );
}
