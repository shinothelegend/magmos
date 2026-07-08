"use client";

import { Toaster } from "sonner";
import { DashboardProviders } from "./providers";
import { EmployeeNavbar } from "./employee-navbar";
import { ScrollArea } from "@/components/ui/scroll-area";

// Standalone employee portal shell. Mirrors the org dashboard-layout (the
// `.sw-dash` wrapper + ambient glow + scroll container that the `--sw-*` theme
// is scoped to) MINUS the org sidebar/mobile scrim. Wraps the dapp-kit + react
// -query providers so wallet + chain context is available to the whole tree.
export function EmployeeShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProviders>
      <div className="sw-dash flex h-screen w-full overflow-hidden bg-[var(--sw-bg)] text-[var(--sw-text)]">
        {/* Ambient glow */}
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(188,174,247,0.05),transparent_55%)]" />

        <div className="relative z-10 flex min-w-0 flex-1 flex-col">
          <EmployeeNavbar />
          <ScrollArea className="min-h-0 flex-1" viewportClassName="[&>div]:!block">
            <main>{children}</main>
          </ScrollArea>
        </div>
      </div>
      <Toaster richColors position="bottom-right" />
    </DashboardProviders>
  );
}
