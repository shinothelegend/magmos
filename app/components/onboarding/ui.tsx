"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const onbInputCls =
  "w-full rounded-xl border border-[var(--sw-border)] bg-[var(--sw-card-inset)] px-3.5 py-2.5 text-[14px] text-[var(--sw-text)] outline-none transition-colors placeholder:text-[var(--sw-text-dim)] focus:border-[var(--sw-border-strong)]";

export function Card({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--sw-border)] bg-[var(--sw-card)] p-6 sm:p-8">
      <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[var(--sw-text)]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--sw-text-muted)]">
          {subtitle}
        </p>
      )}
      <div className="mt-6">{children}</div>
      {footer && <div className="mt-7 flex items-center justify-between gap-3">{footer}</div>}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  loading,
  type = "button",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--sw-mint)] px-5 py-2.5 text-[13.5px] font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-medium text-[var(--sw-text-muted)] transition-colors hover:text-[var(--sw-text)] disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-medium text-[var(--sw-text-muted)]">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-[11.5px] text-[var(--sw-text-dim)]">{hint}</span>}
    </label>
  );
}
