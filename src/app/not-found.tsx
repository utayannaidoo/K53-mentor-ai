import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { StartCta } from "@/components/landing/start-cta";
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
        {/* A 404 is statically rendered and cannot know who is asking, which is
            why this button used to point everyone at /onboarding: aiming it at
            /dashboard bounced every signed-out visitor into a login screen they
            never asked for. StartCta resolves it per visitor after mount, so a
            signed-out stranger still gets the assessment and a signed-in
            learner gets their own dashboard. */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <StartCta
            location="not_found"
            label="Start free assessment"
            className={buttonVariants({ variant: "default" })}
          />
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
