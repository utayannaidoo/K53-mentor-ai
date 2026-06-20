import type { Metadata } from "next";
import { MarketingNav } from "@/components/landing/marketing-nav";
import { Footer } from "@/components/landing/footer";
import { PricingSection } from "@/components/landing/pricing-section";
import { Faq } from "@/components/landing/faq";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, honest pricing — cheaper than failing the test once.",
};

export default function PricingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <div className="container pt-16 text-center lg:pt-20">
          <h1 className="text-balance font-display text-4xl font-semibold tracking-tight">
            One plan to pass. One to keep driving well.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Start free with a full diagnostic. Upgrade only when you&apos;re ready — and never pay
            more than the cost of a single failed re-test.
          </p>
        </div>
        <PricingSection withHeading={false} />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
