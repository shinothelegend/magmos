"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, Field, PrimaryButton, onbInputCls } from "../ui";
import { WalletButton } from "@/components/dashboard/wallet-button";
import type { SweemApi } from "../onboarding-wizard";

export function ConnectStep({
  api,
  wallet,
  onNext,
}: {
  api: SweemApi;
  wallet: string | undefined;
  onNext: () => void;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      toast.error("Enter your organization name");
      return;
    }
    setBusy(true);
    try {
      await api.ensureOrg(name.trim());
      await api.orgQuery.refetch();
      toast.success("Organization created");
      onNext();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!wallet) {
    return (
      <Card
        title="Connect your wallet"
        subtitle="Your organization is identified by your Arc wallet address. Connect to begin onboarding."
      >
        <WalletButton />
      </Card>
    );
  }

  return (
    <Card
      title="Create your organization"
      subtitle="Name your org to start streaming USDC payroll on HashKey Chain."
      footer={
        <>
          <span className="text-[12px] text-[var(--sw-text-dim)]">Step 1 of 2</span>
          <PrimaryButton onClick={handleCreate} loading={busy}>
            Create &amp; continue
          </PrimaryButton>
        </>
      }
    >
      <Field label="Organization name">
        <input
          className={onbInputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Inc."
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
          autoFocus
        />
      </Field>
      <button
        type="button"
        onClick={() => setName("Magmos Demo Co")}
        className="mt-2.5 text-[12px] font-medium text-[var(--sw-mint)] transition-opacity hover:opacity-80"
      >
        Just exploring? Use a demo organization
      </button>
    </Card>
  );
}
