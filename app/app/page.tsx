import { ConfidenceSection } from "@/components/confidence/confidence-section";
import { ServicesSection } from "@/components/services/services-section";
import { CtaSection } from "@/components/cta/cta-section";
import { FaqSection } from "@/components/faq/faq-section";
import { FeaturesSection } from "@/components/features/features-section";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/hero/hero-section";
import { IntegrationsSection } from "@/components/integrations/integrations-section";
// import { PricingSection } from "@/components/pricing/pricing-section";
import { StatsSection } from "@/components/stats/stats-section";
import { TestimonialsSection } from "@/components/testimonials/testimonials-section";

export default function Home() {
  return (
    <main className="sw-landing min-h-screen">
      <HeroSection />
      <IntegrationsSection />
      <ServicesSection />
      <FeaturesSection />
      <ConfidenceSection />
      <StatsSection />
      {/* <PricingSection /> */}
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
