"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Invite A Business To Explore Fello",
  "Your Referral Signs Up And Connects With Deel",
  "Earn Rewards Through Successful Referrals",
];

export function ReferralCard({
  badge = "Get 1,500 and give 500!",
  title = "Earn Referrals",
  subtitle = "Refer businesses and earn rewards.",
  steps = STEPS,
  referralUrl = "https://www.dribbble.com/mdmostahid9",
  className,
}: {
  badge?: string;
  title?: string;
  subtitle?: string;
  steps?: string[];
  referralUrl?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
      className={cn(
        "flex flex-col rounded-[24px] border border-[#E3EDF8] bg-white p-6 shadow-[0_8px_30px_rgba(2,79,166,0.06)]",
        className ?? "h-[480px] w-[360px]",
      )}
    >
      {/* Top badge */}
      <span className="inline-flex w-fit items-center rounded-full border border-[#024FA6]/30 bg-[#EEF4FC] px-3 py-1.5 text-[12px] font-medium text-[#024FA6]">
        {badge}
      </span>

      {/* Hero */}
      <div className="mt-6 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-[32px] font-semibold leading-[1.05] tracking-[-0.02em] text-[#061230]">
            {title}
          </h1>
          <p className="mt-2 text-[14px] text-[#8A97A8]">{subtitle}</p>
        </div>
        <FlowerMascot className="pointer-events-none -mt-3 h-[112px] w-[112px] flex-none" />
      </div>

      {/* How it works */}
      <p className="mt-10 text-[12px] text-[#8A97A8]">How it works:</p>
      <ol className="mt-4 flex flex-col gap-4">
        {steps.map((step, i) => (
          <li key={i} className="flex items-center gap-3">
            <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-gradient-to-br from-[#2E74C4] to-[#024FA6] text-[12px] font-semibold text-white shadow-[0_2px_6px_rgba(2,79,166,0.35)]">
              {i + 1}
            </span>
            <span className="text-[14px] font-medium leading-snug text-[#2B3344]">
              {step}
            </span>
          </li>
        ))}
      </ol>

      {/* Footer */}
      <div className="mt-auto flex items-center gap-3">
        <span className="min-w-0 flex-1 truncate rounded-full bg-[#F3F8FE] px-4 py-2.5 text-[11px] text-[#7B8AA0]">
          {referralUrl}
        </span>
        <button
          onClick={copy}
          type="button"
          className="inline-flex flex-none items-center gap-2 rounded-full bg-[#000518] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#01112e]"
        >
          {copied ? "Copied!" : "Copy Link"}
          <CopyIcon className="h-[15px] w-[15px]" />
        </button>
      </div>
    </div>
  );
}

export function FlowerMascot({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="rc-petal" cx="34%" cy="28%" r="85%">
          <stop offset="0%" stopColor="#AECBF0" />
          <stop offset="48%" stopColor="#2F76C6" />
          <stop offset="100%" stopColor="#023E82" />
        </radialGradient>
        <filter id="rc-soft" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#024FA6" floodOpacity="0.24" />
        </filter>
      </defs>
      <g filter="url(#rc-soft)" fill="url(#rc-petal)">
        <circle cx="60" cy="27" r="20" />
        <circle cx="93" cy="45" r="20" />
        <circle cx="93" cy="79" r="20" />
        <circle cx="60" cy="97" r="20" />
        <circle cx="27" cy="79" r="20" />
        <circle cx="27" cy="45" r="20" />
        <circle cx="60" cy="62" r="30" />
      </g>
      {/* eyes */}
      <rect x="50.5" y="52" width="6" height="20" rx="3" fill="#fff" />
      <rect x="63.5" y="52" width="6" height="20" rx="3" fill="#fff" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default ReferralCard;
