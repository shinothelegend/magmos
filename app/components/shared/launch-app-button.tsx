"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useConnect } from "wagmi";

// Wallet-aware "Launch app" CTA for the landing page. If a wallet is connected it goes
// straight to /dashboard (which routes unregistered orgs on to /onboarding). Otherwise it
// connects (wagmi injected) and routes once connected.
export function LaunchAppButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (pending && isConnected) {
      setPending(false);
      router.push("/dashboard");
    }
  }, [pending, isConnected, router]);

  const onClick = () => {
    if (isConnected) {
      router.push("/dashboard");
      return;
    }
    const connector = connectors[0];
    if (connector) {
      setPending(true);
      connect({ connector });
    }
  };

  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  );
}
