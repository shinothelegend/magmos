import Image from "next/image";
import { Icon } from "./icons";
import { WalletButton } from "./wallet-button";

// Slim top bar for the standalone employee portal. No sidebar toggle (there is
// no sidebar) — just brand on the left, support/feedback + wallet on the right.
export function EmployeeNavbar() {
  return (
    <header className="flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-[var(--sw-border)] px-4 sm:px-6">
      <div className="flex items-center gap-2.5">
        <Image src="/magmos.png" alt="Magmos" width={32} height={32} priority unoptimized className="size-8 shrink-0" />
        <span
          style={{ fontFamily: "var(--font-display)" }}
          className="text-[18px] font-bold tracking-[-0.02em]"
        >
          Magmos
        </span>
        <span className="hidden rounded-md bg-[var(--sw-card-inset)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--sw-text-muted)] sm:inline">
          Beta
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="hidden items-center gap-2 rounded-full border border-[var(--sw-border)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--sw-text-muted)] transition-colors hover:text-[var(--sw-text)] sm:flex"
        >
          <Icon name="support" size={15} strokeWidth={2.4} />
          <span>Support</span>
        </button>
        <button
          type="button"
          className="hidden items-center gap-2 rounded-full border border-[var(--sw-border)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--sw-text-muted)] transition-colors hover:text-[var(--sw-text)] sm:flex"
        >
          <Icon name="feedback" size={15} strokeWidth={2.4} />
          <span>Feedback</span>
        </button>
        <WalletButton />
      </div>
    </header>
  );
}
