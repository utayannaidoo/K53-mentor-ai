import { MarketingNav } from "@/components/landing/marketing-nav";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { CategoryMarquee } from "@/components/landing/category-marquee";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ProductPreview } from "@/components/landing/product-preview";
import { Features } from "@/components/landing/features";
import { StatsBand } from "@/components/landing/stats-band";
import { Comparison } from "@/components/landing/comparison";
import { PricingSection } from "@/components/landing/pricing-section";
import { Faq } from "@/components/landing/faq";
import { CtaBand } from "@/components/landing/cta-band";
import { Footer } from "@/components/landing/footer";
import { Reveal } from "@/components/shared/reveal";
import { SmoothScroll } from "@/components/shared/smooth-scroll";
import { APP_NAME, SITE_URL } from "@/lib/constants";

/**
 * Site-level entities for the homepage only.
 *
 * The FAQ and guide Article schemas cover content-rich results; nothing told
 * search engines what entity owns this domain — name, logo, canonical origin.
 * Honest minimums only: no aggregateRating or SearchAction, because there is
 * no on-site search to back it and invented ratings are a manual-action risk.
 */
const SITE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: APP_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png`, width: 512, height: 512 },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: APP_NAME,
      inLanguage: "en-ZA",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function HomePage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-aurora">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_SCHEMA) }}
      />
      <SmoothScroll />
      <MarketingNav />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <Hero />

        <Reveal>
          <Problem />
        </Reveal>
        <Reveal>
          <CategoryMarquee />
        </Reveal>

        {/* No Reveal wrapper: this section pins itself as you scroll through it,
            and a sticky element can't be nested inside Reveal's transform. */}
        <ProductPreview />

        <HowItWorks />

        {/* Features cascades its cards in internally. */}
        <Features />
        <Reveal>
          <StatsBand />
        </Reveal>
        <Reveal>
          <Comparison />
        </Reveal>
        <Reveal>
          <PricingSection />
        </Reveal>
        <Reveal>
          <Faq withSchema />
        </Reveal>
        <Reveal>
          <CtaBand />
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
