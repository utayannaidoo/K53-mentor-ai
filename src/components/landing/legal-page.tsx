import { MarketingNav } from "@/components/landing/marketing-nav";
import { Footer } from "@/components/landing/footer";
import { APP_NAME, SITE_URL } from "@/lib/constants";

/** Shared chrome + prose layout for the legal/info pages linked from the footer. */
export function LegalPage({
  title,
  intro,
  updated,
  articleSlug,
  children,
}: {
  title: string;
  intro: string;
  updated?: string;
  /**
   * Slug of the guide this page is, when it is one. Emits Article structured
   * data so the guides can earn a rich result — they exist to rank, and shipped
   * with no schema at all. Legal pages leave this unset.
   */
  articleSlug?: string;
  children: React.ReactNode;
}) {
  const articleSchema = articleSlug
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description: intro,
        url: `${SITE_URL}/guides/${articleSlug}`,
        inLanguage: "en-ZA",
        isAccessibleForFree: true,
        author: { "@type": "Organization", name: APP_NAME, url: SITE_URL },
        publisher: { "@type": "Organization", name: APP_NAME, url: SITE_URL },
        mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/guides/${articleSlug}` },
      }
    : null;

  return (
    <div className="flex min-h-dvh flex-col">
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
      <MarketingNav />
      <main id="main-content" className="flex-1">
        <div className="container max-w-3xl py-16 lg:py-20">
          {/* `text-4xl` is 3.5rem here, at which "cancellation" is 298px wide —
              36px past the 262px column a 320px phone leaves, so the Refunds
              title alone pushed the whole document sideways. Titles whose
              longest word is shorter (Privacy, Terms) happened to fit, which is
              why this only showed on one page. Step down at the narrow end and
              let a word that still cannot fit break instead of overflow. */}
          <h1 className="text-balance break-words font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {updated && (
            <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
              Last updated: {updated}
            </p>
          )}
          <p className="mt-4 text-muted-foreground">{intro}</p>
          <div className="mt-10 space-y-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_p]:mt-2 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_li]:text-sm [&_li]:leading-relaxed [&_li]:text-muted-foreground">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
