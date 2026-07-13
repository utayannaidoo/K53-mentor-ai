import type { Flashcard, Question } from "@/types";

/**
 * AARTO demerit-point pack. Facts trace to docs/content/facts/aarto.md
 * (demerit-point allocation starts 1 September 2026). This is "know the law"
 * material adjacent to — not part of — the K53 learner's paper, so the batch is
 * deliberately modest and every item carries an explicit `source` override
 * pointing at AARTO rather than the K53 syllabus. Filed under `rules`.
 *
 * IDs use the aarto_/fca_ prefix. Universal (no code gating).
 */

const AARTO_SOURCE = "AARTO Act 46 of 1998 & the published demerit-point schedule";

export const AARTO_PACK_QUESTIONS: Question[] = [
  {
    id: "aarto_q_start_date",
    categoryId: "rules",
    prompt: "Under AARTO, demerit points start being added to drivers' records from:",
    options: ["1 September 2026", "1 January 2025", "1 March 2027", "The day you get your learner's"],
    correctIndex: 0,
    explanation:
      "AARTO's fine system rolled out earlier, but the demerit-point phase — where infringements add points that can suspend your licence — begins on 1 September 2026.",
    difficulty: 2,
    scope: "learners",
    source: AARTO_SOURCE,
  },
  {
    id: "aarto_q_what_is",
    categoryId: "rules",
    prompt: "What is a 'demerit point' under AARTO?",
    options: [
      "A reward point for good driving",
      "A point added to your record for a traffic infringement; enough of them suspend your licence",
      "A discount on your fine",
      "A point that lets you skip a fine",
    ],
    correctIndex: 1,
    explanation:
      "Demerit points accumulate against your driving record when you commit infringements. Reach the threshold and your licence is suspended — the opposite of a reward.",
    difficulty: 1,
    scope: "learners",
    source: AARTO_SOURCE,
  },
  {
    id: "aarto_q_learner_threshold",
    categoryId: "rules",
    prompt: "A learner driver's licence can be suspended once their demerit points exceed:",
    options: ["6 points", "15 points", "20 points", "There is no limit for learners"],
    correctIndex: 0,
    explanation:
      "Learners are held to a stricter standard — the threshold is 6 points, lower than the 15 points allowed for a fully licensed driver.",
    difficulty: 2,
    scope: "learners",
    source: AARTO_SOURCE,
  },
  {
    id: "aarto_q_licensed_threshold",
    categoryId: "rules",
    prompt: "For an ordinary licensed driver, the maximum demerit points before suspension is:",
    options: ["15 points", "6 points", "12 points", "30 points"],
    correctIndex: 0,
    explanation:
      "A fully licensed driver may hold up to 15 points. Going over suspends the licence for three months for every point above the limit.",
    difficulty: 2,
    scope: "learners",
    source: AARTO_SOURCE,
  },
  {
    id: "aarto_q_excess_suspension",
    categoryId: "rules",
    prompt: "Once you exceed the demerit-point threshold, your licence is suspended for:",
    options: [
      "Three months for each point over the limit",
      "One week, regardless of the excess",
      "A flat one year",
      "Only until you pay the fine",
    ],
    correctIndex: 0,
    explanation:
      "The suspension scales with how far you went over: three months per excess point. Two points over the limit means a six-month suspension.",
    difficulty: 3,
    scope: "learners",
    source: AARTO_SOURCE,
  },
  {
    id: "aarto_q_expiry",
    categoryId: "rules",
    prompt: "If you commit no new infringements, your AARTO demerit points reduce by:",
    options: [
      "One point every three months",
      "One point every week",
      "They never reduce",
      "All at once after a year",
    ],
    correctIndex: 0,
    explanation:
      "Drive cleanly and your points melt away — one point falls off for every three months without a new infringement, until you're back to zero.",
    difficulty: 2,
    scope: "learners",
    source: AARTO_SOURCE,
  },
  {
    id: "aarto_q_paying_fine",
    categoryId: "rules",
    prompt: "Does paying an AARTO infringement fine stop the demerit points from being added?",
    options: [
      "No — paying the fine still records the points",
      "Yes — paying the fine cancels the points",
      "Only if you pay within 24 hours",
      "Only for first offences",
    ],
    correctIndex: 0,
    explanation:
      "The points are recorded whether you pay the fine, receive an enforcement order, or are convicted in court. Paying settles the money, not the points.",
    difficulty: 3,
    scope: "learners",
    source: AARTO_SOURCE,
  },
  {
    id: "aarto_q_no_licence_points",
    categoryId: "rules",
    prompt: "Driving without a valid licence is a serious AARTO infringement, carrying about:",
    options: ["6 demerit points", "1 demerit point", "No points, only a fine", "2 demerit points"],
    correctIndex: 0,
    explanation:
      "Unlicensed driving is heavily penalised — around 6 points, which alone would breach a learner's 6-point threshold.",
    difficulty: 3,
    scope: "learners",
    source: AARTO_SOURCE,
  },
  {
    id: "aarto_q_stop_street_points",
    categoryId: "rules",
    prompt: "A minor infringement such as failing to stop at a stop line typically adds about:",
    options: ["2 demerit points", "10 demerit points", "No points at all", "6 demerit points"],
    correctIndex: 0,
    explanation:
      "Points scale with severity. A stop-line infringement is on the lower end at around 2 points, whereas reckless driving carries many more.",
    difficulty: 2,
    scope: "learners",
    source: AARTO_SOURCE,
  },
  {
    id: "aarto_q_cancellation",
    categoryId: "rules",
    prompt: "Under AARTO, what eventually happens to a driver who is suspended three times?",
    options: [
      "The licence is cancelled and they must re-apply and re-test",
      "Nothing changes after the third time",
      "They pay a single large fine and continue",
      "The points are wiped clean",
    ],
    correctIndex: 0,
    explanation:
      "A third suspension leads to cancellation — the driver loses the licence entirely and has to start the application and testing process again.",
    difficulty: 3,
    scope: "learners",
    source: AARTO_SOURCE,
  },
  {
    id: "aarto_q_when_added",
    categoryId: "rules",
    prompt: "AARTO demerit points are added to your record when:",
    options: [
      "The fine is paid, an enforcement order is issued, or you're convicted in court",
      "Only if a court convicts you",
      "Only if you ignore the fine",
      "The moment a camera flashes, automatically",
    ],
    correctIndex: 0,
    explanation:
      "There are three trigger points: paying the infringement, an enforcement order being issued against you, or a court conviction.",
    difficulty: 3,
    scope: "learners",
    source: AARTO_SOURCE,
  },
  {
    id: "aarto_q_why_learners_care",
    categoryId: "rules",
    prompt: "Why should a learner driver care about AARTO demerit points?",
    options: [
      "Learners can incur infringements too, and their 6-point threshold is reached quickly",
      "Points only ever apply to truck drivers",
      "Learners are completely exempt from AARTO",
      "Points only matter after you turn 25",
    ],
    correctIndex: 0,
    explanation:
      "A learner on the road can still be fined, and with only a 6-point buffer a single serious infringement can put their licence at risk.",
    difficulty: 2,
    scope: "learners",
    source: AARTO_SOURCE,
  },
  {
    id: "aarto_q_full_name",
    categoryId: "rules",
    prompt: "AARTO stands for the Administrative Adjudication of Road Traffic Offences. Its main aim is to:",
    options: [
      "Encourage safer driving by penalising repeat offenders through fines and demerit points",
      "Replace the driving test",
      "Collect tolls on the freeways",
      "Register new vehicles",
    ],
    correctIndex: 0,
    explanation:
      "AARTO handles traffic infringements administratively and, through the demerit system, targets repeat offenders to improve road safety.",
    difficulty: 2,
    scope: "learners",
    source: AARTO_SOURCE,
  },
  {
    id: "aarto_q_clean_record",
    categoryId: "rules",
    prompt: "The best way to keep your AARTO demerit record clear is to:",
    options: [
      "Drive lawfully — points fall away over time with no new infringements",
      "Pay every fine twice",
      "Only drive at night",
      "Change your licence number each year",
    ],
    correctIndex: 0,
    explanation:
      "There is no trick — consistent lawful driving lets the three-monthly reduction bring your points back to zero and keeps you well under the threshold.",
    difficulty: 1,
    scope: "learners",
    source: AARTO_SOURCE,
  },
];

