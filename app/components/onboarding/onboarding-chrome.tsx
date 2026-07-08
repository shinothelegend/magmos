"use client";

import Image from "next/image";
import Link from "next/link";
import { WalletButton } from "@/components/dashboard/wallet-button";

// Minimal full-screen chrome for the onboarding wizard. Scopes the `.sw-dash`
// theme (so --sw-* tokens resolve) + ambient glow, a slim header (brand, back-to
// -site, wallet), and a centered content column. No org sidebar, it's escapable.
export function OnboardingChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="sw-dash relative flex min-h-screen w-full flex-col bg-[var(--sw-bg)] text-[var(--sw-text)]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(188,174,247,0.06),transparent_55%)]" />

      <header className="relative z-10 flex h-[60px] shrink-0 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Image src="/magmos.png" alt="Magmos" width={32} height={32} priority className="size-8 shrink-0" />
          <span className="text-[17px] font-semibold tracking-[-0.02em]">Magmos</span>
          <span className="hidden rounded-md bg-[var(--sw-card-inset)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--sw-text-muted)] sm:inline">
            Setup
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden text-[12.5px] text-[var(--sw-text-muted)] transition-colors hover:text-[var(--sw-text)] sm:block"
          >
            Back to site
          </Link>
          <WalletButton />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-start justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
