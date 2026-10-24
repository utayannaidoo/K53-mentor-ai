import type { CategoryId, Question } from "@/types";
import { STARTER_QUESTIONS } from "./starter";

/**
 * The public question-and-answer pages, one per study category.
 *
 * Drawn from the starter pack only — the set that already ships to every
 * browser without an account — so nothing here publishes more of the bank than
 * a signed-out visitor could already reach through the free quiz. The full
 * bank stays behind /api/content/pack.
 *
 * Slugs are the phrases people search ("k53 rules of the road questions"), not
 * the internal category ids.
 */
export const QUESTION_PAGES: {
  slug: string;
  categoryId: CategoryId;
  /** Reads after "K53 … questions and answers". */
  topic: string;
  intro: string;
}[] = [
  {
    slug: "road-signs",
    categoryId: "signs",
    topic: "road signs",
    intro:
      "Road signs, signals and markings make up 28 of the 64 questions in the learner's licence test, and you need 23 right. Each question shows a sign and asks what it means or what you must do.",
  },
  {
    slug: "rules-of-the-road",
    categoryId: "rules",
    topic: "rules of the road",
    intro:
      "Rules of the road is a 28-question section with a pass mark of 22. It covers speed limits, overtaking, lights, seat belts, alcohol limits and what the law requires after a crash.",
  },
  {
    slug: "vehicle-controls",
    categoryId: "controls",
    topic: "vehicle controls",
    intro:
      "Vehicle controls is the smallest section of the learner's test — 8 questions, pass mark 6 — which makes it the easiest to fail by accident. Two wrong answers is the limit.",
  },
  {
    slug: "intersections",
    categoryId: "intersections",
    topic: "intersections and right of way",
    intro:
      "Four-way stops, traffic circles, robots and turning are examined inside the rules-of-the-road section. These are the questions that ask who goes first.",
  },
  {
    slug: "parking-and-stopping",
    categoryId: "parking",
    topic: "parking and stopping",
    intro:
      "Where you may not park or stop is tested as a set of exact distances — from an intersection, a pedestrian crossing, a fire hydrant, a bridge. These questions come from the rules-of-the-road section.",
  },
  {
    slug: "following-distance",
    categoryId: "following_distance",
    topic: "following distance",
    intro:
      "The two-second rule, why it is counted in seconds rather than metres, and when to leave more — examined inside the rules-of-the-road section.",
  },
  {
    slug: "hazard-awareness",
    categoryId: "hazard_awareness",
    topic: "hazard awareness",
    intro:
      "Reading the road ahead, anticipating what other road users will do and driving defensively — the judgement questions in the rules-of-the-road section.",
  },
];

export function questionPageBySlug(slug: string) {
  return QUESTION_PAGES.find((p) => p.slug === slug);
}

export function questionsFor(categoryId: CategoryId): Question[] {
  return STARTER_QUESTIONS.filter((q) => q.categoryId === categoryId);
}
