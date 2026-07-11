"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Lightbulb, CheckCircle2, Circle, AlertTriangle, PartyPopper } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Paywall } from "@/components/app/paywall";
import { useStudyStore } from "@/hooks/use-study-store";
import { hasFeature } from "@/lib/billing/plans";
import { DRIVER_MODULES_BY_ID } from "@/lib/content/driver-modules";
import { cn, glass, glassFloat } from "@/lib/utils";

export function ModuleCookMode({ moduleId }: { moduleId: string }) {
  const { state, toggleDriverStep } = useStudyStore();
  const mod = DRIVER_MODULES_BY_ID[moduleId];
  const [stepIndex, setStepIndex] = React.useState(0);

  if (!hasFeature(state.tier, "licencePrep")) {
    return (
      <div className="mx-auto max-w-md py-10">
        <Paywall
          feature="licence_prep"
          title="Driver's-licence prep is Premium Plus"
          description="Step-by-step yard-test guidance — parallel parking, alley docking, three-point turns and more. Unlock it all with Premium Plus."
          cta="Unlock with Premium Plus"
        />
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <p className="text-muted-foreground">That module doesn&apos;t exist.</p>
        <Link href="/licence-prep" className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
          Back to licence prep
        </Link>
      </div>
    );
  }

  const completed = new Set(state.driverProgress[moduleId] ?? []);
  const step = mod.steps[stepIndex];
  const pct = Math.round((completed.size / mod.steps.length) * 100);
  const allDone = completed.size === mod.steps.length;
  const isLast = stepIndex === mod.steps.length - 1;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <Link href="/licence-prep" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All modules
        </Link>
        <span className="font-mono text-xs text-muted-foreground">{completed.size}/{mod.steps.length} practised</span>
      </div>

      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">{mod.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{mod.summary}</p>

      <div className="mt-4">
        <Progress value={pct} tone={allDone ? "success" : "primary"} />
      </div>

      {/* Step dots */}
      <div className="mt-5 flex flex-wrap gap-2">
        {mod.steps.map((s, i) => (
          <button
            key={s.n}
            onClick={() => setStepIndex(i)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold transition-colors",
              i === stepIndex
                ? "border-primary bg-primary text-primary-foreground"
                : completed.has(s.n)
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-border text-muted-foreground hover:border-primary/40",
            )}
          >
            {completed.has(s.n) ? <CheckCircle2 className="h-4 w-4" /> : s.n}
          </button>
        ))}
      </div>

      {/* Step card (cook mode) */}
      <Card key={step.n} className={cn(glassFloat, "mt-5 animate-fade-in p-6")}>
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Step {step.n} of {mod.steps.length}
        </p>
        <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">{step.title}</h2>
        <p className="mt-3 leading-relaxed text-foreground">{step.instruction}</p>
        {step.tip && (
          <div className="mt-4 flex gap-2.5 rounded-lg border border-accent/30 bg-accent/[0.07] p-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <p className="text-sm text-foreground">{step.tip}</p>
          </div>
        )}

        <button
          onClick={() => toggleDriverStep(moduleId, step.n)}
          className={cn(
            "mt-5 flex w-full items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-medium transition-colors",
            completed.has(step.n)
              ? "border-success bg-success/10 text-success"
              : "border-border text-muted-foreground hover:border-primary/40",
          )}
        >
          {completed.has(step.n) ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
          {completed.has(step.n) ? "Practised" : "Mark as practised"}
        </button>
      </Card>

      {/* Nav */}
      <div className="mt-5 flex gap-3">
        <Button variant="outline" size="lg" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => i - 1)}>
          <ArrowLeft className="h-4 w-4" /> Previous
        </Button>
        {isLast ? (
          <Link href="/licence-prep" className={cn(buttonVariants({ size: "lg" }), "flex-1")}>
            Finish
          </Link>
        ) : (
          <Button size="lg" className="flex-1" onClick={() => setStepIndex((i) => i + 1)}>
            Next step <ArrowRight />
          </Button>
        )}
      </div>

      {allDone && (
        <Card className="mt-5 flex items-center gap-3 border-success/30 bg-success/[0.06] p-4">
          <PartyPopper className="h-5 w-5 text-success" />
          <p className="text-sm font-medium text-success">
            You&apos;ve practised every step. Now run through it for real until it feels automatic.
          </p>
        </Card>
      )}

      {/* Common faults */}
      <Card className={cn(glass, "mt-5 p-6")}>
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
          <AlertTriangle className="h-4 w-4 text-warning" /> Common faults to avoid
        </h3>
        <ul className="mt-3 space-y-2">
          {mod.commonFaults.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
              {f}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
