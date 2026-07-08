"use client";

import type { ReactNode } from "react";

// Small shared primitives for the Magmos dashboard screens. Styled with the
// `.sweem-*` / `--sw-*` tokens so everything matches the existing dashboard look.

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
      <div className={`sweem-stat-value ${mono ? "sweem-stat-value-mono" : ""}`}>
        {value}
      </div>
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

export function ConnectGate({ message }: { message: string }) {
  return <div className="sweem-gate">{message}</div>;
}
