import { Suspense } from "react";
import { QuestionPractice } from "@/components/study/question-practice";
import { DrivingLoader } from "@/components/ui/driving-loader";

export default function QuestionsPage() {
  return (
    <Suspense fallback={<DrivingLoader label="Building your session" />}>
      <QuestionPractice />
    </Suspense>
  );
}
