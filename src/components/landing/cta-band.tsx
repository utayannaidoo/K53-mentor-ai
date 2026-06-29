import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaBand() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 py-16">
      <div className="glass-2 relative overflow-hidden rounded-[28px] px-8 py-[60px] text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_100%_at_50%_0%,hsl(var(--primary)/0.22),transparent_70%)]"
        />
        <h2 className="relative mx-auto max-w-[640px] text-balance font-display text-[clamp(2.1rem,5vw,3.2rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
          Find out where you stand in 15 questions.
        </h2>
        <p className="relative mx-auto mt-[18px] max-w-[440px] text-[1.08rem] text-muted-foreground">
          Free, no card, 5 minutes. You&apos;ll get a readiness score and a plan before you finish
          your coffee.
        </p>
        <Link
          href="/onboarding"
          className="relative mt-[30px] inline-flex items-center gap-2.5 rounded-full bg-gradient-to-b from-primary-light to-primary px-[30px] py-4 text-base font-semibold text-white shadow-[inset_0_1px_0_hsl(0_0%_100%/0.45),0_16px_34px_-12px_hsl(var(--primary)/0.7)] transition-[transform,filter] duration-[400ms] ease-spring hover:brightness-[1.07] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
        >
          Start free assessment
          <ArrowRight className="h-[17px] w-[17px]" />
        </Link>
      </div>
    </section>
  );
}
