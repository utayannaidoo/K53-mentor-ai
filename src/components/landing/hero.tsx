import Link from "next/link";
import { ArrowRight, PlayCircle, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductPreview } from "@/components/landing/product-preview";
import { PASS_RATE_NOW } from "@/lib/constants";
import { cn } from "@/lib/utils";

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

          <h1 className="text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-[3.25rem]">
            Only {Math.round(PASS_RATE_NOW / 10)} in 10 pass their learner&apos;s on the first try.
            <span className="text-primary"> Find out exactly what you don&apos;t know.</span>
          </h1>

          <p className="mt-5 max-w-xl text-balance text-lg text-muted-foreground">
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

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <span className="font-medium text-foreground">4.8</span> average rating
            </div>
            <div>
              <span className="font-medium text-foreground">No credit card.</span> Takes 5 minutes.
            </div>
          </div>
        </div>

        <div className="animate-scale-in lg:pl-4">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}
