import type { Metadata } from "next";
import { MarketingNav } from "@/components/landing/marketing-nav";
import { Footer } from "@/components/landing/footer";
import { PricingSection } from "@/components/landing/pricing-section";
import { Faq } from "@/components/landing/faq";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free with the K53 diagnostic, then one affordable plan covers every licence code — car, motorcycle and heavy vehicle. Cheaper than failing the test once.",
};

export default function PricingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingNav />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <div className="container pt-12 text-center sm:pt-16 lg:pt-20">
          <h1 className="text-balance font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            One plan to pass. One to keep driving well.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Start with a free diagnostic. Upgrade when you&apos;re ready — one plan costs less than a
            single failed re-test.
          </p>
        </div>
        <PricingSection withHeading={false} className="pt-10 sm:pt-16" />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
