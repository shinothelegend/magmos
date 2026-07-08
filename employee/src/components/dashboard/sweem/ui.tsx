"use client";

import type { ReactNode } from "react";

// Small shared primitives for the recipient portal screens. Styled with the
// `.sweem-*` / `.dashboard-*` classes (which reuse the dashboard --dash-* tokens)
// so everything matches the existing dashboard look.

export function Stat({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="sweem-stat">
      <p className="sweem-stat-label">{label}</p>
      <div className={`sweem-stat-value ${mono ? "sweem-stat-value-mono" : ""}`}>{value}</div>
    </div>
  );
}

export function ActionButton({
  children,
  onClick,
  disabled,
  variant = "secondary",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
}) {
  return (
    <button
      className={`dashboard-screen-action dashboard-screen-action-${variant}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="sweem-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="sweem-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="sweem-modal-title">{title}</h2>
        {subtitle ? <p className="sweem-modal-sub">{subtitle}</p> : null}
        <div className="mt-4 flex flex-col gap-3">{children}</div>
        {footer ? <div className="sweem-actions mt-5 justify-end">{footer}</div> : null}
      </div>
    </div>
  );
}

// Quick-fill chips (25/50/75/Max) that pick a fraction of `max` for an amount field.
export function PercentChips({
  max,
  onPick,
  disabled,
}: {
  max: number;
  onPick: (value: number) => void;
  disabled?: boolean;
}) {
  const opts = [25, 50, 75, 100];
  const pick = (pct: number) =>
    onPick(pct === 100 ? max : Math.round(((max * pct) / 100) * 1e6) / 1e6);
  return (
    <div className="flex gap-1.5">
      {opts.map((pct) => (
        <button
          key={pct}
          type="button"
          disabled={disabled || max <= 0}
          onClick={() => pick(pct)}
          className="rounded-lg border border-[var(--sw-border)] bg-[var(--sw-card-inset)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--sw-text-muted)] transition-colors hover:border-[var(--sw-border-strong)] hover:text-[var(--sw-text)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pct === 100 ? "Max" : `${pct}%`}
        </button>
      ))}
    </div>
  );
}

// A labelled decimal amount input, with optional Max/percent quick-fill chips when
// a `max` is supplied.
export function AmountField({
  label,
  value,
  onChange,
  symbol = "USDC",
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  symbol?: string;
  max?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-[var(--sw-text-dim)]">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        className="sweem-input w-full"
        placeholder={symbol}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "" || /^\d*\.?\d*$/.test(v)) onChange(v);
        }}
      />
      {max != null && max > 0 && (
        <div className="flex justify-end">
          <PercentChips max={max} onPick={(v) => onChange(String(v))} />
        </div>
      )}
    </div>
  );
}

export function ConnectGate({ message }: { message: string }) {
  return <div className="sweem-gate">{message}</div>;
}
