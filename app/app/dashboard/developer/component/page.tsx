"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PayModal } from "@/components/dashboard/sweem/request-payment-modal";

export default function TestComponentPage() {
  // The preview should always be visible. Closing (Done / X) just remounts the
  // modal via `resetKey` so it returns to its initial form state.
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="mx-auto w-full max-w-7xl px-6">
      <PayModal
        key={resetKey}
        open
        onClose={() => setResetKey((k) => k + 1)}
        amount={480}
        inline
        onPay={(data) => {
          toast.success(`Paid ${data.total} ${data.token}`);
        }}
      />
    </div>
  );
}
