import { Suspense } from "react";
import { MockExam } from "@/components/study/mock-exam";
import { Spinner } from "@/components/ui/spinner";

export default function MockExamPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner className="h-6 w-6" /></div>}>
      <MockExam />
    </Suspense>
  );
}
