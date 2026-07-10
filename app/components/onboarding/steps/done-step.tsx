"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Card, PrimaryButton } from "../ui";

export function DoneStep({ onFinish }: { onFinish: () => void }) {
  return (
    <Card
      title="You're all set"
      subtitle="Your organization is ready. Fund your payroll pool and start streaming USDC salaries on HashKey Chain."
      footer={
        <>
          <span className="text-[12px] text-[var(--sw-text-dim)]">Step 2 of 2</span>
          <PrimaryButton onClick={onFinish}>
            Go to dashboard <ArrowRight className="size-4" strokeWidth={2.2} />
          </PrimaryButton>
        </>
      }
    >
      <div className="flex flex-col items-center py-6">
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="flex size-16 items-center justify-center rounded-full bg-[var(--sw-mint)]"
        >
          <Check className="size-8 text-black" strokeWidth={3} />
        </motion.span>
      </div>
    </Card>
  );
}
