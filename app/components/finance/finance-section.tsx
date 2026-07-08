import {
  ChartVisual,
  EnvelopeVisual,
  FinanceCard,
  LogoCloudVisual,
  MapVisual,
  MiniTransferVisual,
} from "@/components/finance/finance-card";
import { Reveal } from "@/components/motion/reveal";

export function FinanceSection() {
  return (
    <section className="bg-[#f6f7f8] px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-10 text-center">
          <p className="section-kicker">Finance</p>
          <h2 className="mt-2 text-[32px] font-semibold tracking-[-0.03em] text-[#101828]">
            Powerful Finance, Zero Complexity
          </h2>
          <p className="mx-auto mt-3 max-w-[470px] text-[13px] leading-6 text-[#667085]">
            Everything you need for global transfers, reporting, cards, and visibility in a simple dashboard.
          </p>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-2">
          <Reveal>
            <FinanceCard large title="Simple global transfers" body="Move money in minutes with clean inputs, transparent fees, and realtime delivery status.">
              <MiniTransferVisual />
            </FinanceCard>
          </Reveal>
          <Reveal delay={0.06}>
            <FinanceCard large title="Rich financial insights" body="Track revenue, transfer volume, and payment trends without exporting data to separate tools.">
              <ChartVisual />
            </FinanceCard>
          </Reveal>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <Reveal>
            <FinanceCard title="Smart invoicing" body="Create simple requests, reminders, and payment links for customers.">
              <EnvelopeVisual />
            </FinanceCard>
          </Reveal>
          <Reveal delay={0.06}>
            <FinanceCard title="Worldwide coverage" body="Support teams, contractors, and suppliers across currencies.">
              <MapVisual />
            </FinanceCard>
          </Reveal>
          <Reveal delay={0.12}>
            <FinanceCard title="Local payment rails" body="Connect accounts and wallets for faster settlement everywhere.">
              <LogoCloudVisual />
            </FinanceCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
