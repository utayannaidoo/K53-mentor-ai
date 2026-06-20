import { Suspense } from "react";
import { QuestionPractice } from "@/components/study/question-practice";
import { Spinner } from "@/components/ui/spinner";

export default function QuestionsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner className="h-6 w-6" /></div>}>
      <QuestionPractice />
    </Suspense>
  );
}
