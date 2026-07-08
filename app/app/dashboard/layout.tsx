import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { RequireWallet } from "@/components/dashboard/require-wallet";
import { Toaster } from "sonner";

// Wallet/react-query providers live in the root layout (global). The dashboard
// shares the marketing site's typeface (Poppins) so type + weights match `/`.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RequireWallet>
        <DashboardLayout>{children}</DashboardLayout>
      </RequireWallet>
      <Toaster theme="dark" richColors position="bottom-right" />
    </>
  );
}
