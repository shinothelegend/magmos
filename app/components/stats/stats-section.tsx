import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/layout/section";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const stats: { value: string; label: string; logos?: string[] }[] = [
  { value: "1s", label: "Settlement Finality" },
  { value: "24/7", label: "Claimable Anytime" },
  {
    value: "USDC",
    label: "Dollar-Native, End to End",
    logos: ["/protocols/lending/usd-coin-usdc-logo.png"],
  },
];

export function StatsSection() {
  return (
    <Section className="overflow-hidden bg-white">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
        {/* left — live growth visual */}
        <Reveal className="w-full lg:w-[380px] lg:shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sweem-banner1.png"
            alt="USDC salaries streaming to recipients worldwide on HashKey Chain"
            className="w-full rounded-[20px] object-contain"
          />
        </Reveal>

        {/* right */}
        <Reveal delay={0.08} className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand">
            <CheckIcon />
            Impacts
          </p>
          <h2 className="mt-3 text-[clamp(28px,4vw,42px)] font-medium leading-[1.12] tracking-[-0.02em]">
            <span className="text-text-primary">Pay the world in real time with full onchain </span>
            <span className="text-text-muted">visibility into every payout stream.</span>
          </h2>
          <p className="mt-5 max-w-[520px] text-[13px] leading-6 text-text-secondary">
            Move beyond 3-day wires and 6% fees. Magmos settles USDC payroll on HashKey Chain so every payout
            is streamed per second, claimable anytime, and bridged home via CCTP.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-8">
            {stats.map(({ value, label, logos }) => (
              <div key={value} className="group">
                <span className="block h-[3px] w-7 rounded-full bg-brand/25 transition-[width,background-color] duration-300 group-hover:w-12 group-hover:bg-brand" />
                <dd className="mt-3 flex items-center gap-3">
                  <span className="text-[clamp(28px,4vw,42px)] font-semibold leading-none tracking-[-0.02em] text-text-primary tabular-nums">
                    {value}
                  </span>
                  {logos && (
                    <span className="flex -space-x-2.5">
                      {logos.map((src) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={src}
                          src={src}
                          alt=""
                          className="size-8 rounded-full bg-white object-cover ring-2 ring-[#15161b]"
                        />
                      ))}
                    </span>
                  )}
                </dd>
                <dt className="mt-1.5 text-[14px] text-text-secondary">{label}</dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </Section>
  );
}
