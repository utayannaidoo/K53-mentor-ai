import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { RotatingWord } from "@/components/landing/rotating-word";

/** Gradient "pill" CTA shared across the redesigned landing sections. */
const PILL =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white " +
  "bg-gradient-to-b from-primary-light to-primary " +
  "shadow-[inset_0_1px_0_hsl(0_0%_100%/0.45),0_14px_30px_-12px_hsl(var(--primary)/0.7)] " +
  "transition-[transform,filter] duration-[400ms] ease-spring hover:brightness-[1.07] active:scale-[0.96] " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30";

export function Hero() {
  return (
    <header
      id="top"
      className="mx-auto grid max-w-[1120px] items-center gap-14 px-6 pb-16 pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:pt-28"
    >
      {/* ── Copy column ─────────────────────────────────────────── */}
      <div className="animate-blur-in text-center lg:text-left">
        <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 py-1.5 pl-2.5 pr-3.5 text-[13px] font-medium text-primary">
          <span className="h-[7px] w-[7px] rounded-full bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.18)]" />
          Built for the South African K53
        </span>

        <h1 className="mt-5 text-balance font-display text-[clamp(2.5rem,6vw,4.2rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
          Stop guessing on
          <br />
          <RotatingWord />.
        </h1>

        <p className="mx-auto mt-5 max-w-[480px] text-pretty text-lg leading-relaxed text-muted-foreground lg:mx-0">
          K53 Mentor diagnoses your weak spots, builds a 10-minute daily plan, and coaches you with
          an AI tutor — until you walk in ready to pass first time.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
          <Link href="/onboarding" className={`${PILL} px-6 py-[15px] text-base`}>
            Start free assessment
            <ArrowRight className="h-[17px] w-[17px]" />
          </Link>
          <Link
            href="#how"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-6 py-[15px] text-base font-semibold text-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%/0.3)] backdrop-blur-md transition-[transform,background] duration-[400ms] ease-spring hover:bg-muted/60 active:scale-[0.96]"
          >
            See how it works
          </Link>
        </div>

        <p className="mt-5 text-[13.5px] font-medium text-muted-foreground">
          No card needed&nbsp;&nbsp;·&nbsp;&nbsp;10 minutes a day&nbsp;&nbsp;·&nbsp;&nbsp;Aligned to
          the official manual
        </p>
      </div>

      {/* ── Readiness mock card ─────────────────────────────────── */}
      <div className="relative animate-scale-in">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-6 -bottom-6 -top-12 -z-10 bg-[radial-gradient(60%_55%_at_60%_30%,hsl(var(--primary)/0.28),transparent_70%)] blur-[30px]"
        />
        <div className="glass-2 relative overflow-hidden rounded-3xl p-[22px]">
          {/* sheen */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 h-full w-2/5 -translate-x-[130%] bg-[linear-gradient(90deg,transparent,hsl(0_0%_100%/0.16),transparent)] motion-safe:animate-[k53sheen_7s_var(--ease-soft)_infinite]"
          />

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Your readiness
              </div>
              <div className="mt-1.5 font-display text-[15px] font-semibold">
                Good progress, Thabo
              </div>
            </div>
            <span className="rounded-full bg-success/15 px-2.5 py-1.5 text-[11px] font-semibold text-success">
              +6 this week
            </span>
          </div>

          <div className="mt-[18px] flex items-center gap-[22px]">
            <div className="relative h-[118px] w-[118px] shrink-0">
              <svg
                width="118"
                height="118"
                viewBox="0 0 118 118"
                className="-rotate-90 overflow-visible"
              >
                <circle cx="59" cy="59" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="11" />
                <circle
                  cx="59"
                  cy="59"
                  r="50"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray="314"
                  strokeDashoffset="69"
                  style={{ filter: "drop-shadow(0 0 10px hsl(var(--primary)/0.6))" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-[30px] font-semibold tracking-[-0.02em]">78</span>
                <span className="mt-[3px] text-[11px] font-medium text-muted-foreground">Ready</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="text-xs font-medium text-muted-foreground">
                Predicted pass probability
              </div>
              <div className="mt-[5px] font-mono text-[22px] font-semibold text-success">82%</div>

              <div className="mt-3.5 flex flex-col gap-[9px]">
                {[
                  { label: "Road signs", value: 64, bar: "from-warning to-accent" },
                  { label: "Rules of the road", value: 88, bar: "from-primary to-success" },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="mb-[5px] flex justify-between text-[11.5px] font-medium">
                      <span>{m.label}</span>
                      <span className="font-mono text-muted-foreground">{m.value}%</span>
                    </div>
                    <div className="h-[7px] overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${m.bar}`}
                        style={{ width: `${m.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-[18px] rounded-2xl bg-card/40 p-3.5 shadow-[inset_0_0_0_1px_hsl(0_0%_100%/0.07)]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <ShoppingBag className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="text-[13px] font-semibold leading-tight">Today&apos;s plan · 10 min</div>
                <div className="mt-0.5 text-[11.5px] font-medium leading-tight text-muted-foreground">
                  8 due cards · Signs drill · 1 scenario
                </div>
              </div>
              <span className="font-mono text-[11px] font-semibold text-primary">Start →</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
