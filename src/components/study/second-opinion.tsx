"use client";

import * as React from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { localSecondOpinion } from "@/lib/ai/coach";
import type { Question } from "@/types";

/**
 * "Explain it differently" — a one-tap re-explanation with a fresh angle for
 * the moment the standard explanation doesn't click. Key the component by
 * question id so state resets per question.
 */
export function SecondOpinion({
  question,
  chosenIndex,
}: {
  question: Question;
  chosenIndex: number | null;
}) {
  const [phase, setPhase] = React.useState<"idle" | "loading" | "done">("idle");
  const [text, setText] = React.useState("");

  async function ask() {
    setPhase("loading");
    const data = {
      prompt: question.prompt,
      correct: question.options[question.correctIndex],
      chosen:
        chosenIndex != null && chosenIndex >= 0 ? question.options[chosenIndex] : undefined,
      explanation: question.explanation,
    };
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "second_opinion", data }),
      });
      const j = res.ok ? await res.json() : null;
      setText(j?.text && typeof j.text === "string" ? j.text : localSecondOpinion(data));
    } catch {
      setText(localSecondOpinion(data));
    }
    setPhase("done");
  }

  if (phase === "idle") {
    return (
      <button
        type="button"
        onClick={ask}
        className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <RefreshCw className="h-4 w-4" /> Explain it differently
      </button>
    );
  }

  if (phase === "loading") {
    return (
      <div className="mt-3 space-y-2" aria-label="Getting another explanation">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>
    );
  }

  return (
    <div className="mt-3 animate-fade-in rounded-lg border border-primary/25 bg-primary/[0.05] p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
        <Sparkles className="h-3.5 w-3.5" /> Another way to see it
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground">{text}</p>
    </div>
  );
}
