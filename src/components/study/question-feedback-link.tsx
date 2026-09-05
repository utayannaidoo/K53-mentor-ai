import { Flag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  questionFeedbackHref,
  type QuestionFeedbackContext,
} from "@/lib/content/question-feedback";
import { cn } from "@/lib/utils";
import type { Question } from "@/types";

/** Opens a pre-addressed correction draft; no report is sent without the learner. */
export function QuestionFeedbackLink({
  question,
  context,
  className,
}: {
  question: Pick<Question, "id" | "categoryId" | "prompt">;
  context: QuestionFeedbackContext;
  className?: string;
}) {
  return (
    <a
      href={questionFeedbackHref(question, context)}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "min-h-11 shrink-0 px-2 text-xs text-muted-foreground hover:text-foreground",
        className,
      )}
      aria-label={`Report a problem with question ${question.id}`}
    >
      <Flag className="h-3.5 w-3.5" />
      Report this question
    </a>
  );
}
