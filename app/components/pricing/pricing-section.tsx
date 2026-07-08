"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/layout/section-heading";
import { PricingCard } from "@/components/pricing/pricing-card";
import { Button } from "@/components/ui/button";

function DollarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5C9.5 8.1 10.6 7 12 7s2.5 1.1 2.5 2.5S13.4 12 12 12s-2.5 1.1-2.5 2.5S10.6 17 12 17s2.5-1.1 2.5-2.5" strokeLinecap="round" />
    </svg>
  );
}

const plans = [
  {
    name: "Starter",
    subtitle: "For Small Teams Getting Started",
    price: "$0",
    cta: "Current Plan",
    features: [
      "Up to 10 streaming employees",
      "Real-time salary streams",
      "Idle-cash yield routing",
      "Claim anytime",
      "Community support",
    ],
  },
  {
    name: "Growth",
    subtitle: "For Growing Companies",
    price: "$259.00",
    cta: "Upgrade to Growth",
    featured: true,
    features: [
      "Everything in Starter",
      "Unlimited employees",
      "Multi-token payroll pools",
      "Pause, resume & rebalance",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    subtitle: "For Large Organizations",
    price: "$800.00",
    cta: "Contact Sales",
    features: [
      "Everything in Growth",
      "Custom yield strategies",
      "Delegated HR roles (pause/resume)",
      "API & webhook access",
      "Dedicated support",
    ],
  },
];

function Toggle({ yearly, onToggle }: { yearly: boolean; onToggle: () => void }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-3 text-[13px] font-medium text-[#344054]">
        <span className={!yearly ? "text-text-primary" : "text-text-muted"}>Monthly</span>
        <button
          type="button"
          onClick={onToggle}
          role="switch"
          aria-checked={yearly}
          aria-label="Toggle yearly billing"
          className={cnToggle(yearly)}
        >
          <span
            className={`absolute top-0.5 size-6 rounded-full bg-white shadow-sm transition-[left] duration-200 ${
              yearly ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
        <span className={yearly ? "text-text-primary" : "text-text-muted"}>Yearly</span>
      </div>
      <span className="text-[11px] font-medium text-text-secondary">&#123; GET 65% OFF &#125;</span>
    </div>
  );
}

function cnToggle(yearly: boolean) {
  return `relative h-7 w-12 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
    yearly ? "bg-brand" : "bg-[#d0d5dd]"
  }`;
}

export function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <Section id="pricing" className="bg-white">
      <SectionHeading
        align="center"
        eyebrow="Pricing Plans"
        eyebrowIcon={<DollarIcon />}
        title="Simple pricing with no hidden fees"
        description="Plans scale with your team. No seats, no lock-in — just streaming payroll that earns on idle cash."
        actions={<Toggle yearly={yearly} onToggle={() => setYearly(!yearly)} />}
      />

      <div className="grid items-stretch gap-5 md:grid-cols-3">
        {plans.map((plan, index) => (
          <Reveal key={plan.name} delay={index * 0.06}>
            <PricingCard {...plan} />
          </Reveal>
        ))}
      </div>

      <Reveal className="relative mt-8 overflow-hidden rounded-[20px] border border-border bg-surface px-8 py-7">
        <div className="absolute -bottom-6 -right-6 size-28 rounded-full bg-[#e8f0fb] opacity-60" />
        <div className="absolute -bottom-2 right-16 size-16 rounded-full bg-[#dbeafe] opacity-50" />
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-[18px] font-semibold text-text-primary">Need a custom payroll setup?</h3>
            <p className="mt-1 text-[13px] text-text-secondary">
              We tailor pools, yield routing, and roles to your org.
            </p>
          </div>
          <Button
            asChild
            className="shrink-0 rounded-full bg-brand-dark px-7 text-white hover:bg-brand-dark/90"
          >
            <a href="#contact">Contact Us</a>
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}
