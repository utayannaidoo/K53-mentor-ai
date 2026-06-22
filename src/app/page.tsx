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
import { Reveal } from "@/components/shared/reveal";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <Hero />

        <Reveal>
          <Problem />
        </Reveal>
        <Reveal>
          <HowItWorks />
        </Reveal>

        <section id="preview" className="scroll-mt-20 border-t border-border bg-card/40">
          <div className="container py-16 lg:py-28">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                See it in action
              </p>
              <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                A calm dashboard that tells you exactly what to do next
              </h2>
              <p className="mt-4 text-balance text-muted-foreground">
                One readiness score, one daily plan, your weak areas front and centre — and an AI
                coach nudging you when you&apos;re stuck. This is the real product UI.
              </p>
            </Reveal>
            <Reveal delay={120} className="relative mx-auto mt-12 max-w-2xl">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-primary/15 via-primary/[0.05] to-transparent blur-3xl"
              />
              <ProductPreview />
            </Reveal>
          </div>
        </section>

        <Reveal>
          <Features />
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
