import { MarketingNav } from "@/components/landing/marketing-nav";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { CategoryMarquee } from "@/components/landing/category-marquee";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { StatsBand } from "@/components/landing/stats-band";
import { Testimonials } from "@/components/landing/testimonials";
import { PricingSection } from "@/components/landing/pricing-section";
import { Faq } from "@/components/landing/faq";
import { CtaBand } from "@/components/landing/cta-band";
import { Footer } from "@/components/landing/footer";
import { Reveal } from "@/components/shared/reveal";

export default function HomePage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-aurora">
      <MarketingNav />
      <main className="flex-1">
        <Hero />

        <Reveal>
          <Problem />
        </Reveal>
        <Reveal>
          <CategoryMarquee />
        </Reveal>

        <HowItWorks />

        <Reveal>
          <Features />
        </Reveal>
        <Reveal>
          <StatsBand />
        </Reveal>
        <Reveal>
          <Testimonials />
        </Reveal>
        <Reveal>
          <PricingSection />
        </Reveal>
        <Reveal>
          <Faq />
        </Reveal>
        <Reveal>
          <CtaBand />
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
