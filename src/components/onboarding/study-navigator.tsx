"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { NaviGuide, type NaviGuideStep } from "@/components/onboarding/navi-guide";
import { useStudyStore } from "@/hooks/use-study-store";

const STUDY_STEPS: readonly NaviGuideStep[] = [
  {
    target: "[data-tutorial='study-missions']",
    eyebrow: "Start here",
    title: "Let Today choose the next small win",
    body: "These are your missions: a short, useful sequence based on your real activity. Tap the first one when you want a simple answer to “what should I study now?”",
  },
  {
    target: "[data-tutorial='study-flashcards']",
    eyebrow: "Build recall",
    title: "Use flashcards and questions differently",
    body: "Choose Flashcards to recall an idea, reveal it, then rate how it felt. Choose Practice questions for a K53-style answer and a clear explanation of why it is right.",
  },
  {
    target: "[data-tutorial='study-scanner']",
    eyebrow: "Explore the rules",
    title: "Get help with signs, scenarios and controls",
    body: "Road signs is your reference library. Controls is vehicle-specific. Scenarios help you reason through a road situation, and Sign scanner can explain a sign from a photo when it is available on your plan.",
  },
  {
    target: "[data-tutorial='study-mock']",
    eyebrow: "Practise test day",
    title: "Use mocks when you want realistic pressure",
    body: "Mock exam is the full 64-question paper. Choose Mini mock for a 15-question, 12-minute check-in, or Section drills to practise one exam section at its real pass mark.",
  },
  {
    target: "[data-tutorial='study-categories']",
    eyebrow: "Choose a topic",
    title: "Open a category when you know what to work on",
    body: "Each category opens a focused practice session. A category stays “Not assessed” until you give us real answers — Navi will never fill in a score that you did not earn.",
  },
];

/** Opens only from Navi's first-run route and ends in a real practice session. */
export function StudyNavigator() {
  const router = useRouter();
  const { completeFirstRunTour } = useStudyStore();
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    setActive(new URLSearchParams(window.location.search).get("tour") === "1");
  }, []);

  if (!active) return null;

  const dismiss = () => {
    setActive(false);
    completeFirstRunTour();
    router.replace("/study");
  };

  const finish = () => {
    setActive(false);
    router.push("/study/questions");
  };

  return (
    <NaviGuide
      steps={STUDY_STEPS}
      onDismiss={dismiss}
      onFinish={finish}
      finishLabel="Try practice questions"
      label="Navi's Study tour"
      tourId="study"
    />
  );
}
