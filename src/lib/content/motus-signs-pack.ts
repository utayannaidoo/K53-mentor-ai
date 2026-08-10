import type { Flashcard, Question } from "@/types";
import { signImg } from "./signs";

/**
 * Sprint 9 — signs: the qualifier-plate system, and the sign classes the bank
 * had names for but never explained.
 *
 * Facts trace to docs/content/facts/signs.md and the sign catalogue itself
 * (scripts/extract_signs.py, from the official manual), with the sign-plus-plate
 * combinations read off the rendered images in public/signs/.
 *
 * Why this angle: the generated pool (signs-generated.ts) is good at "name this
 * sign" and "what does this sign mean", because those are recombinations of
 * catalogue text. What it structurally cannot do is teach a *system* — that a
 * blue disc commands where a red ring prohibits, or that the small plate bolted
 * under a sign is the thing that decides whether the sign applies to you at
 * all. Selective-restriction plates are 21 entries in the catalogue and were
 * quizzed by nothing.
 *
 * Every item here carries the real manual crop, because a question about what a
 * plate does to a sign is unanswerable without seeing both.
 */
export const MOTUS_SIGNS_QUESTIONS: Question[] = [
  // ── The qualifier-plate system ──────────────────────────────
  {
    id: "qsg_qualifier_principle",
    categoryId: "signs",
    prompt: "A small rectangular plate is mounted directly beneath a road sign. Its job is to:",
    options: [
      "Limit when, where or to whom the sign above it applies",
      "Repeat the sign above it for drivers further back",
      "Show which authority erected the sign",
      "Warn that the sign above is about to be removed",
    ],
    correctIndex: 0,
    explanation:
      "These are qualifier plates, and they are not decoration — the plate is what decides whether the sign applies to you at this moment. Read the pair together or you will obey a restriction that was never yours, or ignore one that was.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qsg_qualifier_ignore_plate",
    categoryId: "signs",
    prompt:
      "You read the main sign but not the plate beneath it. The risk is that you:",
    options: [
      "Obey a restriction that does not apply to you, or break one that does",
      "Are fined for not looking at the plate",
      "Miss the name of the road you are on",
      "Cannot tell whether the sign is temporary",
    ],
    correctIndex: 0,
    explanation:
      "Both errors are real. A '60' with a motorcycle plate does not slow a car down; a 'no right turn' with a bus plate does not stop a car turning. Reading only half the message gets you the wrong answer in both directions.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qsg_qual_uturn_night",
    categoryId: "signs",
    prompt: "What does this sign and plate combination mean?",
    image: signImg("qual_uturn_night"),
    imageDetail: true,
    options: [
      "U-turns are prohibited at night",
      "U-turns are prohibited at all times",
      "U-turns are permitted only at night",
      "The road is unlit ahead",
    ],
    correctIndex: 0,
    explanation:
      "The stars-and-moon plate means 'at night only'. Alone, the sign above bans U-turns outright; with this plate under it, the ban applies only after dark.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qsg_qual_daytime_plate",
    categoryId: "signs",
    prompt: "A plate showing a sun symbol under a road sign means the sign applies:",
    image: signImg("qual_daytime"),
    imageDetail: true,
    options: [
      "During daytime only",
      "In sunny weather only",
      "Only where there is no street lighting",
      "During summer months only",
    ],
    correctIndex: 0,
    explanation:
      "Sun for daytime, stars and a moon for night. They are the simplest qualifier plates on the road and the easiest to drive straight past.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qsg_qual_night_plate",
    categoryId: "signs",
    prompt: "A plate showing stars and a moon under a road sign means the sign applies:",
    image: signImg("qual_night"),
    imageDetail: true,
    options: [
      "At night only",
      "In poor weather only",
      "On public holidays",
      "Only when the road is wet",
    ],
    correctIndex: 0,
    explanation:
      "Night only. Many restrictions exist because of what happens after dark — visibility, or the kind of traffic a road carries — so they lift during the day.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qsg_qual_times_plate",
    categoryId: "signs",
    prompt: "What does this sign and plate combination require?",
    image: signImg("qual_right_turn_times"),
    imageDetail: true,
    options: [
      "You must turn right at the next junction, but only during the times shown",
      "You may not turn right during the times shown",
      "Right turns are permitted at any time",
      "The junction is closed during the times shown",
    ],
    correctIndex: 0,
    explanation:
      "A blue disc commands rather than prohibits, so this compels a right turn — and the times plate confines that command to the two peak windows shown. Outside them you may go straight on.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qsg_qual_motorcycle_speed",
    categoryId: "signs",
    prompt: "What does this sign and plate combination mean?",
    image: signImg("qual_speed_motorcycles"),
    imageDetail: true,
    options: [
      "The 60 km/h limit applies to motorcycles only",
      "Motorcycles are prohibited beyond this point",
      "Motorcycles must travel at least 60 km/h",
      "Motorcycles may exceed 60 km/h",
    ],
    correctIndex: 0,
    explanation:
      "The plate names who the sign is for. A red ring around a number is always a maximum, so motorcycles are held to 60 while everyone else follows the general limit for that road.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qsg_qual_bus_no_right",
    categoryId: "signs",
    prompt: "What does this sign and plate combination mean?",
    image: signImg("qual_no_right_buses"),
    imageDetail: true,
    options: [
      "Buses may not turn right at the next junction",
      "No vehicle may turn right at the next junction",
      "Buses must turn right at the next junction",
      "Buses may not use this road at all",
    ],
    correctIndex: 0,
    explanation:
      "The bus plate narrows the prohibition to buses. Note the yellow background on the main sign — that makes this a temporary restriction, most likely around roadworks or an event.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qsg_qual_goods_min_speed",
    categoryId: "signs",
    prompt: "What does this sign and plate combination require?",
    image: signImg("qual_min_speed_goods"),
    imageDetail: true,
    options: [
      "Goods vehicles must travel at 50 km/h or faster",
      "Goods vehicles may not exceed 50 km/h",
      "Goods vehicles are prohibited beyond this point",
      "Goods vehicles must stop at 50 m intervals",
    ],
    correctIndex: 0,
    explanation:
      "A number on a blue disc is a *minimum* speed, not a maximum — the opposite of the same number in a red ring. The plate applies it to goods vehicles, keeping slow heavy traffic off a road it would obstruct.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qsg_qual_distance_2km",
    categoryId: "signs",
    prompt: "What does this sign and plate combination mean?",
    image: signImg("qual_no_overtaking_2km"),
    imageDetail: true,
    options: [
      "Overtaking is prohibited for the next 2 km",
      "Overtaking is prohibited within 2 km of a town",
      "Overtaking is permitted after 2 km of clear road",
      "There is a 2 km queue ahead",
    ],
    correctIndex: 0,
    explanation:
      "A distance plate tells you how far the restriction runs, so you know it is a stretch of road rather than a single spot. Here that is two kilometres of no overtaking.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qsg_qual_for_5km",
    categoryId: "signs",
    prompt: "A plate reading 'For 5km' beneath a sign tells you that:",
    image: signImg("qual_for_5km"),
    imageDetail: true,
    options: [
      "The sign's restriction continues for the next 5 km",
      "The restriction begins 5 km ahead",
      "The next sign of this type is 5 km away",
      "The restriction applies only in the first 5 km of the road",
    ],
    correctIndex: 0,
    explanation:
      "It starts here and runs five kilometres. A plate that meant 'begins in 5 km' would use an arrow or the word 'ahead' instead.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qsg_qual_local_access",
    categoryId: "signs",
    prompt: "A plate reading 'and Local Access Only' beneath a restriction sign means:",
    image: signImg("qual_local_access"),
    imageDetail: true,
    options: [
      "Traffic with business in the area may still use the road",
      "Only residents who live on that street may enter",
      "The road is closed to everyone",
      "Access is allowed only outside business hours",
    ],
    correctIndex: 0,
    explanation:
      "The restriction is aimed at through traffic. If you have a reason to be there — a delivery, a visit, your own driveway — you may still enter; you simply may not use the road as a shortcut.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qsg_qual_max_15",
    categoryId: "signs",
    prompt: "A plate reading '15 MAX' beneath a sign restricts:",
    image: signImg("qual_max_15"),
    imageDetail: true,
    options: [
      "The number of vehicles the sign's provision applies to at one time",
      "The speed limit to 15 km/h",
      "The height of vehicles to 1,5 m",
      "Parking to 15 minutes",
    ],
    correctIndex: 0,
    explanation:
      "A count, not a speed and not a time. Fifteen vehicles maximum — typical of a reserved area with limited capacity.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qsg_qual_pay_parking",
    categoryId: "signs",
    prompt: "What does this parking plate indicate?",
    image: signImg("qual_pay_parking"),
    imageDetail: true,
    options: [
      "Parking is permitted only if you pay the parking fee",
      "Parking is free of charge here",
      "Parking is reserved for permit holders",
      "The parking meter is out of order",
    ],
    correctIndex: 0,
    explanation:
      "The bay is available to anyone, on condition that you pay. That is different from a reservation plate, which limits the bay to a class of vehicle no matter what you are willing to pay.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Sign classes: what the shape and colour commit you to ───
  {
    id: "qsg_blue_disc_commands",
    categoryId: "signs",
    prompt: "A road sign consisting of a white symbol on a solid blue disc is:",
    options: [
      "A command — it tells you something you must do",
      "A prohibition — it tells you something you may not do",
      "A warning of a hazard ahead",
      "Information about a facility nearby",
    ],
    correctIndex: 0,
    explanation:
      "Blue discs command, red rings prohibit. The distinction is worth learning as a rule rather than sign by sign, because it tells you what a sign wants even when you have never seen that particular symbol.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qsg_blue_vs_red_number",
    categoryId: "signs",
    prompt:
      "The same number appears on one sign in a red ring and on another on a blue disc. This means:",
    options: [
      "Red ring is a maximum; blue disc is a minimum",
      "Red ring is a minimum; blue disc is a maximum",
      "Both are maximums, but blue is advisory",
      "Blue applies to heavy vehicles and red to light vehicles",
    ],
    correctIndex: 0,
    explanation:
      "Exactly reversed obligations from the same digits. A blue 50 on a freeway lane is telling you to keep up, not to slow down — misreading it puts you in the way of everything behind you.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qsg_command_headlights",
    categoryId: "signs",
    prompt: "This sign requires you to:",
    image: signImg("headlights_on"),
    options: [
      "Switch your headlights on, in the dipped position",
      "Switch your headlights off",
      "Use your bright lights until the next sign",
      "Use your hazard lights",
    ],
    correctIndex: 0,
    explanation:
      "Dipped, not bright — the point is to be seen as much as to see, and brights on a road where this sign appears would dazzle oncoming drivers. A matching sign later ends the requirement.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qsg_taxis_only",
    categoryId: "signs",
    prompt: "This sign indicates that the road, or part of it, is:",
    image: signImg("taxis_only"),
    options: [
      "Set aside for the use of taxis",
      "Closed to taxis",
      "A taxi rank where you may not stop",
      "A place where taxis may not pick up passengers",
    ],
    correctIndex: 0,
    explanation:
      "Blue disc, so it is a command rather than a ban — this lane belongs to taxis. Driving in it in a private car is using a lane reserved for someone else.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Stop-sign family ────────────────────────────────────────
  {
    id: "qsg_four_way_stop",
    categoryId: "signs",
    prompt: "What does this sign tell you?",
    image: signImg("four_way_stop"),
    imageDetail: true,
    options: [
      "All four approaches to this intersection have stop signs",
      "You must stop for four seconds",
      "There are four lanes ahead",
      "The fourth vehicle in the queue may proceed without stopping",
    ],
    correctIndex: 0,
    explanation:
      "The number plate under a stop sign counts the approaches that must stop, so nobody has automatic priority. Order of arrival decides — and if two of you stopped together, yield to the right.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qsg_three_way_stop",
    categoryId: "signs",
    prompt: "A stop sign with a plate showing '3' beneath it means:",
    image: signImg("three_way_stop"),
    imageDetail: true,
    options: [
      "Three approaches to the intersection have stop signs",
      "You must wait three seconds before moving off",
      "The third exit is closed",
      "Three vehicles may enter the intersection at a time",
    ],
    correctIndex: 0,
    explanation:
      "Same idea as the four-way, one approach fewer — typical at a T-junction where all three arms stop. Knowing how many arms stop tells you how much of the traffic around you is also obliged to wait.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qsg_stop_go_left",
    categoryId: "signs",
    prompt: "What does this sign combination allow?",
    image: signImg("stop_go_left"),
    imageDetail: true,
    options: [
      "You may turn left without stopping if it is safe; going straight or right, you must stop",
      "You must stop, then turn left",
      "Left turns are prohibited",
      "You may proceed in any direction without stopping",
    ],
    correctIndex: 0,
    explanation:
      "A stop sign with a yield arrow beneath it — the left turn is governed by the yield, everything else by the stop. It keeps a free-flowing left slip lane moving without giving up control of the main crossing.",
    difficulty: 3,
    scope: "learners",
  },

  // ── Prohibitions that are easily confused ───────────────────
  {
    id: "qsg_no_stopping_sign",
    categoryId: "signs",
    prompt: "What does an 'S' inside a red ring, struck through, mean?",
    image: signImg("no_stopping"),
    options: [
      "No stopping — you may not even halt briefly",
      "No parking, though brief stops are allowed",
      "Stop ahead",
      "Slow down",
    ],
    correctIndex: 0,
    explanation:
      "The stricter of the pair. No stopping bans the momentary halt as well as the parked car, so you may not pause here to drop someone off — where a no-parking sign would allow exactly that.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qsg_no_stopping_vs_parking",
    categoryId: "signs",
    prompt: "The practical difference between a 'no parking' and a 'no stopping' sign is that:",
    options: [
      "No parking still allows a brief halt to load or drop off; no stopping does not",
      "No stopping applies only at night",
      "No parking applies only to cars, no stopping to all vehicles",
      "They mean the same thing",
    ],
    correctIndex: 0,
    explanation:
      "Where you may not stop, you certainly may not park — the stopping rule is the stricter core and the parking rules build on top of it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qsg_no_passenger_pickup",
    categoryId: "signs",
    prompt: "What does this sign prohibit?",
    image: signImg("no_passenger_pickup"),
    options: [
      "Picking up passengers along the stretch of road indicated",
      "Hitchhiking by pedestrians only",
      "Overtaking on the left",
      "Parking for longer than 500 m of roadway",
    ],
    correctIndex: 0,
    explanation:
      "Aimed at the stopping that picking someone up requires, which on a fast or narrow road is the actual hazard. It typically covers a stated distance rather than a single point.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qsg_end_toll_road",
    categoryId: "signs",
    prompt: "What does this sign indicate?",
    image: signImg("end_toll_road"),
    options: [
      "The end of the toll road",
      "The start of a toll road",
      "A toll plaza 500 m ahead",
      "That tolls may not be paid in cash here",
    ],
    correctIndex: 0,
    explanation:
      "A red diagonal cross over a sign is the general way of cancelling it — the restriction or condition it named stops applying from this point.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Warning signs: animals and junctions ────────────────────
  {
    id: "qsg_wild_animals_generic",
    categoryId: "signs",
    prompt: "What does this warning sign mean?",
    image: signImg("wild_animals_ahead"),
    options: [
      "Wild animals may be on the road ahead",
      "A game reserve entrance is ahead",
      "Hunting is permitted in this area",
      "Livestock are fenced off from the road",
    ],
    correctIndex: 0,
    explanation:
      "A leaping buck is the general 'wild animals' warning. Species-specific signs exist too — elephant, warthog, hippo — and they all mean the same thing for you: slow down and expect something to move.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qsg_animal_signs_response",
    categoryId: "signs",
    prompt:
      "You pass a sign warning of cattle ahead on an unfenced rural road at dusk. The safest response is to:",
    image: signImg("cattle_ahead"),
    options: [
      "Reduce speed and scan both verges, expecting animals to step out without warning",
      "Maintain speed but sound your hooter continuously",
      "Switch to bright lights and maintain speed",
      "Move to the right-hand side of the road",
    ],
    correctIndex: 0,
    explanation:
      "Herd animals move unpredictably and often follow one another across in sequence, so one animal crossing is a reason to expect several. Dusk is when they are hardest to see and most likely to be moving.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qsg_animal_sign_why_species",
    categoryId: "signs",
    prompt: "Why do separate warning signs exist for elephants, hippos and warthogs?",
    options: [
      "The animal's size and behaviour change how much room and warning you need",
      "They are decorative and carry no legal weight",
      "They indicate which animals may be legally hunted nearby",
      "They mark the boundaries of national parks",
    ],
    correctIndex: 0,
    explanation:
      "An elephant is a collision you do not survive and a warthog is one you might; a hippo on a road at night is both fast and completely unpredictable. Same instruction — slow down — but the stakes differ.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qsg_crossroad_ahead",
    categoryId: "signs",
    prompt: "What does this warning sign tell you?",
    image: signImg("crossroad_ahead"),
    options: [
      "There is a crossroad ahead",
      "There is a first-aid post ahead",
      "There is a hospital ahead",
      "Traffic merges from both sides ahead",
    ],
    correctIndex: 0,
    explanation:
      "The symbol is a plan view of the junction, not a medical cross. Junction-layout warnings are read as little maps: the thick stem is your road, the thin arms are what joins it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qsg_junction_layout_reading",
    categoryId: "signs",
    prompt: "On a triangular junction-warning sign, the thicker line in the symbol represents:",
    options: [
      "The road you are travelling on",
      "The road with right of way",
      "A road under construction",
      "A one-way road",
    ],
    correctIndex: 0,
    explanation:
      "Read the symbol as a map with yourself on the thick line. That is what lets you tell a T-junction from a side road, and a skew junction from a square one, before you can see the junction itself.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qsg_road_works_yellow",
    categoryId: "signs",
    prompt: "This sign appears on a yellow background rather than white. That tells you it is:",
    image: signImg("road_works_ahead"),
    options: [
      "A temporary sign, which overrides the permanent signs around it",
      "A permanent sign of lower importance",
      "Advisory only, with no legal force",
      "A sign that applies to heavy vehicles only",
    ],
    correctIndex: 0,
    explanation:
      "Yellow means temporary and temporary wins. Where a yellow sign contradicts the permanent one beside it, the yellow one is the one you must obey.",
    difficulty: 2,
    scope: "learners",
  },
];

export const MOTUS_SIGNS_FLASHCARDS: Flashcard[] = [
  {
    id: "fsg_qualifier_principle",
    categoryId: "signs",
    front: "What is the small plate mounted under a road sign for?",
    back: "It is a qualifier plate — it limits when, where or to whom the sign above applies. Read the pair together; the plate can mean the sign is not yours to obey, or that it is.",
    difficulty: 2,
  },
  {
    id: "fsg_qual_day_night",
    categoryId: "signs",
    front: "Sun plate and stars-and-moon plate — what do they mean?",
    back: "Sun = the sign applies during daytime only. Stars and moon = at night only.",
    difficulty: 1,
  },
  {
    id: "fsg_qual_kinds",
    categoryId: "signs",
    front: "What kinds of qualifier plate will you meet?",
    back: "Times ('06:30–09:00'), days, day/night, distance ('For 2km'), vehicle class (motorcycle, bus, goods vehicle), a count ('15 MAX'), payment required, and 'and Local Access Only'.",
    difficulty: 3,
  },
  {
    id: "fsg_blue_vs_red",
    categoryId: "signs",
    front: "Blue disc versus red ring — what is the difference?",
    back: "A blue disc commands (you must). A red ring prohibits (you may not). Same number in each means opposite things: red ring = maximum speed, blue disc = minimum speed.",
    difficulty: 2,
  },
  {
    id: "fsg_min_speed",
    categoryId: "signs",
    front: "What does a number on a solid blue disc mean?",
    back: "A minimum speed — you must travel at least that fast. The opposite of the same number inside a red ring.",
    difficulty: 3,
  },
  {
    id: "fsg_stop_counts",
    categoryId: "signs",
    front: "What does the number on a plate under a STOP sign mean?",
    back: "How many approaches to that intersection must stop — 3 for a three-way, 4 for a four-way. Nobody has automatic priority; order of arrival decides, and if you stopped together, yield to the right.",
    difficulty: 2,
  },
  {
    id: "fsg_stop_go_left",
    categoryId: "signs",
    front: "A STOP sign with a yield arrow pointing left beneath it — what may you do?",
    back: "Turn left without stopping if it is safe. Going straight on or turning right, you must stop as normal.",
    difficulty: 3,
  },
  {
    id: "fsg_no_stopping_vs_no_parking",
    categoryId: "signs",
    front: "No stopping versus no parking — what is the practical difference?",
    back: "No parking still allows a brief halt to drop someone off or load. No stopping bans even that. Where you may not stop, you may certainly not park.",
    difficulty: 2,
  },
  {
    id: "fsg_headlights_on",
    categoryId: "signs",
    front: "The blue disc with a headlight symbol — what must you do?",
    back: "Switch your headlights on, dipped — not bright. A matching sign with a red cross through it ends the requirement.",
    difficulty: 2,
  },
  {
    id: "fsg_red_cross_cancels",
    categoryId: "signs",
    front: "What does a red diagonal cross over a sign mean?",
    back: "It cancels the sign — the restriction or condition it named stops applying from that point. That is how 'end of toll road' and 'end of headlights-on' are shown.",
    difficulty: 2,
  },
  {
    id: "fsg_animal_warnings",
    categoryId: "signs",
    front: "Why are there separate warning signs for elephants, hippos, warthogs and cattle?",
    back: "The instruction is the same — slow down and scan the verges — but size and behaviour change how much room and warning you need. A leaping buck is the general 'wild animals' sign.",
    difficulty: 2,
  },
  {
    id: "fsg_junction_symbols",
    categoryId: "signs",
    front: "How do you read a triangular junction-warning sign?",
    back: "As a plan view. The thicker line is the road you are on; the thinner arms are what joins it — which distinguishes a crossroad from a T-junction, a side road or a skew junction.",
    difficulty: 3,
  },
  {
    id: "fsg_yellow_temporary",
    categoryId: "signs",
    front: "A yellow sign contradicts the permanent sign next to it. Which do you obey?",
    back: "The yellow one. Yellow means temporary, and a temporary sign overrides the permanent signs around it.",
    difficulty: 2,
  },
  {
    id: "fsg_taxis_only",
    categoryId: "signs",
    front: "Blue disc showing a taxi — what does it mean?",
    back: "The road or lane is reserved for taxis. Blue = command, so this is a lane that belongs to them, not a ban on them.",
    difficulty: 2,
  },
  {
    id: "fsg_local_access",
    categoryId: "signs",
    front: "'and Local Access Only' under a restriction sign — may you enter?",
    back: "Yes, if you have business there — a delivery, a visit, your own driveway. The restriction targets through traffic using the road as a shortcut.",
    difficulty: 3,
  },
  {
    id: "fsg_no_passenger_pickup",
    categoryId: "signs",
    front: "The red ring over a hand-and-thumb symbol — what does it prohibit?",
    back: "Picking up passengers along the stretch of road indicated. The hazard it targets is the stopping that picking someone up requires.",
    difficulty: 3,
  },
];
