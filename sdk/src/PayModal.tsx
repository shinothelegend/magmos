import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useAccount, useConnect, useDisconnect, useWriteContract, useConfig } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { theme } from "./theme";
import { TOKENS, type TokenSymbol } from "./tokens";
import { buildPaymentRequest } from "./payment";
import { fetchCheckoutConfig, DEFAULT_API_BASE } from "./config";
import type { CheckoutConfig, PaymentResult } from "./types";

type Status = "loading" | "form" | "connecting" | "processing" | "success" | "error";

export interface PayModalProps {
  open: boolean;
  onClose: () => void;
  /** Publishable key (pk_…) issued from the Magmos dashboard. */
  apiKey: string;
  /** Amount to charge, in human units of the selected token. */
  amount: number;
  /** Lock the payment to a single token; omit to let the payer choose. */
  token?: TokenSymbol;
  /** Override the backend base URL (defaults to Magmos's hosted API). */
  apiBase?: string;
  /** Local-dev overrides so you can test without a live key. */
  recipient?: string;
  merchant?: string;
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: Error) => void;
}

const NETWORK_FEE: Record<TokenSymbol, number> = { USDC: 0.01 };
const TOKEN_NAME: Record<TokenSymbol, string> = { USDC: "USD Coin" };

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 4 });

