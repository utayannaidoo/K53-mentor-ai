import { Suspense } from "react";
import { FlashcardDeck } from "@/components/study/flashcard-deck";
import { Spinner } from "@/components/ui/spinner";

export default function FlashcardsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner className="h-6 w-6" /></div>}>
      <FlashcardDeck />
    </Suspense>
  );
}
