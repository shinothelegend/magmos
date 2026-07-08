"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Loader2 } from "lucide-react";

// Gate for app routes (dashboard / onboarding). A disconnected visitor is sent to the
// landing page `/` (where the wallet is connected). We wait until wagmi's auto-reconnect
// settles before deciding, so returning users aren't bounced during the silent reconnect.
export function RequireWallet({ children }: { children: React.ReactNode }) {
  const { address, status } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (status === "disconnected") router.replace("/");
  }, [status, router]);

  if (!address) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b]">
        <Loader2 className="size-5 animate-spin text-white/50" />
      </div>
    );
  }

  return <>{children}</>;
}
