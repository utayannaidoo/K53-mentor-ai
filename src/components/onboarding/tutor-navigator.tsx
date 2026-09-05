"use client";

import { useRouter } from "next/navigation";
import { NaviGuide, type NaviGuideStep } from "@/components/onboarding/navi-guide";

const TOUR_STEPS: readonly NaviGuideStep[] = [
  {
    target: "[data-tutorial='today-plan']",
    eyebrow: "Your daily route",
    title: "Start with Today",
    body: "I’ve already put your next few tasks in order. Start with the first one — you never need to decide what to study from scratch.",
  },
  {
    target: "[data-tutorial='study-areas']",
    eyebrow: "Your learning picture",
    title: "See the areas that need you",
    body: "This is where your assessed study areas live. Take the starting check when you’re ready and I’ll use real answers, not guesses, to shape your plan.",
  },
  {
    target: "[data-tutorial='study-nav']",
    eyebrow: "Your study menu",
    title: "Choose how you want to practise",
    body: "Study is the hands-on menu: missions, flashcards, questions, signs, scenarios, mocks and controls. Next, Navi will show you where each choice lives.",
  },
  {
    target: "[data-tutorial='tutor-nav']",
    eyebrow: "Help when you need it",
    title: "Ask Navi anything",
    body: "Open Navi for a plain-language explanation, a worked example, or help when a rule does not make sense. I’ll stay with you as you practise.",
  },
  {
    target: "[data-tutorial='progress-nav']",
    eyebrow: "Your evidence",
    title: "Progress shows what your practice is changing",
    body: "Open Progress for readiness, mastery, streaks, mock results and the areas still needing work. Navi will explain the page after the Study and Tutor previews.",
  },
  {
    target: "[data-tutorial='licence-prep-nav']",
    eyebrow: "The next licence",
    title: "Licence Prep is always visible, even before you pay",
    body: "You can see the full yard-test menu now. If you are on Free, the lessons stay locked after the tour and the cards take you to the plan that unlocks them.",
  },
  {
    target: "[data-tutorial='account-nav']",
    eyebrow: "Your controls",
    title: "Account keeps your plan and preferences together",
    body: "Use Account to change your study profile, theme, data saver, reminders and billing. Navi will take you there last so you know where to manage the app.",
  },
];

/** First-run orientation before Navi takes the learner into Study. */
export function TutorNavigator({ onComplete }: { onComplete: () => void }) {
  const router = useRouter();

  return (
    <NaviGuide
      steps={TOUR_STEPS}
      onDismiss={onComplete}
      onFinish={() => {
        router.push("/study?tour=1");
      }}
      finishLabel="Explore Study"
      tourId="dashboard"
    />
  );
}
