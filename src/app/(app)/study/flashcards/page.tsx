import { Suspense } from "react";
import { FlashcardDeck } from "@/components/study/flashcard-deck";
import { DrivingLoader } from "@/components/ui/driving-loader";

export default function FlashcardsPage() {
  return (
    <Suspense fallback={<DrivingLoader label="Shuffling your deck" />}>
      <FlashcardDeck />
    </Suspense>
  );
}
