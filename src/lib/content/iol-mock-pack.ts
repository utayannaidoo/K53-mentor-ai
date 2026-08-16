import type { Flashcard, Question } from "@/types";

/**
 * Sprint — angles surfaced by the IOL Cape Argus mock test (25 May 2026).
 *
 * Its 192 questions were reviewed against the regulations; the large majority
 * were already covered by the bank, and IOL's own answer key proved unreliable
 * (six demonstrable errors, listed in the fact file). Only items that are both
 * NEW here and verifiable against a primary source were adopted, and several are
 * deliberately worded to correct what that quiz taught. Facts trace to
 * docs/content/facts/rules.md §"IOL mock-test batch".
 *
 * Code gating follows the existing convention: motorcycle items ["A1","A"],
 * heavy items ["10","14"], everything else universal.
 */
export const IOL_MOCK_QUESTIONS: Question[] = [
  // ── RULES — universal ──────────────────────────────────────
  {
    id: "q_iol_signal_30m",
    categoryId: "rules",
    prompt: "How far before a turn must you start indicating?",
    options: [
      "At the moment you begin to turn the steering wheel",
      "At least 30 m before the turn — roughly three seconds at 40 km/h",
      "At least 100 m before, on every road",
      "Only if another vehicle is close enough to be affected",
    ],
    correctIndex: 1,
    explanation:
      "The K53 turning routine puts the signal at least 30 m ahead of the turn, so following and oncoming drivers can act on it. Signalling as you swing the wheel is an announcement, not a warning — by then nobody can use the information.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_iol_shoulder_courtesy",
    categoryId: "rules",
    prompt:
      "On a single-lane road a faster vehicle comes up behind you. When may you move left of the yellow line onto the shoulder to let it pass?",
    options: [
      "Any time you are travelling slower than the traffic behind you",
      "Only between sunrise and sunset, with at least 150 m of clear visibility, and only if it is safe",
      "Only when the vehicle behind flashes its headlights at you",
      "Never — the shoulder may not be used for this under any circumstances",
    ],
    correctIndex: 1,
    explanation:
      "Regulation 298A allows the courtesy move on a single-lane carriageway in daylight, with 150 m of clear view ahead, and only when safe — never on a blind rise, and never as a passing lane on a freeway. The shoulder can hide pedestrians, cyclists and stationary vehicles, which is why the conditions are this tight.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_iol_hydrant_1_5",
    categoryId: "parking",
    prompt: "How close to a fire hydrant may you park on its side of the roadway?",
    options: [
      "No closer than 1,5 m on either side of it",
      "No closer than 5 m on either side of it",
      "No closer than 9 m on either side of it",
      "There is no distance rule as long as the hydrant stays visible",
    ],
    correctIndex: 0,
    explanation:
      "Regulation 305 keeps 1,5 m clear on each side of a hydrant so a fire crew can couple to it without moving your car first. The same regulation sets 9 m for a pedestrian crossing and 5 m for an intersection — three different distances, so learn them apart.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_iol_broken_beside_solid",
    categoryId: "signs",
    prompt:
      "The centre of the road is marked with a broken line and a solid line side by side. You may cross to overtake:",
    options: [
      "Whenever the road ahead is clear, from either side",
      "Only if the broken line is the one on your side of the marking",
      "Only if the solid line is the one on your side of the marking",
      "Never — a double marking always prohibits overtaking",
    ],
    correctIndex: 1,
    explanation:
      "The line nearer to you is the one that governs you. Broken on your side means overtaking is allowed when it is safe; solid on your side is a barrier line you may not cross or straddle. The pairing exists because sight distance is often adequate in one direction and not the other.",
    difficulty: 3,
    scope: "learners",
  },

  // ── RULES — motorcycle (A / A1) ────────────────────────────
  {
    id: "q_iol_mc_load_front",
    categoryId: "rules",
    codes: ["A1", "A"],
    prompt: "Goods carried on a motorcycle may not project forward more than:",
    options: [
      "150 mm beyond the front mudguard",
      "300 mm beyond the front edge of the front wheel",
      "600 mm beyond the centre of the front-wheel axle",
      "There is no forward limit if the load is securely strapped",
    ],
    correctIndex: 2,
    explanation:
      "The limit is 600 mm forward of the centre of the front-wheel axle. Anything further shifts weight ahead of the steering, spoils the balance the bike depends on, and reaches into a gap you cannot see over.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_iol_mc_load_side",
    categoryId: "rules",
    codes: ["A1", "A"],
    prompt: "How far to the side may a load on a motorcycle project?",
    options: [
      "No more than 150 mm beyond the widest part of the frame",
      "No more than 300 mm beyond the ends of the handlebars",
      "No more than 450 mm on either side of the wheels",
      "As far as the pillion footrests, on either side",
    ],
    correctIndex: 2,
    explanation:
      "The limit is 450 mm on either side of the wheels — measured from the wheels, not from the handlebars. A load wider than your mirrors changes the gap you can filter or park through, and it is the part of the bike you are least likely to feel catching something.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_iol_mc_one_hand",
    categoryId: "rules",
    codes: ["A1", "A"],
    prompt: "While riding a motorcycle on a public road, the law requires you to keep:",
    options: [
      "Both hands on the handlebars at all times, without exception",
      "At least one hand on the handlebars at all times",
      "Both feet on the footrests, with no rule about the hands",
      "One hand free at all times, ready to give a hand signal",
    ],
    correctIndex: 1,
    explanation:
      "The requirement is at least one hand on the handlebars — which is precisely what makes a hand signal lawful. It also means letting go with both hands to adjust a helmet, check a strap or reach for anything is an offence, however briefly.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_iol_mc_no_tow",
    categoryId: "rules",
    codes: ["A1", "A"],
    prompt: "May you use a motorcycle to tow another vehicle on a public road?",
    options: [
      "Yes, if a rigid tow-bar is fitted rather than a rope",
      "Yes, provided the engine capacity is above 750 cc",
      "Yes, as long as you keep below 30 km/h",
      "No — a motorcycle may not be used to tow another vehicle",
    ],
    correctIndex: 3,
    explanation:
      "A motorcycle may not tow. The bike has no reserve of stability to lend: any pull off the centre line, or a shove from the towed vehicle under braking, goes straight into a machine that stays upright only while it is balanced.",
    difficulty: 2,
    scope: "learners",
  },

  // ── RULES — heavy (10 / 14) ────────────────────────────────
  {
    id: "q_iol_hv_width",
    categoryId: "rules",
    codes: ["10", "14"],
    prompt:
      "Without an abnormal-load permit, the overall width of a heavy vehicle and its load may not exceed:",
    options: ["2,2 m", "2,6 m", "3,0 m", "3,5 m"],
    correctIndex: 1,
    explanation:
      "2,6 m is the limit; beyond it you need an abnormal-load permit and the escorting and routing conditions that come with it. The figure is set by what fits a standard lane with room for oncoming traffic, not by what the vehicle can carry.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_iol_hv_length",
    categoryId: "rules",
    codes: ["10", "14"],
    prompt: "The maximum permitted length is 12,5 m for a rigid vehicle. For a semi-trailer combination it is:",
    options: ["15 m", "18 m", "22 m", "25 m"],
    correctIndex: 2,
    explanation:
      "A rigid vehicle is capped at 12,5 m and an articulated combination at 22 m. Length is what decides whether you can complete a turn without mounting the kerb or blocking the intersection behind you — check it against the route, not just against the load.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_iol_hv_rear_flag",
    categoryId: "rules",
    codes: ["10", "14"],
    prompt:
      "A load projects beyond the rear of your vehicle. From what projection must you display a 300 mm square red flag by day?",
    options: [
      "From 300 mm of projection",
      "From 600 mm of projection",
      "From 1 m of projection",
      "Only once it reaches the 1,8 m maximum",
    ],
    correctIndex: 0,
    explanation:
      "The flag goes up from 300 mm of rear projection (a red light or reflector does the same job at night), and the projection may never exceed 1,8 m. A following driver judges your rear end by your lights — an unmarked overhang is invisible until it is through their windscreen.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_iol_hv_tare",
    categoryId: "rules",
    codes: ["10", "14"],
    prompt: "The 'tare' of a vehicle is:",
    options: [
      "The heaviest load it may legally carry",
      "Its mass ready for the road but without payload, driver or passengers",
      "The mass carried by its heaviest single axle",
      "Its mass when loaded to the manufacturer's maximum",
    ],
    correctIndex: 1,
    explanation:
      "Tare is the empty, road-ready mass; GVM is the maximum permitted laden mass. Payload is the difference between them — which is why reading GVM as 'what I may load' overloads the vehicle by the mass of the vehicle itself.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_iol_hv_age18",
    categoryId: "rules",
    codes: ["10", "14"],
    prompt: "The minimum age to obtain a code EC (14) articulated-vehicle driving licence is:",
    options: ["17", "18", "21", "25"],
    correctIndex: 1,
    explanation:
      "18 is the minimum age for a code EC licence. Age is only the entry condition, though — driving the combination for hire or reward also needs a professional driving permit.",
    difficulty: 1,
    scope: "learners",
  },

  // ── CONTROLS — heavy (10 / 14) ─────────────────────────────
  {
    id: "q_iol_hv_dual_gauges",
    categoryId: "controls",
    codes: ["10", "14"],
    prompt: "Why does an air-braked heavy vehicle have two air-pressure needles rather than one?",
    options: [
      "One reads the brakes and the other reads the tyres",
      "They read the primary and secondary brake circuits separately, so a failure in one is visible while the other still holds",
      "One is a spare in case the first gauge breaks",
      "One reads the truck's air and the other reads the air conditioning",
    ],
    correctIndex: 1,
    explanation:
      "The braking system is split into two independent circuits, and each needle reads one of them. A single gauge would average the fault away; two let you see one circuit bleeding down while the other is still holding pressure — which is the warning you act on.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q_iol_hv_splitter",
    categoryId: "controls",
    codes: ["10", "14"],
    prompt: "What does the range-change (splitter) switch on the gear lever do?",
    options: [
      "Locks the drive axles together for traction on loose ground",
      "Selects high or low range, so each gate position gives two ratios instead of one",
      "Applies the exhaust brake when you lift off the throttle",
      "Limits the engine's maximum speed to the legal road limit",
    ],
    correctIndex: 1,
    explanation:
      "The splitter doubles up the gearbox: the same lever positions serve a low and a high range, which is how a multi-speed box offers a dozen or more ratios through a small gate. It is not a diff-lock and it is not a brake — those are separate controls.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q_iol_hv_tacho",
    categoryId: "controls",
    codes: ["10", "14"],
    prompt: "The tachometer on a heavy vehicle's instrument panel shows:",
    options: [
      "Road speed in km/h",
      "Engine speed in r/min, used to hold the economical band and pick the right gear",
      "The distance the vehicle has covered",
      "The pressure stored in the brake reservoirs",
    ],
    correctIndex: 1,
    explanation:
      "The tachometer reads engine revolutions, not road speed — the speedometer does that. On a long descent it is the gauge that tells you the gear is right: engine braking that holds your speed without over-revving keeps you off the service brakes.",
    difficulty: 2,
    scope: "learners",
  },

  // ── SIGNS ──────────────────────────────────────────────────
  {
    id: "q_iol_sign_axle_load",
    categoryId: "signs",
    prompt: "A red-bordered round sign shows an axle symbol with a mass such as '5t'. It limits:",
    options: [
      "The total mass of any vehicle using the road",
      "The mass that may be carried on any one axle",
      "The mass of the trailer only",
      "The number of axles a vehicle may have",
    ],
    correctIndex: 1,
    explanation:
      "This caps the massload per axle, not the vehicle's total. A truck within its GVM can still break it if the load sits over one axle — which is exactly the case the sign is protecting a weak bridge or road surface against.",
    difficulty: 3,
    scope: "learners",
  },
];

