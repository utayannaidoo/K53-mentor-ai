import { MarketingNav } from "@/components/landing/marketing-nav";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { Testimonials } from "@/components/landing/testimonials";
import { PricingSection } from "@/components/landing/pricing-section";
import { Faq } from "@/components/landing/faq";
import { CtaBand } from "@/components/landing/cta-band";
import { Footer } from "@/components/landing/footer";
import { ProductPreview } from "@/components/landing/product-preview";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <Hero />
        <Problem />
        <HowItWorks />

        <section id="preview" className="border-t border-border bg-card/40 scroll-mt-20">
          <div className="container py-16 lg:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                See it in action
              </p>
              <h2 className="mt-2 text-balance font-display text-3xl font-semibold tracking-tight">
                A calm dashboard that tells you exactly what to do next
              </h2>
              <p className="mt-4 text-muted-foreground">
                One readiness score, one daily plan, your weak areas front and centre — and an AI
                coach nudging you when you&apos;re stuck. This is the real product UI.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-2xl">
              <ProductPreview />
            </div>
          </div>
        </section>

        <Features />
        <Testimonials />
        <PricingSection />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
