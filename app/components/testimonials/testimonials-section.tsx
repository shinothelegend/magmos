import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/layout/section-heading";
import { TestimonialCard } from "@/components/testimonials/testimonial-card";

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WisdomAiLogo() {
  return (
    <div className="flex items-center gap-1.5 text-[13px] font-semibold text-text-primary">
      WisdomAI
    </div>
  );
}

function HandleLogo({ handle }: { handle: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[13px] font-semibold text-text-primary">
      <img
        src={`https://unavatar.io/twitter/${handle}`}
        alt={handle}
        width={18}
        height={18}
        className="h-[18px] w-[18px] rounded-full object-cover"
      />
      {handle}
    </div>
  );
}

function EduhubLogo() {
  return (
    <div className="flex items-center gap-1.5 text-[13px] font-semibold text-text-primary">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#101828" strokeWidth="2" aria-hidden>
        <path d="M3 8l9-4 9 4-9 4-9-4z" strokeLinejoin="round" />
        <path d="M7 10.5V15c0 1.1 2.2 2 5 2s5-.9 5-2v-4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 8v4" strokeLinecap="round" />
      </svg>
      Eduhub
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <Section className="bg-white">
      <SectionHeading
        eyebrow="Testimonials"
        eyebrowIcon={<ClockIcon />}
        title={
          <>
            Trusted Worldwide by
            <br />
            30+ Growing Businesses
          </>
        }
        description="Real stories from teams streaming cross-border payroll onchain with Magmos."
      />

      {/* row 1 */}
      <div className="grid items-stretch gap-4 md:grid-cols-3">
        <Reveal>
          <TestimonialCard type="image" image="/ceo.png" bg="linear-gradient(160deg,#c8dff0,#e8f4fc)" />
        </Reveal>
        <Reveal delay={0.06}>
          <TestimonialCard
            type="quote"
            logo={<WisdomAiLogo />}
            quote='"3-day wires are gone. Our global team gets paid by the second and can claim whenever they need it."'
            name="Prantik Bala"
            role="Wisdom Ai"
            avatar="/prantik.jpeg"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <TestimonialCard
            type="quote"
            logo={<HandleLogo handle="KimiaProtocol" />}
            quote='"Recipients in Manila watch their pay tick up live and cash out home in seconds — no 6% haircut."'
            name="KimiaProtocol"
            role="@KimiaProtocol"
            avatar="https://unavatar.io/twitter/KimiaProtocol"
            href="https://x.com/KimiaProtocol"
            light
          />
        </Reveal>
      </div>

      {/* row 2 */}
      <div className="mt-4 grid items-stretch gap-4 md:grid-cols-3">
        <Reveal>
          <TestimonialCard
            type="quote"
            logo={<HandleLogo handle="DikeProtocol" />}
            quote='"We can see our exact runway in real time. Pausing or adjusting a single stream takes one click."'
            name="DikeProtocol"
            role="@DikeProtocol"
            avatar="https://unavatar.io/twitter/DikeProtocol"
            href="https://x.com/DikeProtocol"
            light
          />
        </Reveal>
        <Reveal delay={0.06}>
          <TestimonialCard
            type="quote"
            logo={<EduhubLogo />}
            quote='"Non-custodial, onchain, and instant. Magmos gave us confidence to run global payroll."'
            name="Sahitya Roy"
            role="@SahityaRoy07"
            avatar="https://unavatar.io/twitter/SahityaRoy07"
            href="https://x.com/SahityaRoy07"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <TestimonialCard type="image" image="/cto.png" bg="linear-gradient(160deg,#1a3a2a,#2d5c42)" />
        </Reveal>
      </div>
    </Section>
  );
}