export const IOL_MOCK_FLASHCARDS: Flashcard[] = [
  // Universal
  { id: "fciol_signal_30m", categoryId: "rules", front: "How early must you indicate before a turn?", back: "At least 30 m — about three seconds at 40 km/h. Signalling as you turn the wheel is too late to be a warning.", difficulty: 2 },
  { id: "fciol_shoulder_298a", categoryId: "rules", front: "When may you use the yellow-line shoulder to let a faster vehicle pass?", back: "Single-lane road, sunrise to sunset, 150 m of clear visibility, and only if safe (reg 298A). Never as a passing lane on a freeway.", difficulty: 3 },
  { id: "fciol_hydrant_15", categoryId: "parking", front: "Parking distance from a fire hydrant?", back: "1,5 m clear either side of it. (Reg 305 also: 9 m from a pedestrian crossing, 5 m from an intersection.)", difficulty: 3 },
  { id: "fciol_broken_beside_solid", categoryId: "signs", front: "Broken and solid centre lines side by side — may you overtake?", back: "Only if the BROKEN line is on your side. From the solid side it's a barrier line.", difficulty: 3 },

  // Motorcycle
  { id: "fciol_mc_projection", categoryId: "rules", codes: ["A1", "A"], front: "Load projection limits on a motorcycle?", back: "600 mm forward of the front-wheel axle centre; 450 mm either side of the wheels.", difficulty: 3 },
  { id: "fciol_mc_one_hand", categoryId: "rules", codes: ["A1", "A"], front: "Hands on the handlebars — what does the law require?", back: "At least ONE hand at all times. That's what makes a hand signal legal — and reaching for anything with both hands off illegal.", difficulty: 2 },
  { id: "fciol_mc_no_tow", categoryId: "rules", codes: ["A1", "A"], front: "May a motorcycle tow another vehicle?", back: "No — never. A bike has no stability to spare for a load that pulls it off balance.", difficulty: 2 },

  // Heavy
  { id: "fciol_hv_dimensions", categoryId: "rules", codes: ["10", "14"], front: "Maximum dimensions without an abnormal-load permit?", back: "Height 4,3 m · width 2,6 m · length 12,5 m rigid, 22 m for a semi-trailer combination.", difficulty: 3 },
  { id: "fciol_hv_rear_flag", categoryId: "rules", codes: ["10", "14"], front: "When must a rear-projecting load carry a red flag?", back: "From 300 mm of projection — 300 mm square red flag by day, red light/reflector at night. Maximum projection 1,8 m.", difficulty: 3 },
  { id: "fciol_hv_tare", categoryId: "rules", codes: ["10", "14"], front: "Tare vs GVM?", back: "Tare = empty road-ready mass. GVM = maximum laden mass. Payload is the difference — GVM is not 'what you may load'.", difficulty: 2 },
  { id: "fciol_hv_age", categoryId: "rules", codes: ["10", "14"], front: "Minimum age for a code EC (14) licence?", back: "18. Driving for hire or reward also needs a PrDP.", difficulty: 1 },
  { id: "fciol_hv_dual_gauges", categoryId: "controls", codes: ["10", "14"], front: "Why two air-pressure needles?", back: "They read the primary and secondary brake circuits separately, so you can see one bleeding down while the other still holds.", difficulty: 3 },
  { id: "fciol_hv_splitter", categoryId: "controls", codes: ["10", "14"], front: "Range-change / splitter switch?", back: "Selects high or low range, so each gate position gives two ratios. Not a diff-lock, not a brake.", difficulty: 2 },
  { id: "fciol_hv_tacho", categoryId: "controls", codes: ["10", "14"], front: "Tachometer vs speedometer?", back: "Tachometer = engine r/min (hold the economy band, pick the gear on a descent). Speedometer = road speed.", difficulty: 2 },

  // Signs
  { id: "fciol_sign_axle", categoryId: "signs", front: "Red circle with an axle symbol and a mass?", back: "Limits the massload PER AXLE, not the vehicle total — a truck inside its GVM can still break it if the load sits over one axle.", difficulty: 3 },
];
