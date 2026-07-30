"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TutorChat, type InitialContext } from "@/components/tutor/tutor-chat";
import { contextLabel, starterPrompt } from "@/lib/ai/tutor-context";
import { useContentPool } from "@/components/content/content-provider";
import { Spinner } from "@/components/ui/spinner";
import type { CategoryId } from "@/types";

function TutorInner() {
  const sp = useSearchParams();
  const { questions, flashcards } = useContentPool();
  const question = sp.get("question");
  const card = sp.get("card");
  const category = sp.get("category");

  let ctxInput: { type: "question" | "card" | "category"; id: string } | null = null;
  if (question) ctxInput = { type: "question", id: question };
  else if (card) ctxInput = { type: "card", id: card };
  else if (category) ctxInput = { type: "category", id: category };

  // Resolve the anchor item from the learner's own pool rather than from the
  // bank. Both the chip label and the composer's starter prompt are derived
  // here so <TutorChat> needs no content at all — it used to look the item up
  // itself, which is what put the whole bank on this route.
  let initial: InitialContext | null = null;
  if (ctxInput) {
    const item =
      ctxInput.type === "question"
        ? (questions.find((q) => q.id === ctxInput!.id) ?? null)
        : ctxInput.type === "card"
          ? (flashcards.find((f) => f.id === ctxInput!.id) ?? null)
          : null;
    const categoryId =
      ctxInput.type === "category" ? (ctxInput.id as CategoryId) : (item?.categoryId ?? null);
    const label = contextLabel(ctxInput.type, categoryId);
    initial = { ...ctxInput, label, prompt: starterPrompt(ctxInput.type, item, label) };
  }

  return <TutorChat initial={initial} />;
}

export default function TutorPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner className="h-6 w-6" /></div>}>
      <TutorInner />
    </Suspense>
  );
}
