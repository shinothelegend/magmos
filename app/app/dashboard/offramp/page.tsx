import { DashboardPageShell, EmptyIllustration } from "@/components/dashboard/dashboard-screen";

export default function OfframpPage() {
  return (
    <DashboardPageShell
      title="Offramp to Bank"
      subtitle="Withdraw your stablecoin balance straight to a linked bank account."
    >
      <div className="flex min-h-[calc(100vh-180px)] w-full items-center justify-center">
        <EmptyIllustration
          title="Coming soon"
          description="Bank offramp is under construction. You’ll soon be able to cash out USDC to your bank in a few clicks."
        />
      </div>
    </DashboardPageShell>
  );
}
