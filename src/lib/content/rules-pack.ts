import type { Flashcard, Question } from "@/types";

/**
 * Sprint 2 — Rules of the road pack. Every fact traces to
 * docs/content/facts/rules.md (NRTA + Regulations, Arrive Alive, AA;
 * verified July 2026). Universal items unless coded.
 */
export const RULES_PACK_QUESTIONS: Question[] = [
  // ── Freeway rules ───────────────────────────────────────────
  {
    id: "q5_rule_freeway_banned",
    categoryId: "rules",
    prompt: "Which of these is prohibited from using a freeway?",
    options: [
      "Motorcycles of 600 cm³",
      "Pedestrians, pedal cycles and motorcycles under 50 cm³",
      "Vehicles towing caravans",
      "Minibus taxis",
    ],
    correctIndex: 1,
    explanation:
      "Freeways exclude slow and unprotected users: pedestrians, animals, bicycles and motorcycles under 50 cm³. Their speed gap against 120 km/h traffic is lethal.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q5_rule_freeway_cross",
    categoryId: "rules",
    prompt: "Crossing a freeway on foot is:",
    options: [
      "Allowed at marked points",
      "An offence — pedestrians may not be on a freeway at all",
      "Allowed outside peak hours",
      "Allowed if you can see both ways",
    ],
    correctIndex: 1,
    explanation:
      "Pedestrians are prohibited from freeways entirely — walking along or across one is illegal and among the deadliest things a person can do on a road.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q5_rule_freeway_reverse",
    categoryId: "rules",
    prompt: "You miss your freeway exit. You should:",
    options: [
      "Reverse carefully along the shoulder to the exit",
      "Continue to the next exit and re-route",
      "Make a U-turn through the median",
      "Stop and wait for a gap to reverse",
    ],
    correctIndex: 1,
    explanation:
      "Reversing or turning on a freeway is prohibited and catastrophic at freeway speeds. A missed exit costs minutes; reversing can cost lives.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Lamps & visibility ──────────────────────────────────────
  {
    id: "q5_rule_lights_when",
    categoryId: "rules",
    prompt: "Your vehicle's headlamps must be on:",
    options: [
      "Only between 21:00 and 05:00",
      "From sunset to sunrise, and whenever people or vehicles aren't clearly visible at 150 m",
      "Only when other cars have theirs on",
      "Only on freeways at night",
    ],
    correctIndex: 1,
    explanation:
      "The trigger isn't the clock — it's visibility: sunset to sunrise, plus rain, mist or smoke that cuts visibility below the 150 m standard.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q5_rule_dim_oncoming",
    categoryId: "rules",
    prompt: "When must you dip (dim) your main-beam headlights?",
    options: [
      "Never — brights are safer",
      "When approaching oncoming traffic or following another vehicle, so you don't blind the driver",
      "Only inside urban areas",
      "Only when flashed by another driver",
    ],
    correctIndex: 1,
    explanation:
      "Main beams blind oncoming drivers and the driver ahead via their mirrors. Dip early — a blinded driver is a hazard aimed at you.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q5_rule_parked_visible",
    categoryId: "rules",
    prompt: "Driving in heavy rain at midday, the correct light setting is:",
    options: [
      "No lights — it's daytime",
      "Headlamps on (dipped) — you must be visible when the 150 m standard fails",
      "Hazard lights while moving",
      "Main beams for maximum light",
    ],
    correctIndex: 1,
    explanation:
      "Rain that hides vehicles at 150 m legally requires lamps, day or night. Hazards while moving are for actual emergencies, not weather.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Seatbelts & children ────────────────────────────────────
  {
    id: "q5_rule_belt_responsible",
    categoryId: "rules",
    prompt: "Who is legally responsible for ensuring passengers wear their seatbelts?",
    options: [
      "Each passenger for themselves",
      "The driver",
      "The vehicle owner",
      "Nobody — belts are voluntary for adults",
    ],
    correctIndex: 1,
    explanation:
      "The driver must ensure every occupant uses a belt where one is fitted. 'They didn't want to' is not a defence at a roadblock or in a crash.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q5_rule_infant_restraint",
    categoryId: "rules",
    prompt: "An infant travelling in a private car must:",
    options: [
      "Be held firmly by an adult",
      "Travel in an appropriate child restraint (car seat)",
      "Lie on the back seat",
      "Sit on the front passenger's lap with the belt around both",
    ],
    correctIndex: 1,
    explanation:
      "The law requires an appropriate child restraint for infants. In a 60 km/h crash a held baby effectively weighs hundreds of kilograms — no arms can hold that.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q5_rule_child_no_seat",
    categoryId: "rules",
    prompt: "A child is travelling and no child restraint is available. The driver must:",
    options: [
      "Let the child stand between the seats",
      "Seat the child where a seatbelt is available and ensure it's worn",
      "Put the child in the load bin",
      "Nothing — the rule only applies to infants",
    ],
    correctIndex: 1,
    explanation:
      "Order of duty: child restraint where available; otherwise a belted seat. An unrestrained child becomes a projectile for everyone in the car.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Overtaking ──────────────────────────────────────────────
  {
    id: "q5_rule_overtake_left",
    categoryId: "rules",
    prompt: "Overtaking on the LEFT is lawful when:",
    options: [
      "The vehicle ahead is driving slowly",
      "The vehicle ahead is turning right (and passing left is safe), or on a multi-lane road with lanes in your direction",
      "You are late",
      "Never, under any circumstances",
    ],
    correctIndex: 1,
    explanation:
      "Left is the exception, not the rule: a right-turner you can safely pass on the left, marked multi-lane roads, or an officer's direction. Anywhere else, overtake right.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q5_rule_overtake_where_not",
    categoryId: "rules",
    prompt: "Where is overtaking PROHIBITED even without a sign?",
    options: [
      "On any rural road",
      "Where you can't see the road ahead is clear — e.g. on a blind rise or curve, or when approaching a pedestrian crossing",
      "Within 5 km of a town",
      "Behind a truck",
    ],
    correctIndex: 1,
    explanation:
      "The standing rule: only overtake when you can see the way is clear and can return to your side safely. Blind rises, curves and crossings fail that test by definition.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q5_rule_being_overtaken",
    categoryId: "rules",
    prompt: "While being overtaken, you must:",
    options: [
      "Speed up to shorten the manoeuvre",
      "Keep left and NOT accelerate until the other vehicle has passed",
      "Move onto the shoulder immediately",
      "Flash your lights",
    ],
    correctIndex: 1,
    explanation:
      "Accelerating while being overtaken traps the other driver in the oncoming lane. Hold or ease your speed and let them complete the pass.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Emergency vehicles, officers, animals ───────────────────
  {
    id: "q5_rule_emergency_duty",
    categoryId: "rules",
    prompt: "An emergency vehicle approaches with siren and lights. You must:",
    options: [
      "Maintain your course — they'll go around",
      "Give immediate right of way: move as far left as safely possible and stop if necessary",
      "Speed up ahead of it",
      "Follow closely behind it through traffic",
    ],
    correctIndex: 1,
    explanation:
      "Sirens and lights command an immediate clear path. Following in its wake ('slipstreaming') is both illegal and how secondary crashes happen.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q5_rule_officer_overrides",
    categoryId: "rules",
    prompt: "A traffic officer's hand signal contradicts the traffic light. You obey:",
    options: [
      "The traffic light",
      "The officer — an officer's directions override signals and signs",
      "Whichever lets you proceed",
      "Neither — stop and wait",
    ],
    correctIndex: 1,
    explanation:
      "The hierarchy is: officer > temporary signs/signals > permanent signs/signals > rules. An officer waving you through a red light is lawful.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q5_rule_herded_animals",
    categoryId: "rules",
    prompt: "A herder is moving cattle across the road and signals you to stop. You must:",
    options: [
      "Hoot to scatter the animals",
      "Stop when signalled and wait — you must comply with the person in charge of the animals",
      "Drive slowly through the herd",
      "Reverse away",
    ],
    correctIndex: 1,
    explanation:
      "You must stop when the person in charge of animals signals it. Hooting scatters livestock into your path — the opposite of what you want.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Vehicle operation rules ─────────────────────────────────
  {
    id: "q5_rule_coasting",
    categoryId: "rules",
    prompt: "Coasting downhill in neutral (or clutch in) is:",
    options: [
      "Smart fuel-saving",
      "Prohibited — you lose engine braking and full control of the vehicle",
      "Allowed below 60 km/h",
      "Required for automatic vehicles",
    ],
    correctIndex: 1,
    explanation:
      "Freewheeling removes engine braking exactly where you need it and delays your response. It's an offence, not an economy technique.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q5_rule_reversing",
    categoryId: "rules",
    prompt: "You need to reverse out of a driveway across a busy pavement. The K53 approach is:",
    options: [
      "Reverse quickly to minimise time in the danger zone",
      "Full observation before AND during the reverse — pedestrians and traffic have right of way over your blind manoeuvre",
      "Hoot twice and reverse",
      "Ask a passenger to wave you out and rely on their signal",
    ],
    correctIndex: 1,
    explanation:
      "Reversing is legally limited to what is safe and necessary. Across a pavement you're crossing pedestrian space blind — look through the rear window and mirrors continuously, and stop the instant anything enters your path.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q5_rule_view_obstruction",
    categoryId: "rules",
    prompt: "Hanging items or stickers that obstruct the driver's view of the road are:",
    options: [
      "Fine if smaller than an A4 page",
      "Prohibited — nothing may obstruct your view through the windscreen",
      "Allowed on the passenger side only",
      "Allowed if they're safety-related",
    ],
    correctIndex: 1,
    explanation:
      "Your windscreen view is a legal requirement, not a preference. A hazard hidden behind an air freshener is still your fault.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q5_rule_hooter_use",
    categoryId: "rules",
    prompt: "You may lawfully use your hooter:",
    options: [
      "To greet friends",
      "Only when reasonably necessary to warn of danger",
      "To hurry the car ahead at a green light",
      "Any time outside urban areas",
    ],
    correctIndex: 1,
    explanation:
      "The hooter is a danger warning device. Every other use — greetings, frustration, celebration — is technically an offence and real-world noise aggression.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "q5_rule_unattended_kids",
    categoryId: "rules",
    prompt: "Passengers may be carried in the goods area (bakkie load bin) of a vehicle:",
    options: [
      "Freely — it's common practice",
      "Only under strict conditions; carrying people for reward in an open load bin is prohibited, and school children may not be transported for reward in one",
      "Only on gravel roads",
      "Only standing up",
    ],
    correctIndex: 1,
    explanation:
      "The load bin has no restraint or protection. The law tightly restricts carrying people there — especially prohibiting transporting schoolchildren for reward.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "q5_rule_following_emergency_scene",
    categoryId: "rules",
    prompt: "Passing a crash scene, your legal and defensive duty is to:",
    options: [
      "Slow down for a good look and take photos",
      "Pass slowly and carefully without stopping unnecessarily, obeying officers — rubbernecking causes secondary crashes",
      "Stop and direct traffic yourself",
      "Hoot to announce your approach",
    ],
    correctIndex: 1,
    explanation:
      "Unless you're involved or providing help, keep moving carefully under direction. Distracted gawking is a leading cause of the next collision.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Signals & hand signals ──────────────────────────────────
  {
    id: "q5_rule_hand_signal_right",
    categoryId: "rules",
    prompt: "Your indicators fail. To signal a RIGHT turn by hand you:",
    options: [
      "Point straight up out of the window",
      "Extend your right arm horizontally, straight out of the window",
      "Wave your arm in circles",
      "Flash your headlights twice",
    ],
    correctIndex: 1,
    explanation:
      "Arm straight out = turning right. Rotating the extended arm anticlockwise = slowing/stopping. Hand signals are the legal fallback when lamps fail.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "q5_rule_signal_timing",
    categoryId: "rules",
    prompt: "How early must you signal before turning or changing lanes?",
    options: [
      "As you start the manoeuvre",
      "In good time — long enough for others to see, understand and react before you move",
      "Exactly 3 seconds",
      "Signalling is optional if the road looks empty",
    ],
    correctIndex: 1,
    explanation:
      "A signal given during the manoeuvre is a commentary, not a warning. Signal early, check mirrors and blind spot, then act.",
    difficulty: 1,
    scope: "learners",
  },
];

export const RULES_PACK_FLASHCARDS: Flashcard[] = [
  // Freeway
  { id: "fc5_freeway_banned", categoryId: "rules", front: "Banned from freeways?", back: "Pedestrians, animals, pedal cycles, motorcycles under 50 cm³.", difficulty: 2 },
  { id: "fc5_freeway_missed_exit", categoryId: "rules", front: "Missed your freeway exit?", back: "Carry on to the next one. Reversing or U-turns on a freeway are prohibited and deadly.", difficulty: 1 },

  // Lamps
  { id: "fc5_lights_rule", categoryId: "rules", front: "When are headlamps compulsory?", back: "Sunset→sunrise, plus any time people/vehicles aren't clearly visible at 150 m (rain, mist, smoke).", difficulty: 2 },
  { id: "fc5_dip_rule", categoryId: "rules", front: "When to dip main beams?", back: "Approaching oncoming traffic or following another vehicle — don't blind anyone, even via mirrors.", difficulty: 1 },

  // Belts
  { id: "fc5_belts_driver", categoryId: "rules", front: "Whose job are passengers' seatbelts?", back: "The DRIVER'S — legally responsible for every occupant being belted where belts are fitted.", difficulty: 2 },
  { id: "fc5_infant_seat", categoryId: "rules", front: "Infants in a private car?", back: "Must be in an appropriate child restraint — an adult's arms can't hold crash forces.", difficulty: 2 },

  // Overtaking
  { id: "fc5_overtake_left", categoryId: "rules", front: "When may you pass on the LEFT?", back: "Vehicle ahead turning right (safe to pass left), multi-lane roads in your direction, or officer's direction.", difficulty: 2 },
  { id: "fc5_being_overtaken", categoryId: "rules", front: "Being overtaken — your duty?", back: "Keep left, do NOT accelerate until they're past.", difficulty: 1 },
  { id: "fc5_overtake_test", categoryId: "rules", front: "The universal overtaking test?", back: "Only when you can see the road is clear far enough to pass AND return safely. Blind rise/curve = never.", difficulty: 1 },

  // Authority & animals
  { id: "fc5_hierarchy", categoryId: "rules", front: "Officer vs robot vs sign — who wins?", back: "Officer > temporary signs > permanent signs/signals > general rules.", difficulty: 2 },
  { id: "fc5_emergency", categoryId: "rules", front: "Siren behind you?", back: "Immediate right of way: move left, stop if needed. Never tail it through traffic.", difficulty: 1 },
  { id: "fc5_herder", categoryId: "rules", front: "Herder signals stop for cattle?", back: "You must stop and wait. Don't hoot — scattered animals run anywhere, including at you.", difficulty: 2 },

  // Operation
  { id: "fc5_coasting", categoryId: "rules", front: "Downhill in neutral?", back: "Prohibited (coasting/freewheeling) — no engine braking, less control.", difficulty: 2 },
  { id: "fc5_reversing", categoryId: "rules", front: "Reversing rule?", back: "Only when safe and no further than necessary — full observation throughout.", difficulty: 1 },
  { id: "fc5_hooter", categoryId: "rules", front: "Legal hooter use?", back: "Only to warn of danger. Everything else is noise — and an offence.", difficulty: 1 },
  { id: "fc5_windscreen", categoryId: "rules", front: "Stickers/hangers near the windscreen?", back: "Nothing may obstruct the driver's view of the road.", difficulty: 1 },

  // Hand signals
  { id: "fc5_hand_right", categoryId: "rules", front: "Hand signal: right turn?", back: "Right arm straight out horizontally.", difficulty: 2 },
  { id: "fc5_hand_slow", categoryId: "rules", front: "Hand signal: slowing/stopping?", back: "Right arm extended, rotated anticlockwise (large circles).", difficulty: 2 },
  { id: "fc5_signal_early", categoryId: "rules", front: "When to signal?", back: "In good time BEFORE the manoeuvre — others must see, understand and react first.", difficulty: 1 },
  { id: "fc5_crash_scene", categoryId: "rules", front: "Passing a crash scene?", back: "Slow, careful, keep moving under direction — rubbernecking causes the next crash.", difficulty: 1 },
];