export const AARTO_PACK_FLASHCARDS: Flashcard[] = [
  {
    id: "fca_start_date",
    categoryId: "rules",
    front: "When do AARTO demerit points start?",
    back: "1 September 2026 — that's when infringements begin adding points to your record.",
    difficulty: 2,
  },
  {
    id: "fca_what_is",
    categoryId: "rules",
    front: "What is an AARTO demerit point?",
    back: "A point added for a traffic infringement; enough of them suspend your licence.",
    difficulty: 1,
  },
  {
    id: "fca_learner_threshold",
    categoryId: "rules",
    front: "Learner driver's demerit-point threshold?",
    back: "6 points — stricter than the 15 allowed for a fully licensed driver.",
    difficulty: 2,
  },
  {
    id: "fca_licensed_threshold",
    categoryId: "rules",
    front: "Licensed driver's demerit-point threshold?",
    back: "15 points before the licence is suspended.",
    difficulty: 2,
  },
  {
    id: "fca_excess_suspension",
    categoryId: "rules",
    front: "How long is a licence suspended for exceeding the threshold?",
    back: "Three months for every point over the limit.",
    difficulty: 3,
  },
  {
    id: "fca_expiry",
    categoryId: "rules",
    front: "How do demerit points come off your record?",
    back: "One point is removed for every three months with no new infringement.",
    difficulty: 2,
  },
  {
    id: "fca_paying_fine",
    categoryId: "rules",
    front: "Does paying the fine cancel the demerit points?",
    back: "No — the points are still recorded even after you pay.",
    difficulty: 3,
  },
  {
    id: "fca_no_licence",
    categoryId: "rules",
    front: "Points for driving without a valid licence?",
    back: "About 6 — enough on its own to breach a learner's threshold.",
    difficulty: 3,
  },
  {
    id: "fca_stop_line",
    categoryId: "rules",
    front: "Points for a minor infringement like failing to stop at a line?",
    back: "Around 2 points — points scale with how serious the offence is.",
    difficulty: 2,
  },
  {
    id: "fca_cancellation",
    categoryId: "rules",
    front: "What happens after a third suspension?",
    back: "The licence is cancelled — you must re-apply and re-test.",
    difficulty: 3,
  },
  {
    id: "fca_when_added",
    categoryId: "rules",
    front: "When are demerit points added?",
    back: "When the fine is paid, an enforcement order is issued, or you're convicted in court.",
    difficulty: 3,
  },
  {
    id: "fca_meaning",
    categoryId: "rules",
    front: "What does AARTO stand for?",
    back: "Administrative Adjudication of Road Traffic Offences — the demerit + fine system.",
    difficulty: 1,
  },
];
