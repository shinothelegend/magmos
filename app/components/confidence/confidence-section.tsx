import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/layout/section-heading";
import { LaunchAppButton } from "@/components/shared/launch-app-button";

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
    </svg>
  );
}

export function ConfidenceSection() {
  return (
    <Section className="bg-white">
      <SectionHeading
        eyebrow="Seamless Control"
        eyebrowIcon={<LockIcon />}
        title={
          <>
            Run Every Payroll
            <br />
            with Confidence
          </>
        }
        description="Deposit USDC once, stream to recipients worldwide, and let them bridge home via CCTP — automated and onchain on Arc."
        actions={
          <LaunchAppButton className="inline-flex h-10 items-center rounded-full bg-brand-dark px-6 text-[13px] font-medium text-white transition-colors hover:bg-brand-dark/90">
            Launch Dashboard
          </LaunchAppButton>
        }
      />

      <Reveal>
        <div className="w-full overflow-hidden rounded-[24px] border border-border bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sweep-long.png"
            alt="Magmos payroll dashboard"
            className="h-auto w-full object-cover"
          />
        </div>
      </Reveal>
    </Section>
  );
}
