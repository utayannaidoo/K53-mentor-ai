"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NaviAvatar } from "@/components/shared/navi-avatar";
import { track } from "@/lib/analytics";
import { glassFloat } from "@/lib/utils";

export interface NaviGuideStep {
  target: string;
  eyebrow: string;
  title: string;
  body: string;
}

type Highlight = { left: number; top: number; width: number; height: number } | null;

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/** A reusable, optional orientation which points at the real product UI. */
export function NaviGuide({
  steps,
  onDismiss,
  onFinish,
  finishLabel = "Finish tour",
  label = "Welcome feature tour",
  tourId = "app",
}: {
  steps: readonly NaviGuideStep[];
  onDismiss: () => void;
  onFinish: () => void;
  finishLabel?: string;
  label?: string;
  tourId?: string;
}) {
  const [stepIndex, setStepIndex] = React.useState(0);
  const [highlight, setHighlight] = React.useState<Highlight>(null);
  const [panelPlacement, setPanelPlacement] = React.useState<"top" | "bottom">("bottom");
  const panelRef = React.useRef<HTMLElement>(null);
  const step = steps[stepIndex];
  const lastStep = stepIndex === steps.length - 1;

  React.useEffect(() => {
    track("navi_tour_step_viewed", { tour: tourId, step: stepIndex + 1, of: steps.length });
  }, [tourId, stepIndex, steps.length]);

  React.useEffect(() => {
    const findTarget = () =>
      Array.from(document.querySelectorAll<HTMLElement>(step.target)).find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }) ?? null;

    const target = findTarget();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });

    const updateHighlight = () => {
      const element = findTarget();
      if (!element) {
        setHighlight(null);
        return;
      }
      const rect = element.getBoundingClientRect();
      const padding = 7;
      setPanelPlacement(rect.top + rect.height / 2 > window.innerHeight / 2 ? "top" : "bottom");
      setHighlight({
        left: Math.max(8, rect.left - padding),
        top: Math.max(8, rect.top - padding),
        width: Math.min(window.innerWidth - 16, rect.width + padding * 2),
        height: Math.min(window.innerHeight - 16, rect.height + padding * 2),
      });
    };

    const frame = window.requestAnimationFrame(updateHighlight);
    const timeout = window.setTimeout(updateHighlight, reduceMotion ? 0 : 360);
    window.addEventListener("resize", updateHighlight);
    window.addEventListener("scroll", updateHighlight, true);
    panelRef.current?.focus();
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.removeEventListener("resize", updateHighlight);
      window.removeEventListener("scroll", updateHighlight, true);
    };
  }, [step]);

  const dismiss = React.useCallback(() => {
    track("navi_tour_skipped", { tour: tourId, step: stepIndex + 1, of: steps.length });
    onDismiss();
  }, [onDismiss, tourId, stepIndex, steps.length]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
        return;
      }
      // aria-modal promises assistive tech that focus stays in the panel;
      // without a trap, Tab walked into the dimmed page underneath.
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dismiss]);

  function advance() {
    if (lastStep) {
      track("navi_tour_completed", { tour: tourId, of: steps.length });
      onFinish();
      return;
    }
    setStepIndex((current) => current + 1);
  }

  return (
    <div className="fixed inset-0 z-[60]" aria-label={label}>
      {/* The backdrop blocks the page but is not a skip control: a stray tap
          on the dimmed area used to end the whole multi-page orientation for
          good. Skipping stays an explicit choice (Skip tour / Escape). */}
      <div aria-hidden className="absolute inset-0" />
      {highlight ? (
        <div
          aria-hidden
          className="pointer-events-none fixed rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-background"
          style={{
            left: highlight.left,
            top: highlight.top,
            width: highlight.width,
            height: highlight.height,
            boxShadow: "0 0 0 9999px hsl(var(--foreground) / 0.46)",
          }}
        />
      ) : (
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-foreground/45" />
      )}

      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="navi-guide-title"
        tabIndex={-1}
        className={`${glassFloat} absolute inset-x-4 mx-auto max-h-[calc(100dvh-2rem)] max-w-xl overflow-y-auto rounded-2xl border p-4 shadow-soft-lg outline-none transition-[top,bottom] duration-200 ease-glass sm:p-5 ${
          panelPlacement === "top"
            ? "top-4 sm:top-6"
            : "bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6"
        }`}
      >
        <div className="flex gap-3 sm:gap-4">
          <NaviAvatar priority className="h-16 w-16 self-start sm:h-20 sm:w-20" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.14em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Navi · {step.eyebrow} · {stepIndex + 1} of {steps.length}
            </p>
            <h2 id="navi-guide-title" className="mt-1 font-display text-lg font-semibold tracking-tight">
              {step.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
          {stepIndex > 0 ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setStepIndex((current) => current - 1)}>
              <ArrowLeft /> Back
            </Button>
          ) : (
            <button type="button" onClick={dismiss} className="px-2 text-xs font-medium text-muted-foreground hover:text-foreground">
              Skip tour
            </button>
          )}
          <Button type="button" size="sm" onClick={advance}>
            {lastStep ? finishLabel : "Next"} <ArrowRight />
          </Button>
        </div>
      </section>
    </div>
  );
}
