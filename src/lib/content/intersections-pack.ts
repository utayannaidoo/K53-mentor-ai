import type { Flashcard, Question } from "@/types";

/**
 * Sprint 4 — Intersections & right of way pack. Facts trace to
 * docs/content/facts/intersections.md. Deliberately avoids the angles already
 * covered (basic 4-way order, dead robot, roundabout yield, amber, box
 * junction) and adds stop-street vs yield behaviour, uncontrolled give-way,
 * stale green, turning-right-without-a-filter, circle discipline, zip merges
 * and the "right of way is given" principle. Universal items.
 */
export const INTERSECTIONS_PACK_QUESTIONS: Question[] = [
  // ── Priority principles ─────────────────────────────────────
  {
    id: "q7_int_given_not_taken",
    categoryId: "intersections",
    prompt: "You have right of way at a junction, but another driver edges out anyway. You should:",
    options: [
      "Hold your course — the rules are on your side",
      "Give way to avoid a collision — right of way is given, never taken",
      "Hoot and accelerate through",
      "Flash your lights and continue",
    ],
    correctIndex: 1,
    explanation:
      "Being right doesn't stop a crash. The K53 principle is that right of way is given: yield to a driver who's taking it, even when the law says it was yours.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q7_int_stop_street_empty",
    categoryId: "intersections",
    prompt: "You reach a stop street (stop sign) at a quiet T-junction and can clearly see the road is empty. You must:",
    options: [
      "Roll through slowly since it's clear",
      "Come to a complete stop behind the line, then proceed when safe",
      "Slow to walking pace and continue",
      "Stop only if another vehicle is visible",
    ],
    correctIndex: 1,
    explanation:
      "A stop sign demands a full stop every time — wheels stopped, behind the line — regardless of how clear it looks. Rolling it is a common and easy fail.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q7_int_yield_vs_stop",
    categoryId: "intersections",
    prompt: "The difference between a stop street and a YIELD sign at a junction is:",
    options: [
      "They are identical",
      "A stop street needs a full stop every time; at a yield you may keep moving if the way is genuinely clear",
      "A yield needs a full stop; a stop street does not",
      "Yield applies only to trucks",
    ],
    correctIndex: 1,
    explanation:
      "Stop = always halt. Yield = give way, roll through only when clear. Treating a yield like a stop wastes flow; treating a stop like a yield fails your test.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q7_int_uncontrolled_right",
    categoryId: "intersections",
    prompt: "You and another car reach an unmarked intersection (no signs, robots or lines) at the same moment. Priority goes to:",
    options: [
      "The faster vehicle",
      "The vehicle on your right",
      "The larger vehicle",
      "Whoever hoots first",
    ],
    correctIndex: 1,
    explanation:
      "At an uncontrolled intersection the first to arrive goes first; if you arrive together, give way to the vehicle on your right. Approach ready to yield either way.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q7_int_minor_major",
    categoryId: "intersections",
    prompt: "A minor side road meets a main through road with no stop or yield line. As you approach on the minor road you should:",
    options: [
      "Continue — you have equal right of way",
      "Give way to traffic on the through road; the terminating road yields",
      "Speed up to merge before the main-road traffic",
      "Stop only if a sign tells you to",
    ],
    correctIndex: 1,
    explanation:
      "Traffic on the road that ends at the junction yields to the through road. Even without a sign, defensive practice is to give way to the established flow.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Robots ──────────────────────────────────────────────────
  {
    id: "q7_int_stale_green",
    categoryId: "intersections",
    prompt: "A robot has been green for a while as you approach at speed. The best defensive action is to:",
    options: [
      "Accelerate to get through before it changes",
      "Ease off, cover the brake and be ready to stop — a 'stale' green is about to change",
      "Maintain speed and assume it stays green",
      "Hoot to warn cross traffic",
    ],
    correctIndex: 1,
    explanation:
      "A long-standing green is a stale green: it will change. Anticipate amber, ease off and cover the brake so you're not forced to gamble on beating the light.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q7_int_turn_right_no_arrow",
    categoryId: "intersections",
    prompt: "Your light is a full green (no right-turn arrow) and you want to turn right, but oncoming traffic is heavy. You should:",
    options: [
      "Wait behind the stop line until the light turns red",
      "Move forward into the intersection and complete the turn when a safe gap appears — even as the light changes",
      "Turn immediately; green gives you priority",
      "Reverse and wait for a quieter time",
    ],
    correctIndex: 1,
    explanation:
      "With no filter arrow you may edge into the intersection and turn when a gap opens, clearing on amber/red if needed. Waiting behind the line means never getting a turn.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q7_int_green_still_yield",
    categoryId: "intersections",
    prompt: "You have a green light and are turning left. Pedestrians are crossing the road you're turning into. You must:",
    options: [
      "Proceed — green gives you the right of way over pedestrians",
      "Give way to the pedestrians before completing your turn",
      "Hoot so they hurry",
      "Turn behind them at speed",
    ],
    correctIndex: 1,
    explanation:
      "Green permits the movement but never cancels yielding. Pedestrians crossing your exit road have right of way — turn only once they're clear.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Turning ─────────────────────────────────────────────────
  {
    id: "q7_int_left_cyclist",
    categoryId: "intersections",
    prompt: "Just before turning left at a junction, the most important extra check is:",
    options: [
      "The rear-view mirror only",
      "The left mirror and blind spot for a cyclist or motorcyclist alongside you",
      "The radio",
      "The right blind spot",
    ],
    correctIndex: 1,
    explanation:
      "Left turns catch cyclists and motorcyclists who've come up your left side. A left mirror plus blind-spot glance before committing prevents the classic left-hook crash.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q7_int_two_right_lanes",
    categoryId: "intersections",
    prompt: "You and another car turn right side-by-side from twin right-turn lanes into a dual carriageway. You should:",
    options: [
      "Drift across into whichever lane is open",
      "Stay in your own lane throughout the turn, exiting into the matching lane",
      "Cut in front of the other car",
      "Speed up to claim both lanes",
    ],
    correctIndex: 1,
    explanation:
      "Twin turn lanes map onto matching exit lanes: hold your lane through the whole turn. Swinging wide side-swipes the car beside you.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q7_int_observation_sequence",
    categoryId: "intersections",
    prompt: "The correct order of actions before turning at a junction is:",
    options: [
      "Turn, then signal",
      "Mirrors, signal in good time, blind-spot check, then turn",
      "Signal and turn at the same moment",
      "Blind spot only, then turn",
    ],
    correctIndex: 1,
    explanation:
      "Mirror–signal–blind spot–manoeuvre. Signalling early tells others your plan; the blind-spot check catches what mirrors miss before you commit.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q7_int_oncoming_both_right",
    categoryId: "intersections",
    prompt: "You're turning right and the oncoming car is going straight. Right of way belongs to:",
    options: [
      "You — you signalled first",
      "The oncoming vehicle going straight — you must wait for a safe gap",
      "The larger vehicle",
      "Whoever reaches the centre first",
    ],
    correctIndex: 1,
    explanation:
      "A right turn crosses the oncoming stream, so the through traffic has priority. Wait in position until there's a genuinely safe gap.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Traffic circles ─────────────────────────────────────────
  {
    id: "q7_int_circle_signal_exit",
    categoryId: "intersections",
    prompt: "Inside a traffic circle, when should you switch on your LEFT indicator?",
    options: [
      "Never — indicators aren't used in circles",
      "As you pass the exit BEFORE the one you intend to take",
      "Only after you've left the circle",
      "Before entering the circle",
    ],
    correctIndex: 1,
    explanation:
      "Signalling left as you pass the previous exit tells following and waiting drivers you're about to leave, so they can move. It's the courtesy that keeps circles flowing.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q7_int_circle_no_stop",
    categoryId: "intersections",
    prompt: "You've entered a traffic circle but your exit is briefly blocked by a pedestrian. You should:",
    options: [
      "Stop in the circle and wait",
      "Keep moving around the circle and try the exit again rather than stopping in the circulating lane",
      "Reverse to your entry point",
      "Mount the central island to wait",
    ],
    correctIndex: 1,
    explanation:
      "Stopping inside a circle blocks circulating traffic. If your exit is momentarily blocked, continue round and approach it again once it clears.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q7_int_circle_gap",
    categoryId: "intersections",
    prompt: "Approaching a traffic circle with vehicles already circulating, you must:",
    options: [
      "Enter immediately — entering traffic has priority",
      "Wait and enter only into a safe gap; vehicles already in the circle have priority",
      "Force your way in so you don't hold up the queue",
      "Stop fully in the circle before choosing an exit",
    ],
    correctIndex: 1,
    explanation:
      "Circulating traffic (coming from your right) has priority. Enter only when there's a real gap — nudging in expecting others to brake causes the typical circle bump.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Merging & blind junctions ───────────────────────────────
  {
    id: "q7_int_zip_merge",
    categoryId: "intersections",
    prompt: "Two lanes of moving traffic are merging into one where a lane ends. The correct method is to:",
    options: [
      "Force your way to the front",
      "Zip merge — take turns, one vehicle from each lane, merging in good time",
      "Stop and wait for a total gap",
      "Straddle both lanes to block others",
    ],
    correctIndex: 1,
    explanation:
      "A zip merge alternates one car from each lane. Merging early and taking turns keeps traffic moving; racing to the front or blocking causes the jam.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q7_int_blind_junction",
    categoryId: "intersections",
    prompt: "A parked truck hides your view as you approach an intersection you must cross. You should:",
    options: [
      "Cross quickly while you have a gap in what you can see",
      "Creep forward slowly until you can actually see both ways, then proceed when clear",
      "Rely on hearing for approaching traffic",
      "Hoot once and go",
    ],
    correctIndex: 1,
    explanation:
      "You can't yield to what you can't see. Edge out just far enough to get a clear view before committing — never cross on an assumption.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q7_int_ped_already_crossing",
    categoryId: "intersections",
    prompt: "A pedestrian is already halfway across the road you want to turn into. You should:",
    options: [
      "Turn in front of them quickly",
      "Wait — a pedestrian already crossing has right of way; let them clear first",
      "Turn behind them at speed",
      "Edge forward to make them hurry",
    ],
    correctIndex: 1,
    explanation:
      "Someone already in the road has right of way over a turning vehicle. Waiting a few seconds is the difference between a courtesy and a collision.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q7_int_emergency_side",
    categoryId: "intersections",
    prompt: "As you approach a green robot, an ambulance with lights and siren is entering the intersection from your right. You should:",
    options: [
      "Proceed — your light is green",
      "Stop and give way; an emergency vehicle overrides your green light",
      "Speed up to clear before it arrives",
      "Follow it through the intersection",
    ],
    correctIndex: 1,
    explanation:
      "A green light never outranks an emergency vehicle. Stop and let it through, then proceed when the way is clear — and never tail it through the junction.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q7_int_left_turn_lane_discipline",
    categoryId: "intersections",
    prompt: "Turning left at an intersection, the correct road position beforehand is:",
    options: [
      "In the centre of the road",
      "Close to the left, in the correct lane, having signalled early",
      "In the right-hand lane, then cut across",
      "Wherever there's a gap",
    ],
    correctIndex: 1,
    explanation:
      "Position left in good time so your intention is obvious and you don't swing across other lanes. Early signal, correct lane, then a tidy turn.",
    difficulty: 1,
    scope: "learners",
  },
];

export const INTERSECTIONS_PACK_FLASHCARDS: Flashcard[] = [
  // Priority
  { id: "fc7_given_not_taken", categoryId: "intersections", front: "Core right-of-way principle?", back: "Right of way is GIVEN, never taken — yield to avoid a crash even when you're 'right'.", difficulty: 2 },
  { id: "fc7_stop_empty", categoryId: "intersections", front: "Stop street on an empty road?", back: "Full stop behind the line every time — 'looked clear' is a fail.", difficulty: 1 },
  { id: "fc7_stop_vs_yield_junction", categoryId: "intersections", front: "Stop street vs yield sign?", back: "Stop = always halt. Yield = give way, roll through only if clear.", difficulty: 1 },
  { id: "fc7_uncontrolled", categoryId: "intersections", front: "Unmarked intersection, arrive together?", back: "Give way to the vehicle on your RIGHT (first to arrive otherwise goes first).", difficulty: 2 },
  { id: "fc7_minor_major", categoryId: "intersections", front: "Minor road meets through road?", back: "The terminating (minor) road yields to through traffic.", difficulty: 2 },

  // Robots
  { id: "fc7_stale_green", categoryId: "intersections", front: "Stale (long-standing) green?", back: "About to change — ease off, cover the brake, be ready to stop.", difficulty: 2 },
  { id: "fc7_right_no_arrow", categoryId: "intersections", front: "Turning right, full green, no filter arrow?", back: "Move into the intersection; complete the turn on a safe gap, clearing on amber/red.", difficulty: 3 },
  { id: "fc7_green_still_yield", categoryId: "intersections", front: "Green light but pedestrians crossing your turn?", back: "Give way — green permits the move but never cancels yielding.", difficulty: 2 },

  // Turning
  { id: "fc7_left_cyclist", categoryId: "intersections", front: "Key check before a left turn?", back: "Left mirror + blind spot for a cyclist/motorcyclist alongside — avoids the left-hook.", difficulty: 2 },
  { id: "fc7_twin_right", categoryId: "intersections", front: "Twin right-turn lanes — lane discipline?", back: "Stay in your own lane through the whole turn; exit into the matching lane.", difficulty: 3 },
  { id: "fc7_sequence", categoryId: "intersections", front: "Order of actions before a turn?", back: "Mirrors → signal (early) → blind spot → turn.", difficulty: 1 },
  { id: "fc7_right_yield_oncoming", categoryId: "intersections", front: "Turning right, oncoming going straight?", back: "They have priority — wait for a safe gap.", difficulty: 1 },
  { id: "fc7_left_position", categoryId: "intersections", front: "Road position for a left turn?", back: "Close to the left, correct lane, signalled early.", difficulty: 1 },

  // Circles
  { id: "fc7_circle_signal", categoryId: "intersections", front: "When to indicate left in a circle?", back: "As you pass the exit BEFORE the one you're taking.", difficulty: 3 },
  { id: "fc7_circle_no_stop", categoryId: "intersections", front: "Exit briefly blocked inside a circle?", back: "Keep circulating and try again — never stop in the circle.", difficulty: 3 },
  { id: "fc7_circle_gap", categoryId: "intersections", front: "Entering a circle with traffic circulating?", back: "Circulating traffic (from your right) has priority — enter only on a safe gap.", difficulty: 2 },

  // Merging / blind / pedestrians
  { id: "fc7_zip", categoryId: "intersections", front: "Two lanes merging into one?", back: "Zip merge — alternate one from each lane, merge in good time.", difficulty: 2 },
  { id: "fc7_blind", categoryId: "intersections", front: "View blocked at a junction?", back: "Creep forward until you can actually see, then proceed when clear.", difficulty: 2 },
  { id: "fc7_ped_crossing", categoryId: "intersections", front: "Pedestrian already crossing your turn road?", back: "They have right of way — wait for them to clear.", difficulty: 1 },
  { id: "fc7_emergency_green", categoryId: "intersections", front: "Emergency vehicle vs your green light?", back: "It overrides your green — stop, give way, don't tail it.", difficulty: 2 },
];
