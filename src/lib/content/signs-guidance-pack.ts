import type { Question } from "@/types";

/**
 * Signs — guidance and information signage, signal variants, and danger plates.
 * Facts trace to docs/content/facts/signs.md.
 *
 * Signs is the binding section for every code again, so depth here raises the
 * mock ceiling across the board.
 *
 * Guidance signage is deliberately excluded from the *generated* pack — route
 * numbers and place names test geography rather than road rules — but how the
 * guidance system is *read* is genuinely examinable, and the bank had almost
 * nothing on it: colour conventions, advance versus at-the-junction signing,
 * and the countdown markers on a freeway exit.
 */
const IMG = {
  exitCountdown: "/signs/information/information-043-01.png",
  noThroughRoad: "/signs/information/information-043-03.png",
  priorityRoad: "/signs/information/information-043-05.png",
  infoCentre: "/signs/information/information-044-04.png",
  dangerPlate: "/signs/warning/warning-040-01.png",
  overheadMarker: "/signs/warning/warning-040-04.png",
  generalWarning: "/signs/warning/warning-029-03.png",
  constructionVehicles: "/signs/warning/warning-039-03.png",
} as const;

export const SIGNS_GUIDANCE_QUESTIONS: Question[] = [
  // ── Reading the guidance system ─────────────────────────────
  {
    id: "qs4_green_vs_blue_boards",
    categoryId: "signs",
    prompt: "On South African direction signage, green boards with white lettering indicate:",
    options: [
      "Freeway routes and destinations",
      "Tourist attractions and places of interest",
      "Temporary diversions at roadworks",
      "Municipal boundaries",
    ],
    correctIndex: 0,
    explanation:
      "Colour is the first thing to read on a direction board. Green means freeway; blue is used for other routes and services, and brown for tourism.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs4_brown_tourism",
    categoryId: "signs",
    prompt: "A brown sign with white lettering points to:",
    options: [
      "A tourist attraction, park or place of cultural interest",
      "A road closure ahead",
      "A weighbridge for heavy vehicles",
      "A hazardous-goods route",
    ],
    correctIndex: 0,
    explanation:
      "Brown is reserved for tourism so it does not compete with route information. Useful to recognise precisely so that you can ignore it while navigating.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qs4_advance_vs_junction",
    categoryId: "signs",
    prompt: "Direction signs usually appear twice — well before a junction and again at it. The advance sign exists so that you can:",
    options: [
      "Change lanes and adjust speed in good time, rather than deciding at the junction itself",
      "Confirm the distance you have already travelled",
      "Check whether the junction is open",
      "Read the destinations more comfortably at speed",
    ],
    correctIndex: 0,
    explanation:
      "The dangerous manoeuvre is the late one: braking hard or crossing lanes at the exit. Advance signing exists to move that decision back to where it is safe.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs4_exit_countdown_markers",
    categoryId: "signs",
    image: IMG.exitCountdown,
    prompt: "The countdown markers with diagonal bars before a freeway exit tell you:",
    options: [
      "How far the exit is, each bar representing a fixed distance",
      "How many lanes the exit has",
      "The speed limit on the off-ramp",
      "How many exits remain on this route",
    ],
    correctIndex: 0,
    explanation:
      "They count you down to the off-ramp when destination boards are behind you. If you are still in the wrong lane at the last marker, take the next exit instead.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs4_no_through_road_sign",
    categoryId: "signs",
    image: IMG.noThroughRoad,
    prompt: "This information sign, showing a road with a red bar across its far end, means:",
    options: [
      "The road has no exit at the far end — you will have to return the way you came",
      "The road is closed to all traffic",
      "There is a boom or barrier ahead",
      "The road ahead is a private road",
    ],
    correctIndex: 0,
    explanation:
      "It marks a cul-de-sac. Worth spotting early, because turning at the closed end is the difficult part — especially towing anything.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qs4_priority_road_sign",
    categoryId: "signs",
    image: IMG.priorityRoad,
    prompt: "This sign tells you that the road you are travelling on:",
    options: [
      "Has priority at the junction ahead — but you must still watch for drivers who do not yield",
      "Ends at the junction ahead",
      "Becomes a one-way road",
      "Requires you to stop at the junction ahead",
    ],
    correctIndex: 0,
    explanation:
      "Knowing you have priority tells you what to expect, not what will happen. Priority is given by other drivers; the sign cannot make them give it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs4_info_centre",
    categoryId: "signs",
    image: IMG.infoCentre,
    prompt: "A blue information sign showing an 'i' symbol marks:",
    options: [
      "An information centre where local directions and details can be obtained",
      "An inspection point for heavy vehicles",
      "An intersection ahead",
      "An emergency call point",
    ],
    correctIndex: 0,
    explanation:
      "Blue rectangles inform rather than instruct. The 'i' is the international convention, and it is a far better place to work out a route than the hard shoulder.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qs4_street_name_position",
    categoryId: "signs",
    prompt: "Street-name signs are most useful to a driver when read:",
    options: [
      "Along with the advance direction signs, so the turn is identified before you reach it",
      "Only once you are level with the junction",
      "After passing the junction, to confirm the route",
      "Only when you are lost",
    ],
    correctIndex: 0,
    explanation:
      "Hunting for a street name at the junction itself is what produces last-second braking and lane changes. Pair it with the advance board and the turn is planned, not discovered.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Danger plates and markers ───────────────────────────────
  {
    id: "qs4_danger_plate_chevrons",
    categoryId: "signs",
    image: IMG.dangerPlate,
    prompt: "This red-and-white striped plate with arrowheads means:",
    options: [
      "Pass the hazard on the side the arrowheads point to",
      "The road ahead is closed",
      "A pedestrian crossing is ahead",
      "Overtaking is prohibited from this point",
    ],
    correctIndex: 0,
    explanation:
      "It marks the obstruction itself — a pier, an island nose, a works barrier — and the direction of the stripes shows the side to pass. It is guidance at the object, not advance warning.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs4_overhead_marker",
    categoryId: "signs",
    image: IMG.overheadMarker,
    prompt: "A danger plate marking an overhead structure across the road warns you about:",
    options: [
      "Limited headroom — the height of your vehicle and its load matters here",
      "A pedestrian bridge you may not stop under",
      "Overhead power lines that must not be touched",
      "A gantry displaying variable messages",
    ],
    correctIndex: 0,
    explanation:
      "It draws the eye to a structure that is easy to miss at night or in rain. Knowing your laden height is the driver's responsibility, and a roof rack changes it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs4_general_warning_plate",
    categoryId: "signs",
    image: IMG.generalWarning,
    prompt: "A warning triangle showing an exclamation mark usually means:",
    options: [
      "A hazard not covered by a specific sign — read the plate beneath it for what it is",
      "The road ahead is closed",
      "A traffic signal is out of order",
      "The previous warning no longer applies",
    ],
    correctIndex: 0,
    explanation:
      "It is the catch-all for anything without its own symbol. Without reading the plate underneath you know only that something is coming, which is precisely half the message.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs4_construction_vehicles",
    categoryId: "signs",
    image: IMG.constructionVehicles,
    prompt: "A warning sign showing a construction vehicle means you should expect:",
    options: [
      "Slow, heavy plant entering or crossing the road, often trailing mud",
      "A construction site you may not enter",
      "That the road surface is newly laid",
      "A weighbridge ahead",
    ],
    correctIndex: 0,
    explanation:
      "Plant moves far slower than traffic and pulls out from site accesses with a poor view. The mud these vehicles leave on the road is a second, less obvious hazard.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Signal variants ─────────────────────────────────────────
  {
    id: "qs4_pedestrian_signal_meaning",
    categoryId: "signs",
    prompt: "A steady red figure on a pedestrian signal instructs pedestrians not to cross. For a driver it signals that:",
    options: [
      "Pedestrians should be stationary — but someone already crossing still has priority to finish",
      "The crossing is closed and may be driven over freely",
      "Pedestrians have been given a green phase",
      "The signal is faulty",
    ],
    correctIndex: 0,
    explanation:
      "The signal governs when people may start. Anyone already in the road when it changed is still entitled to complete the crossing, and drivers must let them.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs4_bus_signal_bar",
    categoryId: "signs",
    prompt: "A traffic signal showing a white horizontal bar or bus symbol applies to:",
    options: [
      "Public-transport vehicles in a reserved lane, not to general traffic",
      "All traffic, as an alternative to the normal signal",
      "Pedestrians crossing at that point",
      "Vehicles turning right only",
    ],
    correctIndex: 0,
    explanation:
      "Dedicated signals release the bus lane on its own phase, often a few seconds early. Ordinary traffic obeys the ordinary signal beside it.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qs4_signal_out_of_order",
    categoryId: "signs",
    prompt: "You approach an intersection where the traffic signals are completely dead. You must treat it as:",
    options: [
      "A four-way stop — stop, then proceed in order of arrival",
      "An intersection where the busier road has priority",
      "An uncontrolled intersection where the right-hand rule alone applies",
      "An intersection you may cross without stopping if it looks clear",
    ],
    correctIndex: 0,
    explanation:
      "A dead robot becomes a four-way stop by default. It works only if every driver does the same thing, which is why the rule is a stop rather than a judgement call.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qs4_lane_control_green_arrow",
    categoryId: "signs",
    prompt: "An overhead lane signal showing a downward green arrow means:",
    options: [
      "That lane is open for traffic in your direction",
      "Traffic in that lane must turn at the next junction",
      "That lane is reserved for emergency vehicles",
      "The lane ends and you must merge",
    ],
    correctIndex: 0,
    explanation:
      "Green arrow open, red X closed. These reverse lanes for peak flow or close them for an incident, so the overhead signal outranks the painted markings beneath it.",
    difficulty: 2,
    scope: "learners",
  },
];