export function PayModal(props: PayModalProps) {
  const { open, onClose, apiKey, amount, token: lockedToken, apiBase = DEFAULT_API_BASE } = props;

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();
  const wagmiConfig = useConfig();

  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<Status>("loading");
  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  const [token, setToken] = useState<TokenSymbol>(lockedToken ?? "USDC");
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  // Resolve merchant config whenever the modal opens.
  useEffect(() => {
    if (!open) return;
    let active = true;
    setStatus("loading");
    setError(null);
    setResult(null);
    fetchCheckoutConfig({
      apiKey,
      apiBase,
      overrides: { recipient: props.recipient, merchant: props.merchant },
    })
      .then((cfg) => {
        if (!active) return;
        setConfig(cfg);
        setToken(lockedToken ?? cfg.tokens[0] ?? "USDC");
        setStatus("form");
      })
      .catch((e: Error) => {
        if (!active) return;
        setError(e.message);
        setStatus("error");
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, apiKey, apiBase]);

  const tokens = useMemo<TokenSymbol[]>(
    () => (lockedToken ? [lockedToken] : config?.tokens ?? ["USDC"]),
    [lockedToken, config],
  );

  const fee = NETWORK_FEE[token];
  const total = amount + fee;

  const pay = async () => {
    if (!config) return;
    setStatus("processing");
    setError(null);
    try {
      const hash = await writeContractAsync(
        buildPaymentRequest({ token: TOKENS[token], amount, recipient: config.recipient }),
      );
      await waitForTransactionReceipt(wagmiConfig, { hash });
      const payment: PaymentResult = { txHash: hash, amount, token, recipient: config.recipient };
      setResult(payment);
      setStatus("success");
      props.onSuccess?.(payment);
    } catch (e) {
      const err = e instanceof Error ? e : new Error("Payment failed");
      setError(err.message);
      setStatus("error");
      props.onError?.(err);
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div style={s.overlay}>
      <div style={s.scrim} onClick={onClose} />
      <div role="dialog" aria-modal="true" style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {config?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.logoUrl} alt={config.merchant} width={28} height={28} style={{ borderRadius: 8 }} />
            ) : null}
            <span style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>
              {config?.merchant ?? "Checkout"}
            </span>
          </div>
          <button aria-label="Close" onClick={onClose} style={s.iconBtn}>
            ✕
          </button>
        </div>

        {status === "loading" && <Centered text="Loading checkout…" />}
        {status === "error" && (
          <div style={{ padding: "32px 24px", textAlign: "center" }}>
            <p style={{ color: "#ff6b6b", fontSize: 14, fontWeight: 600 }}>Payment error</p>
            <p style={{ marginTop: 6, color: theme.textMuted, fontSize: 13 }}>{error}</p>
            <button style={{ ...s.payBtn, marginTop: 20 }} onClick={() => setStatus("form")}>
              Try again
            </button>
          </div>
        )}

        {status === "success" && result && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px", textAlign: "center" }}>
            <div style={s.successMark}>✓</div>
            <h2 style={{ marginTop: 18, fontSize: 20, fontWeight: 600, color: theme.text }}>Payment successful</h2>
            <p style={{ marginTop: 6, fontSize: 13.5, color: theme.textMuted }}>
              You paid <b style={{ color: theme.text }}>{fmt(result.amount)} {result.token}</b> to {config?.merchant}
            </p>
            <a href={`https://testnet.arcscan.app/tx/${result.txHash}`} target="_blank" rel="noreferrer" style={{ marginTop: 8, fontSize: 12, color: theme.mint }}>
              View on explorer
            </a>
            <button style={{ ...s.payBtn, marginTop: 24 }} onClick={onClose}>Done</button>
          </div>
        )}

        {(status === "form" || status === "processing" || status === "connecting") && config && (
          <>
            {/* Amount */}
            <div style={{ padding: "24px 24px 0", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: theme.textMuted }}>Pay {config.merchant}</p>
              <div style={{ marginTop: 4, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8 }}>
                <span style={{ fontSize: 40, fontWeight: 600, lineHeight: 1, color: theme.text }}>{fmt(amount)}</span>
                <span style={{ marginBottom: 4, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 15, fontWeight: 600, color: theme.textMuted }}>
                  <TokenLogo symbol={token} size={18} />
                  {token}
                </span>
              </div>
            </div>

            {/* Token picker */}
            <div style={{ padding: "24px 24px 0" }}>
              <p style={s.sectionLabel}>Pay with</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {tokens.map((t) => {
                  const active = t === token;
                  return (
                    <button key={t} onClick={() => !lockedToken && setToken(t)} style={s.method(active)}>
                      <TokenLogo symbol={t} size={32} />
                      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{TOKEN_NAME[t]}</p>
                        <p style={{ fontSize: 12, color: theme.textDim }}>Pay with {t} on HashKey Chain</p>
                      </div>
                      <span style={s.radio(active)}>{active ? "✓" : ""}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div style={s.summary}>
              <Row label="Amount" value={`${fmt(amount)} ${token}`} />
              <Row label="Network fee" value={`${fmt(fee)} ${token}`} />
              <div style={{ height: 1, background: theme.border, margin: "8px 0" }} />
              <Row label="Total" value={`${fmt(total)} ${token}`} bold />
            </div>

            {/* Action */}
            <div style={{ padding: "20px 24px 24px" }}>
              {isConnected ? (
                <button style={s.payBtn} onClick={pay} disabled={status === "processing"}>
                  {status === "processing" ? "Processing…" : `Pay ${fmt(total)} ${token}`}
                </button>
              ) : (
                <ConnectArea
                  wallets={connectors.map((c) => ({ name: c.name, icon: (c as { icon?: string }).icon }))}
                  onPick={(name) => {
                    const c = connectors.find((x) => x.name === name);
                    if (c) connect({ connector: c });
                  }}
                />
              )}
              <p style={s.secured}>🔒 Payments secured on the HashKey Chain network</p>
              {isConnected && address && (
                <button onClick={() => disconnect()} style={s.disconnect}>
                  {address.slice(0, 6)}…{address.slice(-4)} · Disconnect
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

/* ── small pieces ─────────────────────────────────────────────────────── */

function ConnectArea({ wallets, onPick }: { wallets: { name: string; icon?: string }[]; onPick: (name: string) => void }) {
  if (wallets.length === 0) {
    return (
      <div style={{ ...s.payBtn, background: theme.bgInset, color: theme.textMuted, cursor: "default", textAlign: "center" }}>
        No wallet detected — install one to continue
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {wallets.map((w) => (
        <button key={w.name} onClick={() => onPick(w.name)} style={s.walletBtn}>
          {w.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={w.icon} alt="" width={20} height={20} style={{ borderRadius: 5 }} />
          ) : null}
          Connect {w.name}
        </button>
      ))}
    </div>
  );
}

function TokenLogo({ symbol, size }: { symbol: TokenSymbol; size: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={TOKENS[symbol].icon} alt={symbol} width={size} height={size} style={{ borderRadius: "50%" }} />;
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
      <span style={{ color: bold ? theme.text : theme.textMuted, fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{ color: theme.text, fontWeight: bold ? 600 : 400 }}>{value}</span>
    </div>
  );
}

function Centered({ text }: { text: string }) {
  return <div style={{ padding: "48px 24px", textAlign: "center", color: theme.textMuted, fontSize: 13 }}>{text}</div>;
}

/* ── inline styles ────────────────────────────────────────────────────── */

const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 2147483000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    fontFamily: theme.font,
  } as CSSProperties,
  scrim: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" } as CSSProperties,
  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 420,
    borderRadius: theme.radius,
    border: `1px solid ${theme.border}`,
    background: theme.bg,
    boxShadow: "0 40px 100px -30px rgba(0,0,0,0.85)",
    overflow: "hidden",
    color: theme.text,
  } as CSSProperties,
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" } as CSSProperties,
  iconBtn: { width: 32, height: 32, borderRadius: "50%", border: "none", background: "transparent", color: theme.textMuted, cursor: "pointer", fontSize: 15 } as CSSProperties,
  sectionLabel: { fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.4, color: theme.textMuted, textAlign: "center", margin: 0 } as CSSProperties,
  method: (active: boolean) =>
    ({
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: 12,
      borderRadius: 16,
      border: `1px solid ${active ? theme.borderStrong : theme.border}`,
      background: active ? theme.bgInset : "transparent",
      cursor: "pointer",
    }) as CSSProperties,
  radio: (active: boolean) =>
    ({
      width: 20,
      height: 20,
      flexShrink: 0,
      borderRadius: "50%",
      border: `1px solid ${active ? theme.mint : theme.borderStrong}`,
      background: active ? theme.mint : "transparent",
      color: "#000",
      fontSize: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }) as CSSProperties,
  summary: { margin: "24px 24px 0", display: "flex", flexDirection: "column", gap: 8, borderTop: `1px solid ${theme.border}`, paddingTop: 16 } as CSSProperties,
  payBtn: { width: "100%", borderRadius: 16, border: "none", background: theme.mint, color: "#000", padding: "14px 0", fontSize: 15, fontWeight: 600, cursor: "pointer" } as CSSProperties,
  walletBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", borderRadius: 16, border: `1px solid ${theme.border}`, background: theme.bgInset, color: theme.text, padding: "12px 0", fontSize: 14, fontWeight: 600, cursor: "pointer" } as CSSProperties,
  secured: { marginTop: 12, textAlign: "center", fontSize: 11.5, color: theme.textDim } as CSSProperties,
  disconnect: { display: "block", margin: "10px auto 0", border: "none", background: "transparent", color: theme.textMuted, fontSize: 11.5, cursor: "pointer" } as CSSProperties,
  successMark: { width: 64, height: 64, borderRadius: "50%", background: theme.mint, color: "#000", fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 } as CSSProperties,
};
