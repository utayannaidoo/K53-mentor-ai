import type { Flashcard, Question } from "@/types";

/**
 * Sprint 5 — Vehicle controls & K53 yard/road test pack. Facts trace to
 * docs/content/facts/controls-yard.md. Avoids the angles already covered
 * (pedals, warning lights, hill-start sequence, mirrors timing) and adds the
 * yard-test structure and manoeuvres, observation discipline, steering
 * technique, cockpit/pre-trip routine, clutch and reversing habits. Universal.
 */
export const CONTROLS_PACK_QUESTIONS: Question[] = [
  // ── K53 practical structure ─────────────────────────────────
  {
    id: "q8_ctrl_two_parts",
    categoryId: "controls",
    prompt: "The K53 practical driving test is made up of:",
    options: [
      "A written test and a road test",
      "A yard test and a road test — both must be passed",
      "Only a yard test",
      "A theory test and a parking test",
    ],
    correctIndex: 1,
    explanation:
      "The practical has two parts: the yard test (manoeuvres in a controlled area) and the road test (real traffic). Fail either and you fail the whole test.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q8_ctrl_yard_manoeuvres",
    categoryId: "controls",
    prompt: "Which set of manoeuvres is tested in the K53 yard test?",
    options: [
      "Emergency stop, hill climb, skid recovery",
      "Turn in the road (3-point), alley docking, parallel parking and incline start",
      "Reverse around a corner and a figure-eight",
      "Only parallel parking",
    ],
    correctIndex: 1,
    explanation:
      "The yard test checks turn-in-the-road, alley docking, parallel parking and the incline start — the everyday manoeuvres you'll need in tight spaces.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q8_ctrl_incline_rollback",
    categoryId: "controls",
    prompt: "On the incline (hill) start in the yard test, which mistake is an immediate failure?",
    options: [
      "Taking too long",
      "Rolling backwards before you move off",
      "Signalling early",
      "Changing into second gear too soon",
    ],
    correctIndex: 1,
    explanation:
      "Rolling back on the incline is an instant fail — it means a real hill start could roll into the car behind. Hold on the handbrake until the clutch bites.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q8_ctrl_yard_contact",
    categoryId: "controls",
    prompt: "During a yard manoeuvre your vehicle touches a pole (or the demarcation line). This:",
    options: [
      "Costs a few points but you can continue",
      "Fails that manoeuvre — contact with a pole, kerb or line is a fail",
      "Only matters in parallel parking",
      "Is ignored if you correct quickly",
    ],
    correctIndex: 1,
    explanation:
      "A pole represents another car or a wall. Touching a pole, kerb or line fails the manoeuvre, because in the real world that's a collision.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q8_ctrl_alley_dock",
    categoryId: "controls",
    prompt: "The goal of alley docking is to:",
    options: [
      "Drive forward into a bay as fast as possible",
      "Reverse into a marked bay and finish fully inside it without touching poles or lines",
      "Parallel park between two cars",
      "Do a three-point turn in the bay",
    ],
    correctIndex: 1,
    explanation:
      "Alley docking mimics reversing into a driveway or loading bay: back in under control, using observation, and stop completely within the markings.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Observation discipline ──────────────────────────────────
  {
    id: "q8_ctrl_observe_every_move",
    categoryId: "controls",
    prompt: "In the yard and road test, how often must you do a full observation (mirrors + blind spot)?",
    options: [
      "Once, at the start",
      "Before every movement — moving off, changing direction and reversing",
      "Only when other vehicles are near",
      "Only before turning right",
    ],
    correctIndex: 1,
    explanation:
      "The examiner watches your head. A fresh mirror-and-blind-spot check before each movement is scored every time — a missed 'look' is a classic loss of points.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q8_ctrl_moving_off_look",
    categoryId: "controls",
    prompt: "Just before pulling away from the kerb, in addition to your mirrors you must:",
    options: [
      "Sound the hooter",
      "Glance over your right shoulder to check the blind spot for traffic and cyclists",
      "Rev the engine",
      "Switch on your hazards",
    ],
    correctIndex: 1,
    explanation:
      "Mirrors miss the blind spot beside and behind you. A shoulder glance before moving off catches the cyclist or car the mirror never showed.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q8_ctrl_reverse_observe",
    categoryId: "controls",
    prompt: "When reversing, the correct way to observe is to:",
    options: [
      "Use only the rear-view mirror",
      "Look over your shoulder through the rear window (and check around) — not just the mirrors",
      "Rely on the reverse camera alone",
      "Watch the side mirror only",
    ],
    correctIndex: 1,
    explanation:
      "Mirrors and cameras have blind spots low and to the sides where a small child can hide. Turn and look through the rear window, checking all round before and during.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Steering & handling ─────────────────────────────────────
  {
    id: "q8_ctrl_steering_method",
    categoryId: "controls",
    prompt: "The K53 steering method uses:",
    options: [
      "One hand at the top of the wheel",
      "The pull–push method, feeding the wheel with hands roughly at quarter-to-three, without crossing your arms",
      "Crossing your arms for sharp turns",
      "Letting the wheel spin back by itself",
    ],
    correctIndex: 1,
    explanation:
      "Pull–push (feeding the wheel) keeps both hands in control and your arms clear of the airbag. Crossing hands or letting the wheel spin back loses control and marks.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q8_ctrl_wheel_recovery",
    categoryId: "controls",
    prompt: "After completing a turn, you should:",
    options: [
      "Let the steering wheel spin back through your hands on its own",
      "Feed the wheel back under control, keeping your hands on it",
      "Take both hands off until you're straight",
      "Hold the wheel still and wait",
    ],
    correctIndex: 1,
    explanation:
      "Letting the wheel spin freely means you're not in control if it snags or the car reacts. Guide it back with the same pull–push feed.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q8_ctrl_hands_on",
    categoryId: "controls",
    prompt: "While driving normally you should keep:",
    options: [
      "One hand on the wheel and one on the gear lever at all times",
      "Both hands on the wheel except briefly when changing gear or operating a control",
      "Both hands off on straight roads",
      "One hand resting out the window",
    ],
    correctIndex: 1,
    explanation:
      "Two hands give the control you need for a sudden swerve. Take a hand off only as long as a gear change or control needs it, then straight back on.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Cockpit / pre-trip ──────────────────────────────────────
  {
    id: "q8_ctrl_cockpit_order",
    categoryId: "controls",
    prompt: "Before starting the engine (cockpit drill), a sensible order is:",
    options: [
      "Start engine, then adjust seat and mirrors",
      "Doors closed, seat, head restraint, mirrors, seatbelt; handbrake up and neutral, then start",
      "Seatbelt only, then drive off",
      "Mirrors after you've pulled away",
    ],
    correctIndex: 1,
    explanation:
      "Set everything you can't safely fix while moving — position, mirrors, belt — before you start. Handbrake up and neutral means the car can't lurch on ignition.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q8_ctrl_pretrip_exterior",
    categoryId: "controls",
    prompt: "A proper pre-trip walk-around of the OUTSIDE of the vehicle includes checking:",
    options: [
      "Only the fuel level",
      "Tyres, fluid leaks under the car, lights and indicators, and the number plates",
      "The radio and air-con",
      "Nothing — modern cars self-check",
    ],
    correctIndex: 1,
    explanation:
      "A ten-second walk-around catches a soft tyre, a leak or a dead brake light before they become a breakdown or a fine — cheap insurance every trip.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q8_ctrl_start_neutral",
    categoryId: "controls",
    prompt: "Before turning the key to start a manual car, the gear lever should be in:",
    options: [
      "First gear",
      "Neutral (with the clutch depressed as a safeguard)",
      "Reverse",
      "Any gear — it doesn't matter",
    ],
    correctIndex: 1,
    explanation:
      "Starting in gear can jerk the car forward. Neutral — clutch in to be safe — means the engine starts without the car moving.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Clutch, gears, braking ──────────────────────────────────
  {
    id: "q8_ctrl_ride_clutch",
    categoryId: "controls",
    prompt: "Resting your foot on the clutch pedal while driving ('riding the clutch') is a bad habit because it:",
    options: [
      "Saves fuel",
      "Wears the clutch out early and reduces your control of the car",
      "Improves gear changes",
      "Is required in traffic",
    ],
    correctIndex: 1,
    explanation:
      "A part-pressed clutch slips and overheats, wearing it out, and takes a foot away from proper control. Foot off the clutch except when changing gear or moving off/stopping.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q8_ctrl_reverse_stationary",
    categoryId: "controls",
    prompt: "You should select REVERSE gear only when the vehicle is:",
    options: [
      "Rolling slowly forward",
      "Completely stationary",
      "In second gear",
      "On a downhill slope",
    ],
    correctIndex: 1,
    explanation:
      "Engaging reverse while still moving forward grinds the gearbox. Come to a full stop first, then select reverse.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q8_ctrl_right_gear",
    categoryId: "controls",
    prompt: "Choosing the correct gear for your speed means:",
    options: [
      "Always using the highest gear to save fuel",
      "Matching the gear to the road speed — not labouring in too high a gear or over-revving in too low",
      "Staying in first gear in town",
      "Changing gear as rarely as possible",
    ],
    correctIndex: 1,
    explanation:
      "The right gear keeps the engine in its comfortable range, ready to respond. Too high labours and stalls; too low over-revs and wastes control and fuel.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q8_ctrl_cover_brake",
    categoryId: "controls",
    prompt: "'Covering the brake' means:",
    options: [
      "Pressing the brake lightly the whole time",
      "Lifting off the accelerator and holding your foot ready over the brake when a hazard may develop",
      "Putting a cover over the brake pedal",
      "Braking with your left foot",
    ],
    correctIndex: 1,
    explanation:
      "Near schools, crossings and blind spots, hovering over the brake shaves crucial metres off your reaction — you're already halfway to stopping if a child steps out.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Stalling & progressive braking ──────────────────────────
  {
    id: "q8_ctrl_stall_recovery",
    categoryId: "controls",
    prompt: "You stall at a traffic light. The correct recovery is to:",
    options: [
      "Restart quickly while still in gear and revs high",
      "Apply the handbrake, select neutral, restart, then move off with the full procedure",
      "Push the car out of the way",
      "Switch on hazards and wait for help",
    ],
    correctIndex: 1,
    explanation:
      "Handbrake up secures the car, neutral lets it start safely, then move off properly. A panicked restart in gear can jerk you into the intersection.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q8_ctrl_progressive_brake",
    categoryId: "controls",
    prompt: "Smooth, safe braking means you:",
    options: [
      "Stamp hard at the last moment",
      "Look well ahead and brake progressively (squeeze) in good time",
      "Pump the brakes rapidly on dry roads",
      "Brake only with the handbrake",
    ],
    correctIndex: 1,
    explanation:
      "Progressive braking — early, squeezed, easing off as you stop — keeps the car stable and passengers comfortable, and leaves room if something changes.",
    difficulty: 1,
    scope: "learners",
  },
];

export const CONTROLS_PACK_FLASHCARDS: Flashcard[] = [
  // Yard test
  { id: "fc8_two_parts", categoryId: "controls", front: "Two parts of the K53 practical test?", back: "Yard test + road test — both must be passed.", difficulty: 1 },
  { id: "fc8_yard_manoeuvres", categoryId: "controls", front: "The four yard-test manoeuvres?", back: "Turn in the road, alley docking, parallel parking, incline start.", difficulty: 2 },
  { id: "fc8_incline_fail", categoryId: "controls", front: "Instant fail on the incline start?", back: "Rolling backwards before moving off — hold on the handbrake until the clutch bites.", difficulty: 1 },
  { id: "fc8_pole_contact", categoryId: "controls", front: "Touch a pole/kerb/line in a manoeuvre?", back: "Fails that manoeuvre — it represents a real collision.", difficulty: 2 },
  { id: "fc8_alley_dock", categoryId: "controls", front: "Alley docking goal?", back: "Reverse into the bay and finish fully inside, no pole/line contact.", difficulty: 2 },

  // Observation
  { id: "fc8_observe_every", categoryId: "controls", front: "How often to do full observation?", back: "Before EVERY movement — moving off, changing direction, reversing. The examiner watches your head.", difficulty: 2 },
  { id: "fc8_moving_off_look", categoryId: "controls", front: "Before pulling away from the kerb?", back: "Mirror check PLUS a shoulder glance for the blind-spot cyclist/car.", difficulty: 1 },
  { id: "fc8_reverse_look", categoryId: "controls", front: "Observing while reversing?", back: "Look over your shoulder through the rear window — not just mirrors/camera.", difficulty: 2 },

  // Steering
  { id: "fc8_steer_method", categoryId: "controls", front: "K53 steering method?", back: "Pull–push, feed the wheel, hands ~quarter-to-three, don't cross arms.", difficulty: 2 },
  { id: "fc8_wheel_recovery", categoryId: "controls", front: "After a turn, the wheel?", back: "Feed it back under control — never let it spin back on its own.", difficulty: 2 },
  { id: "fc8_hands_on", categoryId: "controls", front: "Hands while driving?", back: "Both on the wheel except briefly to change gear or use a control.", difficulty: 1 },

  // Cockpit / pre-trip
  { id: "fc8_cockpit", categoryId: "controls", front: "Cockpit drill before starting?", back: "Doors, seat, head restraint, mirrors, belt; handbrake up + neutral, then start.", difficulty: 2 },
  { id: "fc8_pretrip_ext", categoryId: "controls", front: "Pre-trip walk-around checks?", back: "Tyres, leaks under the car, lights/indicators, number plates, clean glass.", difficulty: 1 },
  { id: "fc8_start_neutral", categoryId: "controls", front: "Gear before starting a manual?", back: "Neutral (clutch in as a safeguard) — never in gear.", difficulty: 1 },

  // Clutch / gears / brake
  { id: "fc8_ride_clutch", categoryId: "controls", front: "Riding the clutch — why bad?", back: "Wears it out and cuts your control. Foot off except to change gear or move off/stop.", difficulty: 2 },
  { id: "fc8_reverse_stat", categoryId: "controls", front: "When to select reverse?", back: "Only when completely stationary — otherwise you grind the gearbox.", difficulty: 1 },
  { id: "fc8_right_gear", categoryId: "controls", front: "Correct gear for speed?", back: "Match gear to speed — don't labour too high or over-rev too low.", difficulty: 2 },
  { id: "fc8_cover_brake", categoryId: "controls", front: "Covering the brake?", back: "Foot poised over the brake near hazards/crossings — shaves off reaction distance.", difficulty: 2 },
  { id: "fc8_stall", categoryId: "controls", front: "Stalled at a robot — recovery?", back: "Handbrake up, neutral, restart, then move off with the full procedure.", difficulty: 2 },
  { id: "fc8_progressive", categoryId: "controls", front: "Smooth braking?", back: "Look ahead, brake early and progressively (squeeze) — don't stamp.", difficulty: 1 },
];
