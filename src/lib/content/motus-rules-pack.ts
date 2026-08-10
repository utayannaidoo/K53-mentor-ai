import type { Flashcard, Question } from "@/types";

/**
 * Sprint 10 — rules of the road: the duties, freeway law and equipment
 * standards the bank had not reached.
 *
 * Facts trace to docs/content/facts/motus-manual-11ed.md §1 (Official
 * Motus/Safeways K53 Learner's & Driver's Manual, 11th ed., pp. 54–66).
 *
 * Why this angle: `rules` is not a category in the exam, it is a *section* —
 * SECTION_OF pools rules, intersections, parking, following_distance and
 * hazard_awareness into the 28 questions a paper draws. That section is what
 * caps how many distinct mock papers exist, for all three licence codes. So
 * everything here is universal (no `codes` gating) and every item lifts the
 * ceiling for code 08, A and 14 alike.
 *
 * The material is the part of the manual's rules chapter that nothing quizzed:
 * the general duties of drivers, what a freeway excludes, towing, lights,
 * abandoned vehicles, and the accident procedure.
 */

const MOTUS = "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed.";

export const MOTUS_RULES_QUESTIONS: Question[] = [
  // ── General duties of drivers ───────────────────────────────
  {
    id: "qmr_engine_running_unattended",
    categoryId: "rules",
    prompt: "Leaving your engine running while the vehicle is unattended is:",
    options: [
      "Prohibited",
      "Permitted if the doors are locked",
      "Permitted for up to five minutes",
      "Permitted if someone is watching the vehicle",
    ],
    correctIndex: 0,
    explanation:
      "A running vehicle nobody is in can be driven away by anyone, and can move on its own if the transmission is disturbed. The rule is absolute rather than a matter of how long you will be.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_engine_running_refuelling",
    categoryId: "rules",
    prompt: "While fuel is being pumped into your vehicle, the engine must be:",
    options: [
      "Switched off",
      "Left running to keep the battery charged",
      "Left running only if the air conditioning is needed",
      "Switched off only when filling with petrol, not diesel",
    ],
    correctIndex: 0,
    explanation:
      "Fuel vapour and a running engine's ignition system do not belong on the same forecourt. It is a specific, separate rule from the one about unattended vehicles.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_person_on_roof",
    categoryId: "rules",
    prompt: "Allowing a person or an animal to ride on the roof or running board of a moving vehicle is:",
    options: [
      "Prohibited",
      "Permitted below 30 km/h",
      "Permitted if they are holding on securely",
      "Permitted on a private farm road only",
    ],
    correctIndex: 0,
    explanation:
      "There is nothing to restrain them and nothing to protect them. A gentle stop is enough to put someone under the wheels.",
    difficulty: 1,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_body_protruding",
    categoryId: "rules",
    prompt: "Having part of your body protruding from the vehicle while driving is prohibited, except when:",
    options: [
      "You are executing a hand signal",
      "You are reversing",
      "The vehicle is stationary in traffic",
      "You are checking a blind spot",
    ],
    correctIndex: 0,
    explanation:
      "The hand-signal exception is the only one, and it applies to passengers as well as the driver — an arm out of a rear window is an offence, not a joke.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_entering_while_moving",
    categoryId: "rules",
    prompt: "Allowing a passenger to get into or out of your vehicle while it is moving is:",
    options: [
      "Prohibited",
      "Permitted at walking pace",
      "Permitted if they are an adult",
      "Permitted where there is nowhere safe to stop",
    ],
    correctIndex: 0,
    explanation:
      "Prohibited outright. It is most often seen where a vehicle is rolling slowly to save a few seconds, which is exactly when a foot goes under a wheel.",
    difficulty: 1,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_another_person_steering",
    categoryId: "rules",
    prompt: "Permitting another person to steer or operate the vehicle while you drive is:",
    options: [
      "Prohibited — you must be in sole control",
      "Permitted if that person holds a licence",
      "Permitted while you change gear",
      "Permitted if you are being taught to drive",
    ],
    correctIndex: 0,
    explanation:
      "Control cannot be shared. Two people steering means neither can be certain what the vehicle will do, and neither can be held responsible for it.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_hampering_control",
    categoryId: "rules",
    prompt:
      "The rule against letting a person, animal or load hamper your control of the vehicle covers your ability to:",
    options: [
      "Observe, hear, signal, slow down and change direction",
      "Reach the radio and climate controls",
      "See the instrument panel only",
      "Reach the handbrake only",
    ],
    correctIndex: 0,
    explanation:
      "It is written broadly on purpose. A dog on your lap, a passenger against your shoulder or a load blocking the rear window each defeats a different one of those five, and any one of them is enough.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_smoke_fumes",
    categoryId: "rules",
    prompt: "Running an engine that gives off excessive smoke or fumes is:",
    options: [
      "Prohibited",
      "Permitted while the engine warms up",
      "Permitted on diesel vehicles",
      "Permitted outside urban areas",
    ],
    correctIndex: 0,
    explanation:
      "Both an emissions matter and a visibility one — a smoking exhaust blinds the driver behind you. It also usually means a fault worth fixing before it becomes a breakdown.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_depositing_refuse",
    categoryId: "rules",
    prompt: "Depositing fuel, oil, grease, ashes or other refuse onto the road is:",
    options: [
      "Prohibited",
      "Permitted if cleared within 24 hours",
      "Permitted outside urban areas",
      "Permitted if it is biodegradable",
    ],
    correctIndex: 0,
    explanation:
      "Oil and grease on tarmac are as slippery as ice for a motorcycle, and stay there long after you have gone.",
    difficulty: 1,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_drive_on_sidewalk",
    categoryId: "rules",
    prompt: "Driving, pushing or pulling a vehicle along the sidewalk is:",
    options: [
      "Prohibited",
      "Permitted when the road is blocked",
      "Permitted if the vehicle is not running",
      "Permitted for deliveries",
    ],
    correctIndex: 0,
    explanation:
      "The prohibition covers pushing a broken-down car as much as driving one — the sidewalk is where pedestrians are entitled to assume no vehicle will be.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_reverse_longer_than_necessary",
    categoryId: "rules",
    prompt: "The rule on reversing is that you may not travel backwards:",
    options: [
      "For longer than is necessary, and only when it is safe to do so",
      "For more than 20 metres",
      "On any public road",
      "Without a passenger guiding you",
    ],
    correctIndex: 0,
    explanation:
      "There is no fixed distance — the test is necessity. Reversing is the manoeuvre with the worst visibility you routinely perform, so the law asks you to spend as little time doing it as the situation allows.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_siren_give_way",
    categoryId: "rules",
    prompt: "A vehicle sounding a siren approaches. You must:",
    options: [
      "Give way to it as soon as it is safe to do so",
      "Stop immediately wherever you are",
      "Continue at your current speed",
      "Give way only if it is an ambulance",
    ],
    correctIndex: 0,
    explanation:
      "'As soon as it is safe' matters — stopping dead in an intersection or swerving blindly left creates a second emergency for the crew to drive around.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },

  // ── Compulsory stops ────────────────────────────────────────
  {
    id: "qmr_compulsory_stop_herding",
    categoryId: "rules",
    prompt: "You must always stop your vehicle when:",
    options: [
      "A person herding animals across the road asks you to",
      "You see any animal beside the road",
      "A pedestrian waves at you",
      "You approach any farm gate",
    ],
    correctIndex: 0,
    explanation:
      "One of only four situations where stopping is compulsory. Livestock crossing a road cannot be hurried, and a herder's request carries the same weight as a road sign.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_compulsory_stops_four",
    categoryId: "rules",
    prompt: "Which of these is NOT one of the situations in which stopping is compulsory?",
    options: [
      "When your fuel gauge reads empty",
      "When directed to by a traffic officer or road sign",
      "When you are involved in an accident",
      "When a pedestrian is about to enter a pedestrian crossing",
    ],
    correctIndex: 0,
    explanation:
      "The four compulsory stops are: a traffic officer or sign directing you, involvement in an accident, a pedestrian about to enter a crossing, and a person herding animals across the road.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },

  // ── Overtaking ──────────────────────────────────────────────
  {
    id: "qmr_overtake_left_conditions",
    categoryId: "rules",
    prompt: "You may legitimately overtake on the LEFT when:",
    options: [
      "The vehicle ahead is turning right, or there are two or more lanes in your direction",
      "The right-hand lane is occupied",
      "The vehicle ahead is travelling below the speed limit",
      "Never — overtaking on the left is always prohibited",
    ],
    correctIndex: 0,
    explanation:
      "Two narrow exceptions to 'keep left, pass right'. Even then you may not cross the yellow line to do it — passing on the shoulder is not overtaking on the left.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_overtake_left_yellow_line",
    categoryId: "rules",
    prompt: "When overtaking on the left where it is permitted, you may:",
    options: [
      "Not cross the yellow line to do so",
      "Cross the yellow line if the shoulder is clear",
      "Use the shoulder provided you signal",
      "Cross the yellow line only outside urban areas",
    ],
    correctIndex: 0,
    explanation:
      "The yellow line marks the edge of the travelled way. Beyond it is where pedestrians, cyclists and stopped vehicles legitimately are.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_keep_left_pass_right",
    categoryId: "rules",
    prompt: "The saying 'keep left, pass right' expresses the rule that:",
    options: [
      "You travel in the left lane and use the right only to overtake",
      "You should stay right on a dual carriageway",
      "Left turns have priority over right turns",
      "Slower vehicles must use the right lane",
    ],
    correctIndex: 0,
    explanation:
      "The right lane is a passing lane, not a fast lane you may settle into. Sitting in it forces others to pass on your left, which is where they are least expected.",
    difficulty: 1,
    scope: "learners",
    source: MOTUS,
  },
  // "Another vehicle is overtaking you" is deliberately absent: the duplicate
  // gate caught it against q_rules_being_overtaken, and the fact turns out to
  // be covered four times over (questions.ts, rules-pack, rules-lane-pack,
  // rules-lift-pack). Removed rather than reworded — a fifth phrasing of one
  // fact is worse for a learner drilling than no new question at all.
  {
    id: "qmr_overtake_blind_rise",
    categoryId: "hazard_awareness",
    prompt: "Overtaking where your view ahead is limited by a blind rise or a curve is:",
    options: [
      "Prohibited — you cannot see what you are pulling out into",
      "Permitted if you sound your hooter first",
      "Permitted if the road is marked with a broken line",
      "Permitted below 60 km/h",
    ],
    correctIndex: 0,
    explanation:
      "A broken line permits overtaking; it does not promise the road is clear. The line is drawn for average conditions, and your eyes decide the rest.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_stationary_bus",
    categoryId: "hazard_awareness",
    prompt: "Passing a stationary bus, you should be especially alert for:",
    options: [
      "Passengers stepping out from in front of or behind it",
      "The bus pulling off without indicating",
      "Luggage falling from the roof",
      "The bus reversing",
    ],
    correctIndex: 0,
    explanation:
      "A bus is a solid wall you cannot see past, and the people it just released are crossing the road it hides. Slow down and widen your line.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_no_overtake_stopped_at_crossing",
    categoryId: "rules",
    prompt: "A vehicle ahead has stopped at a pedestrian crossing. You may:",
    options: [
      "Not overtake it",
      "Overtake it slowly on the right",
      "Overtake it if no pedestrian is visible",
      "Overtake it after sounding your hooter",
    ],
    correctIndex: 0,
    explanation:
      "It stopped for a reason you cannot see — a pedestrian hidden by that very vehicle. Overtaking puts you across the crossing at speed exactly where they are walking.",
    difficulty: 1,
    scope: "learners",
    source: MOTUS,
  },

  // ── Freeways ────────────────────────────────────────────────
  {
    id: "qmr_freeway_learner",
    categoryId: "rules",
    prompt: "May you drive on a freeway with a learner's licence?",
    options: [
      "Yes, if accompanied by someone with a valid licence of the same category",
      "No, never",
      "Yes, without restriction",
      "Only between sunrise and sunset",
    ],
    correctIndex: 0,
    explanation:
      "The same supervision rule that applies everywhere else applies here — a learner's licence is never valid alone, and never becomes more restricted just because the road is a freeway.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_freeway_not_allowed",
    categoryId: "rules",
    prompt: "Which of these may legally use a freeway?",
    options: [
      "A motorcycle of more than 50 cc",
      "A bicycle",
      "A tractor",
      "An animal-drawn vehicle",
    ],
    correctIndex: 0,
    explanation:
      "Freeways exclude anything that cannot keep up or cannot be seen: animal-drawn vehicles, bicycles, motorcycles of 50 cc or less, tricycles and quadrucycles, tractors, and pedestrians and animals.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_freeway_50cc",
    categoryId: "rules",
    prompt: "Motorcycles are barred from freeways when their engine capacity is:",
    options: ["50 cc or less", "125 cc or less", "250 cc or less", "Any capacity — all are barred"],
    correctIndex: 0,
    explanation:
      "The same 50 cc threshold that decides whether a motorcycle may carry a passenger. Below it, the machine cannot safely hold freeway speeds.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_freeway_disabled_vehicle",
    categoryId: "rules",
    prompt:
      "Vehicles specifically constructed for disabled people are excluded from freeways when their mass is:",
    options: ["230 kg or less", "500 kg or less", "1 000 kg or less", "They are never excluded"],
    correctIndex: 0,
    explanation:
      "A mass threshold rather than a blanket ban — it targets the light mobility vehicles that cannot hold freeway speed, not adapted cars.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_freeway_stopping",
    categoryId: "rules",
    prompt: "You may stop on a freeway only when:",
    options: [
      "Directed by a traffic officer, in an area reserved for stopping, or in a situation beyond your control",
      "You need to check a map or take a call",
      "You are travelling below the minimum speed",
      "Your passengers ask you to",
    ],
    correctIndex: 0,
    explanation:
      "'Beyond your control' means a breakdown or a medical emergency — not an errand you decided to run. Everything else must wait for the next reserved area.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_freeway_hand_signals",
    categoryId: "rules",
    prompt: "Hand signals on a freeway are:",
    options: [
      "Not to be used, unless you are in a situation beyond your control",
      "Required when changing lanes",
      "Required when leaving the freeway",
      "Used in the same way as on any other road",
    ],
    correctIndex: 0,
    explanation:
      "At freeway speeds an arm out of a window is both unreadable and dangerous. The exception exists for a failed indicator on a vehicle you cannot immediately stop.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_freeway_being_overtaken",
    categoryId: "rules",
    prompt: "On a freeway, a vehicle behind wishes to overtake you. You should:",
    options: [
      "Indicate and move to the left lane when it is safe",
      "Maintain your lane and let them find a way past",
      "Speed up to match their pace",
      "Move onto the shoulder to let them by",
    ],
    correctIndex: 0,
    explanation:
      "Signalling the move matters as much as making it — a car changing lanes without warning in front of a faster vehicle causes the collision it was trying to avoid.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },

  // ── Towing ──────────────────────────────────────────────────
  {
    id: "qmr_tow_length",
    categoryId: "rules",
    prompt: "The tow-rope, tow-bar or chain between two vehicles may not exceed:",
    options: ["3,5 m", "1,5 m", "5 m", "10 m"],
    correctIndex: 0,
    explanation:
      "Long enough to absorb a little slack, short enough that no third vehicle mistakes the gap for a space to move into.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_tow_speed_bar",
    categoryId: "rules",
    prompt: "A draw-bar or tow-bar (rather than a rope) is required when towing at:",
    options: ["More than 30 km/h", "More than 60 km/h", "Any speed", "More than 80 km/h"],
    correctIndex: 0,
    explanation:
      "Above walking-and-a-bit pace a rope goes slack and snatches, and the towed vehicle can run into the one pulling it. A rigid bar keeps the distance constant.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_tow_defective_brakes",
    categoryId: "rules",
    prompt: "If the brakes of the towed vehicle are defective, it must be:",
    options: [
      "Coupled by means of an appropriate tow-bar",
      "Towed with a rope no longer than 1,5 m",
      "Towed only at night",
      "Towed with its hazard lights on",
    ],
    correctIndex: 0,
    explanation:
      "With no brakes of its own, the towed vehicle is stopped entirely by the one in front — which only works if the coupling can push as well as pull.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_tow_passengers",
    categoryId: "rules",
    prompt: "Passengers in a towed vehicle are:",
    options: [
      "Not allowed, unless the towed vehicle is a semi-trailer",
      "Allowed if they wear seat belts",
      "Allowed if a licensed driver is steering",
      "Allowed on journeys under 5 km",
    ],
    correctIndex: 0,
    explanation:
      "A towed vehicle usually has no brakes, no power steering and no engine to move it out of trouble. There is no reason for anyone to be in it who is not steering it.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_tow_motorcycle",
    categoryId: "rules",
    prompt: "Using a motorcycle, tricycle or quadrucycle to tow another vehicle is:",
    options: [
      "Prohibited",
      "Permitted below 30 km/h",
      "Permitted with a rigid tow-bar",
      "Permitted if the rider holds a professional permit",
    ],
    correctIndex: 0,
    explanation:
      "A two-wheeler stays upright by balancing. A load pulling sideways from behind takes that away at exactly the moment it matters.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_tow_steering_control",
    categoryId: "rules",
    prompt: "A licensed driver must sit in the towed vehicle to steer it, unless:",
    options: [
      "Its front wheels are clear of the ground, or a device controls the steering",
      "The tow is under 5 km",
      "The towing vehicle is a recovery truck",
      "It is being towed at under 30 km/h",
    ],
    correctIndex: 0,
    explanation:
      "Someone or something has to steer it. Lifting the front wheels or fitting a steering device removes the need for a person; nothing else does.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },

  // ── Lights ──────────────────────────────────────────────────
  {
    id: "qmr_dipped_beam_45m",
    categoryId: "rules",
    prompt: "A dipped (dim) headlight beam should not illuminate the road further ahead than:",
    options: ["45 m", "100 m", "150 m", "20 m"],
    correctIndex: 0,
    explanation:
      "That is the point of dipping — the beam is cut short so it falls below the eyes of the driver coming towards you. Main beams, by contrast, should reach objects about 100 m ahead.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_main_beam_100m",
    categoryId: "rules",
    prompt: "Main beam (bright) headlights should be able to illuminate objects up to:",
    options: ["100 m ahead", "45 m ahead", "250 m ahead", "500 m ahead"],
    correctIndex: 0,
    explanation:
      "If your brights fall well short of that, they need aiming or replacing — you are outdriving your lights every time you use them.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_parking_lights",
    categoryId: "rules",
    prompt: "Parking lights are to be used only when the vehicle is parked:",
    options: [
      "Outside a parking bay, or in a dark area more than 12 m from a streetlight",
      "Anywhere at night",
      "On any public road after sunset",
      "In a parking garage",
    ],
    correctIndex: 0,
    explanation:
      "They mark a vehicle that would otherwise be invisible. Inside a lit bay they add nothing and only flatten your battery.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_spotlights",
    categoryId: "rules",
    prompt: "Adjustable spotlights may be used by:",
    options: [
      "Doctors, vets, at breakdowns, and by official vehicles",
      "Any driver on an unlit rural road",
      "Any driver, provided oncoming traffic is not dazzled",
      "Farmers only",
    ],
    correctIndex: 0,
    explanation:
      "A steerable beam can be pointed straight into another driver's eyes, so the law limits who may fit and use one to those with a working reason.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_hazard_lights_use",
    categoryId: "rules",
    prompt: "Hazard (emergency) lights may be used:",
    options: [
      "In an emergency, or when the vehicle is stopped in a hazardous position",
      "Whenever you park briefly somewhere you should not",
      "In heavy rain while driving",
      "To thank a driver who let you in",
    ],
    correctIndex: 0,
    explanation:
      "They say 'this vehicle is a hazard', not 'I know I shouldn't be here'. Used while moving they also hide your indicators, so nobody can tell which way you intend to go.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_motorcycle_lights_always",
    categoryId: "rules",
    prompt: "Motorcyclists must ride with their headlights on:",
    options: [
      "At all times",
      "Only between sunset and sunrise",
      "Only when visibility is under 150 m",
      "Only on freeways",
    ],
    correctIndex: 0,
    explanation:
      "A motorcycle is narrow and easily lost against traffic and clutter. A lit headlight in daylight is the cheapest way to be seen at a junction.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },

  // ── Tyres and equipment ─────────────────────────────────────
  {
    id: "qmr_tyre_tread_1mm",
    categoryId: "rules",
    prompt: "The legal minimum tyre tread depth, over the entire surface of the tyre, is:",
    options: ["1 mm", "1,6 mm", "3 mm", "0,5 mm"],
    correctIndex: 0,
    explanation:
      "'Over the entire surface' is the part people miss — a tyre worn bald on one edge fails even if the middle looks fine.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_tyre_50cc_80pct",
    categoryId: "rules",
    prompt: "A motorcycle of 50 cc or less must have visible tread over at least:",
    options: [
      "80% of the tyre surface",
      "50% of the tyre surface",
      "The entire tyre surface",
      "There is no requirement for small motorcycles",
    ],
    correctIndex: 0,
    explanation:
      "A lighter standard than the 1 mm over the whole surface demanded of larger machines, but a standard nonetheless.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_retread_motorcycle",
    categoryId: "rules",
    prompt: "Retread tyres:",
    options: [
      "May not be used on motorcycles",
      "May not be used on any vehicle",
      "May be used on any vehicle without restriction",
      "May only be used on the rear wheel of a motorcycle",
    ],
    correctIndex: 0,
    explanation:
      "A motorcycle puts everything through two small contact patches, and a retread's bond can fail under that load. Cars may use them.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_tyre_condition",
    categoryId: "rules",
    prompt: "Besides tread depth, a legal tyre must have:",
    options: [
      "No bulges and no visible canvas",
      "A matching brand on the same axle",
      "Been fitted within the last five years",
      "A white sidewall marking",
    ],
    correctIndex: 0,
    explanation:
      "A bulge means the casing has already failed internally and the tyre is holding together on air pressure alone. Visible canvas means it is through the rubber entirely.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_seatbelt_beltless_seat",
    categoryId: "rules",
    prompt:
      "An adult passenger may not sit in a seat without a seat belt if:",
    options: [
      "Another seat fitted with a belt is available",
      "The journey is longer than 20 km",
      "The vehicle is travelling above 60 km/h",
      "They are over the age of 65",
    ],
    correctIndex: 0,
    explanation:
      "Belted seats are filled first. It stops the beltless seat being treated as an ordinary option when a safe one is standing empty.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_seatbelt_working_order",
    categoryId: "rules",
    prompt: "Seat belts fitted to a vehicle:",
    options: [
      "Must be in good working order for the vehicle to be driven on a public road",
      "Need only work in the front seats",
      "May be removed if unused",
      "Must be replaced every five years",
    ],
    correctIndex: 0,
    explanation:
      "A frayed or jammed belt makes the vehicle unroadworthy, whether or not anyone is sitting in that seat.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },

  // ── Accidents ───────────────────────────────────────────────
  {
    id: "qmr_accident_report_24h",
    categoryId: "rules",
    prompt: "After an accident you must report it at the nearest police station within:",
    options: [
      "24 hours, with your driving licence on you",
      "7 days, with proof of insurance",
      "48 hours, with the other driver present",
      "Immediately, or not at all",
    ],
    correctIndex: 0,
    explanation:
      "Twenty-four hours, and take your licence — turning up without it turns one problem into two.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_accident_no_alcohol",
    categoryId: "rules",
    prompt: "After an accident and before reporting it, you may not:",
    options: [
      "Take any alcohol or drugs",
      "Speak to the other driver",
      "Photograph the scene",
      "Call your insurer",
    ],
    correctIndex: 0,
    explanation:
      "A drink afterwards would make any later test meaningless, so the law closes that door — which is why 'I only drank after the crash' is not a defence.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_accident_details",
    categoryId: "rules",
    prompt: "At the scene of an accident you must provide:",
    options: [
      "Your name and address, the vehicle's registration number, and the owner's name and address",
      "Your name only",
      "Your insurance policy number only",
      "Nothing until the police arrive",
    ],
    correctIndex: 0,
    explanation:
      "Note the owner's details are required as well as yours — driving someone else's car does not reduce what you must hand over.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_accident_moving_vehicle",
    categoryId: "rules",
    prompt: "Someone has been injured in the accident. Your vehicle may be moved:",
    options: [
      "Only with an official's authorisation, and only after its position has been marked",
      "As soon as it is obstructing traffic",
      "Immediately, to clear the road",
      "Only after your insurer has inspected it",
    ],
    correctIndex: 0,
    explanation:
      "Where there are injuries the scene is evidence. If nobody is hurt the rule relaxes — you may move the vehicle if it is obstructing traffic.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_accident_first_step",
    categoryId: "rules",
    prompt: "The first thing you must do when involved in any accident is:",
    options: [
      "Stop your vehicle immediately",
      "Photograph the damage",
      "Exchange insurance details",
      "Move your vehicle off the road",
    ],
    correctIndex: 0,
    explanation:
      "Stopping is what separates an accident from a hit-and-run. Everything else — checking for injuries, calling the police, exchanging details — follows from it.",
    difficulty: 1,
    scope: "learners",
    source: MOTUS,
  },

  // ── Abandoned vehicles, obstruction, road damage ────────────
  {
    id: "qmr_abandoned_outside_urban",
    categoryId: "parking",
    prompt:
      "Outside an urban area, a vehicle left standing on a public road is treated as abandoned after:",
    options: ["24 hours", "7 days", "30 days", "12 hours"],
    correctIndex: 0,
    explanation:
      "Far shorter than the seven days allowed inside an urban area — a car on a rural verge is both a hazard and unlikely to be watched by anyone.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_abandoned_within_urban",
    categoryId: "parking",
    prompt: "Within an urban area, a vehicle left standing on a public road is treated as abandoned after:",
    options: ["7 days", "24 hours", "14 days", "3 months"],
    correctIndex: 0,
    explanation:
      "Seven days inside town, 24 hours outside it. An abandoned vehicle is removed and impounded, so the difference is worth knowing before a long trip.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_abandoned_no_plates",
    categoryId: "parking",
    prompt: "A vehicle may be treated as abandoned — regardless of how long it has stood — if it:",
    options: [
      "Has no licence or registration number",
      "Has a flat tyre",
      "Is more than 20 years old",
      "Is parked facing oncoming traffic",
    ],
    correctIndex: 0,
    explanation:
      "Without plates there is nobody to trace it to. Causing an obstruction, or standing in a prohibited or no-stopping area, does the same regardless of the clock.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_hindering_traffic_object",
    categoryId: "rules",
    prompt: "The rule against hindering the free flow of traffic applies to:",
    options: [
      "Your vehicle or any other object you place on the road",
      "Your vehicle only",
      "Heavy vehicles only",
      "Only obstructions left for more than an hour",
    ],
    correctIndex: 0,
    explanation:
      "Building rubble, a trailer, a advertising board — anything you put in the roadway counts, not just something you drove there.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_wheelspin",
    categoryId: "rules",
    prompt: "Wheelspinning or dragging your wheels on a public road is:",
    options: [
      "Prohibited as damage to the road surface",
      "Permitted on private roads only",
      "Permitted if no other traffic is present",
      "Only an offence if it leaves visible marks",
    ],
    correctIndex: 0,
    explanation:
      "Filed under damage to public roads rather than dangerous driving — the tar itself is what is being protected, alongside everyone near you.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_licence_disc_12_months",
    categoryId: "rules",
    prompt: "A vehicle licence disc is valid for:",
    options: ["12 months", "6 months", "24 months", "The life of the vehicle"],
    correctIndex: 0,
    explanation:
      "Twelve months, and it must be displayed. An expired disc is one of the easiest things for an officer to spot from outside the car.",
    difficulty: 1,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_hooter_90m",
    categoryId: "rules",
    prompt: "Your hooter must be audible from a distance of at least:",
    options: ["90 m", "30 m", "150 m", "200 m"],
    correctIndex: 0,
    explanation:
      "It is a warning device with a legal minimum reach — and one you may not use unnecessarily. A hooter that cannot be heard at 90 m makes the vehicle unroadworthy.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_excessive_noise",
    categoryId: "rules",
    prompt: "Operating a vehicle that causes excessive noise is:",
    options: [
      "Prohibited",
      "Permitted outside urban areas",
      "Permitted during daylight hours",
      "Permitted if the exhaust is a factory part",
    ],
    correctIndex: 0,
    explanation:
      "Usually a modified or broken exhaust. It also masks the sounds you rely on — a siren, a hooter, or your own engine labouring in the wrong gear.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_racing_authorisation",
    categoryId: "rules",
    prompt: "A race or sporting event on a public road:",
    options: [
      "Must be approved by the relevant authorities",
      "Is permitted if marshals are present",
      "Is permitted outside urban areas",
      "Is never permitted under any circumstances",
    ],
    correctIndex: 0,
    explanation:
      "Closed-road events do happen legally — cycle races and rallies among them. What makes them lawful is the approval, not the safety gear.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },

  // ── Pedestrians and shoulder use ────────────────────────────
  {
    id: "qmr_pedestrian_may_not_run_out",
    categoryId: "rules",
    prompt: "At a pedestrian crossing, a pedestrian:",
    options: [
      "May not step out so suddenly that a driver cannot reasonably yield",
      "Always has right of way regardless of how they enter",
      "Must wait for all traffic to clear",
      "May only cross at a traffic light",
    ],
    correctIndex: 0,
    explanation:
      "Right of way is not a licence to step into a moving car. The duty runs both ways — though as the driver, yours is the one that decides whether anyone is hurt.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_pedestrian_at_traffic_light",
    categoryId: "rules",
    prompt: "Where a pedestrian crossing is situated at a traffic light, the pedestrian must:",
    options: [
      "Obey the signal of the traffic light",
      "Cross whenever the road looks clear",
      "Wait for a driver to wave them across",
      "Give way to all vehicles",
    ],
    correctIndex: 0,
    explanation:
      "The light governs the crossing. A pedestrian stepping out against it does not acquire right of way merely by being on a painted crossing.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_shoulder_conditions",
    categoryId: "rules",
    prompt:
      "Moving onto the shoulder to let a vehicle overtake is permitted only when all of these hold:",
    options: [
      "Single-lane road, between sunrise and sunset, and 150 m of clear view ahead",
      "Any road, at any time, if the shoulder is paved",
      "Outside urban areas only, at any hour",
      "When the vehicle behind flashes its lights",
    ],
    correctIndex: 0,
    explanation:
      "Three conditions, all required. The shoulder is where pedestrians and stopped vehicles are, which is why the courtesy is fenced in so tightly — and why driving on it continuously is prohibited outright.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qmr_divided_road_crossing",
    categoryId: "rules",
    prompt: "Where a road is divided by a painted line or a physical barrier, you may cross it:",
    options: [
      "Only at an opening or space specifically provided",
      "Anywhere, provided it is safe",
      "Only outside urban areas",
      "Only to make a U-turn",
    ],
    correctIndex: 0,
    explanation:
      "The division exists to keep opposing traffic apart. Crossing it anywhere else puts you head-on into a lane whose drivers have no reason to expect you.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
];

export const MOTUS_RULES_FLASHCARDS: Flashcard[] = [
  {
    id: "fmr_general_duties",
    categoryId: "rules",
    front: "Name five things the 'general duties of drivers' prohibit.",
    back: "Reversing longer than necessary · following too closely · letting anything hamper your control · letting someone else steer · leaving the vehicle without the handbrake · body protruding (except for hand signals) · people on the roof or running board · excessive smoke · engine running while unattended or while refuelling · depositing refuse on the road · anyone entering or leaving while moving · driving on the sidewalk · a phone without a hands-free kit.",
    difficulty: 3,
  },
  {
    id: "fmr_compulsory_stops",
    categoryId: "rules",
    front: "When is stopping compulsory?",
    back: "Four situations: directed by a traffic officer or road sign · you are involved in an accident · a pedestrian is about to enter a pedestrian crossing · a person herding animals across the road asks you to.",
    difficulty: 2,
  },
  {
    id: "fmr_overtake_left",
    categoryId: "rules",
    front: "When may you overtake on the LEFT?",
    back: "Only when the vehicle ahead is turning right, or where there are two or more lanes in your direction. Never by crossing the yellow line. Otherwise: keep left, pass right.",
    difficulty: 3,
  },
  {
    id: "fmr_freeway_banned",
    categoryId: "rules",
    front: "What may not use a freeway?",
    back: "Animal-drawn vehicles · bicycles · motorcycles of 50 cc or less · motor tricycles and quadrucycles · vehicles of 230 kg or less built for disabled people · tractors · pedestrians and animals (except in a reserved area or a situation beyond their control).",
    difficulty: 3,
  },
  {
    id: "fmr_freeway_learner",
    categoryId: "rules",
    front: "Can you drive on a freeway with a learner's licence?",
    back: "Yes — provided you are accompanied by someone holding a valid driving licence of the same category, exactly as on any other road.",
    difficulty: 2,
  },
  {
    id: "fmr_freeway_stopping",
    categoryId: "rules",
    front: "When may you stop on a freeway?",
    back: "Only when a traffic officer instructs you, when you are in an area reserved for stopping or parking, or in a situation beyond your control. Hand signals are out too, with the same exception.",
    difficulty: 2,
  },
  {
    id: "fmr_towing_numbers",
    categoryId: "rules",
    front: "Towing — the numbers.",
    back: "Rope, bar or chain no longer than **3,5 m**. A draw-bar or tow-bar is required above **30 km/h**, and whenever the towed vehicle's brakes are defective. No passengers in a towed vehicle unless it is a semi-trailer. Motorcycles may not tow.",
    difficulty: 3,
  },
  {
    id: "fmr_speed_limits",
    categoryId: "rules",
    front: "The general and class speed limits.",
    back: "60 urban · 100 outside urban · 120 freeway. Then **80 km/h** for a goods or combination vehicle over **9 000 kg**, and **100 km/h** for a bus or mini-bus.",
    difficulty: 2,
  },
  {
    id: "fmr_seatbelt_rules",
    categoryId: "rules",
    front: "The seat-belt rules beyond 'wear one'.",
    back: "Exception while reversing or parking · a child under 14 sits in the back unless taller than 1,5 m · infants under 3 need an appropriate restraint (not in public transport) · an adult may not take a beltless seat while a belted one is free · fitted belts must work.",
    difficulty: 3,
  },
  {
    id: "fmr_tyre_standards",
    categoryId: "rules",
    front: "The legal tyre standards.",
    back: "At least **1 mm** of tread over the *entire* surface · motorcycles of 50 cc or less need visible tread over **80%** · no bulges, no visible canvas · **retreads may not be used on motorcycles**.",
    difficulty: 3,
  },
  {
    id: "fmr_light_distances",
    categoryId: "rules",
    front: "Headlight beam distances.",
    back: "Main beam should reach objects about **100 m** ahead; dipped beam should not light the road beyond **45 m**. Headlights on between sunset and sunrise, and whenever visibility is under **150 m** — motorcycles, always.",
    difficulty: 3,
  },
  {
    id: "fmr_parking_lights_spotlights",
    categoryId: "rules",
    front: "When may parking lights and spotlights be used?",
    back: "Parking lights only when parked outside a bay, or in a dark area more than **12 m** from a streetlight. Adjustable spotlights only by doctors, vets, at breakdowns and by official vehicles.",
    difficulty: 3,
  },
  {
    id: "fmr_hazard_lights",
    categoryId: "rules",
    front: "When may hazard lights be used?",
    back: "In an emergency, or when stopped in a hazardous position. Not as an excuse for parking somewhere you shouldn't, and not while moving — they hide your indicators.",
    difficulty: 2,
  },
  {
    id: "fmr_accident_procedure",
    categoryId: "rules",
    front: "What must you do after an accident?",
    back: "Stop immediately · check for injuries and call the police if any · assist the injured · give your name and address, the registration number and the owner's details · report at the nearest police station within **24 hours** with your licence. No alcohol or drugs before you report.",
    difficulty: 2,
  },
  {
    id: "fmr_accident_moving",
    categoryId: "rules",
    front: "May you move your vehicle after an accident?",
    back: "If someone is injured: only with an official's authorisation, and only after the position has been marked. If nobody is injured: yes, if it is obstructing traffic.",
    difficulty: 3,
  },
  {
    id: "fmr_abandoned",
    categoryId: "parking",
    front: "When does a parked vehicle count as abandoned?",
    back: "After **24 hours** outside an urban area, or **7 days** within one — or immediately if it obstructs, sits in a prohibited or no-stopping area, or has no licence or registration number. Abandoned vehicles are removed and impounded.",
    difficulty: 3,
  },
  {
    id: "fmr_shoulder_rules",
    categoryId: "rules",
    front: "When may you use the shoulder to let someone overtake?",
    back: "All three must hold: a single-lane road, between sunrise and sunset, and at least 150 m of clear view ahead. Driving continuously on the shoulder is prohibited.",
    difficulty: 3,
  },
  {
    id: "fmr_alcohol_limits",
    categoryId: "rules",
    front: "The legal alcohol limits.",
    back: "Ordinary drivers: below **0,05 g** per 100 ml of blood and **0,24 mg** per 1 000 ml of breath. Professional drivers: **0,02 g** and **0,10 mg**.",
    difficulty: 2,
  },
  {
    id: "fmr_hooter_noise",
    categoryId: "rules",
    front: "What does the law require of your hooter?",
    back: "Audible at **90 m**, and not to be used unnecessarily. Separately, a vehicle may not be operated if it causes excessive noise.",
    difficulty: 3,
  },
  {
    id: "fmr_road_damage",
    categoryId: "rules",
    front: "What counts as damaging a public road?",
    back: "Wheelspinning or dragging your wheels · using chocks or shoes between the wheels · anything else that damages the road surface. Separately, you may not hinder traffic with your vehicle *or any object*.",
    difficulty: 2,
  },
  {
    id: "fmr_pedestrian_duties",
    categoryId: "rules",
    front: "Pedestrian right of way at a crossing — the whole picture.",
    back: "Drivers yield to anyone entering or already on the crossing, and may not overtake a vehicle stopped at one. But a pedestrian may not step out so suddenly that yielding is impossible, and where the crossing is at a traffic light, the light governs them too.",
    difficulty: 3,
  },
];
