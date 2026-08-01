"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TutorChat, type InitialContext } from "@/components/tutor/tutor-chat";
import { resolveContext } from "@/lib/ai/tutor-prompt";
import { Spinner } from "@/components/ui/spinner";

function TutorInner() {
  const sp = useSearchParams();
  const question = sp.get("question");
  const card = sp.get("card");
  const category = sp.get("category");

  // `chose` is the option index the learner picked when they got it wrong —
  // carried from the practice screen so the tutor opens on the misconception.
  const choseRaw = sp.get("chose");
  const chosenIndex = choseRaw !== null && /^\d+$/.test(choseRaw) ? Number(choseRaw) : undefined;

  let ctxInput:
    | { type: "question" | "card" | "category"; id: string; chosenIndex?: number }
    | null = null;
  if (question) ctxInput = { type: "question", id: question, chosenIndex };
  else if (card) ctxInput = { type: "card", id: card };
  else if (category) ctxInput = { type: "category", id: category };

  const initial: InitialContext | null = ctxInput
    ? { ...ctxInput, label: resolveContext(ctxInput)?.label ?? null }
    : null;

  return <TutorChat initial={initial} />;
}

export default function TutorPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner className="h-6 w-6" /></div>}>
      <TutorInner />
    </Suspense>
  );
}
