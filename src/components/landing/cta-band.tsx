import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CtaBand() {
  return (
    <section className="container py-16 lg:py-24">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary px-6 py-14 text-center text-primary-foreground shadow-soft-lg sm:px-12">
        <div className="absolute inset-0 -z-0 bg-grid opacity-10" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            See exactly what&apos;s standing between you and a pass.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Take the free diagnostic and get your readiness score in 5 minutes. No credit card, no
            commitment.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/onboarding"
              className={cn(
                buttonVariants({ variant: "accent", size: "xl" }),
                "group shadow-soft-lg",
              )}
            >
              Get your free readiness score
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
