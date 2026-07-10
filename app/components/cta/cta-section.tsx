import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/layout/section";
import { LaunchAppButton } from "@/components/shared/launch-app-button";

function Sparkle({ size = 22, className }: { size?: number; className: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill="rgba(10,24,5,0.22)"
      className={`absolute ${className}`}
      aria-hidden
    >
      <path d="M10 0 L12.2 7.8 L20 10 L12.2 12.2 L10 20 L7.8 12.2 L0 10 L7.8 7.8 Z" />
    </svg>
  );
}

export function CtaSection() {
  return (
    <Section className="bg-white">
      <Reveal>
        <div
          className="relative overflow-hidden rounded-[28px] px-8 py-24 text-center text-[#0b1e05] md:py-28"
          style={{
            background: `
              radial-gradient(ellipse 60% 70% at 50% -10%, rgba(255,255,255,0.5) 0%, transparent 60%),
              radial-gradient(ellipse 90% 60% at 50% 120%, rgba(7,18,4,0.55) 0%, transparent 64%),
              linear-gradient(160deg, #d8fba2 0%, #ff6a1a 40%, #9cdb46 70%, #4f7e28 100%)
            `,
          }}
        >
          {/* spotlight overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[60%] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
            style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.9), transparent 70%)" }}
          />

          <Sparkle size={24} className="left-[11%] top-[22%]" />
          <Sparkle size={16} className="right-[8%] top-[40%]" />
          <Sparkle size={14} className="bottom-[22%] left-[28%] opacity-80" />

          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 text-[12px] font-medium text-[#0b1e05]/70">
              <span className="size-1.5 rounded-full bg-[#0b1e05]/70" />
              Live on HashKey Chain testnet
            </p>
            <h2 className="mx-auto mt-3 text-[clamp(28px,4vw,42px)] font-medium leading-[1.1] tracking-[-0.02em]">
              Pay the world,
              <br />
              every second.
            </h2>
            <p className="mx-auto mt-4 max-w-none text-[13px] leading-6 text-[#0b1e05]/75 sm:whitespace-nowrap">
              Fund a USDC pool, stream payouts by the second on HashKey Chain, and let anyone cash out home via CCTP.
            </p>
            <LaunchAppButton className="mt-7 inline-flex h-10 items-center gap-2 rounded-full bg-[#0a0e16] px-7 text-[13px] font-medium text-white transition-opacity hover:opacity-90">
              Launch Dashboard
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </LaunchAppButton>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
