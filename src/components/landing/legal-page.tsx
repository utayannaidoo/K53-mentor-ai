import Link from "next/link";
import { MarketingNav } from "@/components/landing/marketing-nav";
import { Footer } from "@/components/landing/footer";
import { APP_NAME, SITE_URL } from "@/lib/constants";
import { GUIDES } from "@/app/guides/guides";

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
  /**
   * ISO date (YYYY-MM-DD) the page was last substantively revised. Displayed
   * as a readable line and emitted verbatim as the Article schema's
   * datePublished/dateModified — Google's guidance for maintained articles
   * (rather than news) is that one honest date for both beats two invented
   * ones, and schema.org requires ISO 8601.
   */
  updated?: string;
  /**
   * Slug of the guide this page is, when it is one. Emits Article structured
   * data so the guides can earn a rich result — they exist to rank, and shipped
   * with no schema at all. Legal pages leave this unset.
   */
  articleSlug?: string;
  children: React.ReactNode;
}) {
  const articleUrl = articleSlug ? `${SITE_URL}/guides/${articleSlug}` : null;

  const schemas = articleUrl
    ? [
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description: intro,
          url: articleUrl,
          ...(updated && { datePublished: updated, dateModified: updated }),
          inLanguage: "en-ZA",
          isAccessibleForFree: true,
          // Inlined rather than an "@id" reference: the Organization node
          // lives in the homepage's JSON-LD, and a dangling cross-page
          // reference is a parse risk for scrapers that read this page alone.
          author: { "@type": "Organization", name: APP_NAME, url: SITE_URL },
          publisher: { "@type": "Organization", name: APP_NAME, url: SITE_URL },
          mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "K53 guides", item: `${SITE_URL}/guides` },
            { "@type": "ListItem", position: 3, name: title, item: articleUrl },
          ],
        },
      ]
    : [];

  // Every guide links out to its siblings: a reader who landed on one answer
  // gets signposted to the next question they were going to search anyway, and
  // the crawl paths between guides stop depending on everyone finding /guides.
  const siblings = articleSlug
    ? GUIDES.filter((g) => g.slug !== articleSlug)
    : [];

  /** ISO → "1 August 2026". Manual so the output never shifts with the
   * server's locale or timezone — an ISO date parsed as UTC must not render
   * as the last day of July in a UTC+2 runtime. */
  const updatedLabel = updated
    ? (() => {
        const [y, m, d] = updated.split("-").map(Number);
        const months = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December",
        ];
        return `${d} ${months[m - 1]} ${y}`;
      })()
    : null;

  return (
    <div className="flex min-h-dvh flex-col">
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <MarketingNav />
      <main id="main-content" tabIndex={-1} className="flex-1">
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
          {updatedLabel && (
            <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
              Last updated: {updatedLabel}
            </p>
          )}
          <p className="mt-4 text-muted-foreground">{intro}</p>
          <div className="mt-10 space-y-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_p]:mt-2 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_li]:text-sm [&_li]:leading-relaxed [&_li]:text-muted-foreground">
            {children}
          </div>
          {siblings.length > 0 && (
            <nav aria-label="More K53 guides" className="mt-14 border-t border-border pt-8">
              {/* Same type scale as the article's own sections — this reads as
                  part of the page, not a widget bolted under it. */}
              <h2 className="font-display text-xl font-semibold tracking-tight">Keep reading</h2>
              <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                {siblings.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/guides/${g.slug}`}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {g.title}
                    </Link>{" "}
                    — {g.description}
                  </li>
                ))}
              </ul>
              {/* The index page, so the trail back is one hop from anywhere. */}
              <p className="mt-4 text-sm">
                <Link
                  href="/guides"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  All K53 guides
                </Link>
              </p>
            </nav>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
