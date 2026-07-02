import { MarketingNav } from "@/components/landing/marketing-nav";
import { Footer } from "@/components/landing/footer";

/** Shared chrome + prose layout for the legal/info pages linked from the footer. */
export function LegalPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <div className="container max-w-3xl py-16 lg:py-20">
          <h1 className="text-balance font-display text-4xl font-semibold tracking-tight">
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
