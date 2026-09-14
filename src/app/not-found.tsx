import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SupportLink } from "@/components/shared/support-link";
import { cn, glass } from "@/lib/utils";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="bg-app flex min-h-dvh items-center justify-center px-6">
      <div className={cn(glass, "max-w-md rounded-2xl p-10 text-center")}>
        <p className="font-mono text-sm font-medium text-muted-foreground">404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">
          Wrong turn — this road doesn&apos;t exist
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you&apos;re looking for was moved or never existed. Let&apos;s get you
          back on route.
        </p>
        {/* Both destinations are public. A 404 is statically rendered, so it
            can't know whether you're signed in — pointing the primary button at
            /dashboard bounced every signed-out visitor straight to a login
            screen they never asked for. */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/onboarding" className={buttonVariants({ variant: "default" })}>
            Start free assessment
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Back to home
          </Link>
        </div>
        {/* A 404 someone reached from inside the app is usually our broken
            link, not their typo — so give them somewhere to say so. */}
        <p className="mt-6 text-xs text-muted-foreground">
          Followed a link from inside the app to get here? Tell us at{" "}
          <SupportLink subject="K53 Mentor — a link is broken" /> and we&apos;ll fix it.
        </p>
      </div>
    </div>
  );
}
