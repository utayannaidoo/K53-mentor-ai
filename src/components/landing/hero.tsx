import Link from "next/link";
import { ArrowRight, PlayCircle, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductPreview } from "@/components/landing/product-preview";
import { PASS_RATE_NOW } from "@/lib/constants";
import { cn } from "@/lib/utils";

const AVATARS = [
  { initials: "TM", tint: "bg-gradient-to-br from-primary to-primary-light" },
  { initials: "NK", tint: "bg-gradient-to-br from-accent to-[hsl(16_85%_55%)]" },
  { initials: "SP", tint: "bg-gradient-to-br from-[hsl(258_72%_60%)] to-primary" },
  { initials: "AD", tint: "bg-gradient-to-br from-success to-[hsl(168_60%_42%)]" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-aurora" />
      <div className="absolute inset-0 -z-10 bg-grid opacity-60 [mask-image:radial-gradient(70%_50%_at_50%_0%,black,transparent)]" />

      <div className="container grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div className="animate-fade-in">
          <Badge variant="outline" className="mb-5 gap-1.5 bg-card/60 px-3 py-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            The test changed in 2026. Your prep should too.
          </Badge>

          <h1 className="text-balance font-display text-[clamp(2.6rem,6.4vw,4.5rem)] font-semibold leading-[1.03] tracking-[-0.03em] text-foreground">
            Only {Math.round(PASS_RATE_NOW / 10)} in 10 pass their learner&apos;s on the first try.
            <span className="bg-gradient-to-br from-primary to-[hsl(258_72%_60%)] bg-clip-text text-transparent">
              {" "}
              Find out exactly what you don&apos;t know.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl">
            K53 Mentor AI diagnoses your weak spots in 10 minutes and builds you a personalised,
            spaced-repetition study plan — with an AI tutor that explains, not just answers. Not
            another question bank.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/onboarding" className={cn(buttonVariants({ size: "xl" }), "group")}>
              Get your free readiness score
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/#preview"
              className={cn(buttonVariants({ variant: "outline", size: "xl" }))}
            >
              <PlayCircle /> View demo
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {AVATARS.map((a) => (
                  <span
                    key={a.initials}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-2xs font-semibold text-white",
                      a.tint,
                    )}
                    aria-hidden
                  >
                    {a.initials}
                  </span>
                ))}
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                  ))}
                  <span className="ml-1 font-medium text-foreground">4.8</span>
                </div>
                <span className="text-xs">Learners across all 9 provinces</span>
              </div>
            </div>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <div className="leading-tight">
              <span className="font-medium text-foreground">No credit card.</span>
              <br className="hidden sm:block" /> Takes 5 minutes.
            </div>
          </div>
        </div>

        <div className="relative animate-scale-in lg:pl-4">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-primary/20 via-primary/[0.06] to-transparent blur-3xl"
          />
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}
