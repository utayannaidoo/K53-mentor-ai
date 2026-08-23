import { Suspense } from "react";
import { QuestionPractice } from "@/components/study/question-practice";
import { DrivingLoader } from "@/components/ui/driving-loader";

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  // Keying on ?category= remounts the session when a query-only navigation
  // lands here — e.g. tapping the summary's "Drill X" card while already on
  // this route. QuestionPractice builds its queue once at mount and would
  // otherwise keep showing the finished session.
  const { category } = await searchParams;
  return (
    <Suspense fallback={<DrivingLoader label="Building your session" />}>
      <QuestionPractice key={category ?? "all"} />
    </Suspense>
  );
}
