import type { Question } from "@/types";

/**
 * Signs — junction priority, restriction *warnings*, temporary twins,
 * reservations and de-restrictions. Facts trace to docs/content/facts/signs.md
 * and the catalogue meanings in `signs.catalog.json`.
 *
 * Ground the existing packs leave untouched. Four families here are genuinely
 * new to the bank:
 *
 *  - **Junction-priority warnings** — the sign tells you whether the road you
 *    are on has priority or the one crossing it does, which is the whole
 *    question at an unmarked-looking rural crossroad.
 *  - **Restriction warnings vs the restriction itself** — a red *triangle*
 *    showing a height warns that a red-*ring* prohibition is coming. One is
 *    advance notice, the other is the offence. The manual treats them as
 *    separate signs and so does the exam.
 *  - **Temporary (yellow) twins** — the fact file lists permanent-vs-temporary
 *    as a high-yield confusion pair; the catalogue carries both versions.
 *  - **Reservation and de-restriction** — the R symbol with a yellow line, and
 *    the signs that end a restriction rather than impose one.
 *
 * Images are real catalogue crops so the learner reads the actual sign.
 */
const IMG = {
  priorityCrossroad: "/signs/warning/warning-035-02.png",
  priorityCrossroadAhead: "/signs/warning/warning-035-03.png",
  sideRoad: "/signs/warning/warning-035-06.png",
  staggered: "/signs/warning/warning-035-07.png",
  heightWarning: "/signs/warning/warning-030-02.png",
  widthWarningTemp: "/signs/warning/warning-031-04.png",
  softShoulder: "/signs/warning/warning-031-02.png",
  looseStonesTemp: "/signs/warning/warning-031-03.png",
  surfaceStep: "/signs/warning/warning-031-01.png",
  drift: "/signs/warning/warning-029-05.png",
  mist: "/signs/warning/warning-029-06.png",
  narrowStructure: "/signs/warning/warning-029-07.png",
  jetty: "/signs/warning/warning-029-04.png",
  agricultural: "/signs/warning/warning-038-07.png",
  busLane: "/signs/regulatory/regulatory-013-01.png",
  parkingReservation: "/signs/regulatory/regulatory-014-01.png",
  timeLimitedParking: "/signs/regulatory/regulatory-014-06.png",
  endMassRestriction: "/signs/regulatory/regulatory-017-03.png",
  endLaneReservation: "/signs/regulatory/regulatory-017-04.png",
  passSide: "/signs/regulatory/regulatory-009-04.png",
  noHooter: "/signs/regulatory/regulatory-012-03.png",
  noOvertakingGoods: "/signs/regulatory/regulatory-012-02.png",
} as const;

export const SIGNS_JUNCTIONS_QUESTIONS: Question[] = [
  // ── Junction priority ───────────────────────────────────────
  {
    id: "qs3_priority_road_crossroad",
    categoryId: "signs",
    image: IMG.priorityCrossroad,
    prompt: "This warning sign, with the thick bar running through it, tells you that:",
    options: [
      "You are on the priority road and a lesser road crosses ahead",
      "You must stop at the crossroad ahead",
      "The road you are on ends at the crossroad",
      "You must give way to all traffic at the crossroad",
    ],
    correctIndex: 0,
    explanation:
      "The thick limb is the road you are travelling on and the thin one is the road crossing it. Priority is yours here — but it is a warning, not a guarantee that cross-traffic will yield.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qs3_priority_crossroad_ahead",
    categoryId: "signs",
    image: IMG.priorityCrossroadAhead,
    prompt: "This warning sign shows the crossing road drawn thicker than yours. It means:",
    options: [
      "The road crossing ahead has priority — you must be ready to give way",
      "You have priority over the crossing road",
      "The crossing road is closed",
      "Traffic may only turn left at the crossing",
    ],
    correctIndex: 0,
    explanation:
      "Thickness shows rank. When the crossing road is the thick one, you are on the minor road and the obligation to give way is yours.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qs3_side_road_ahead",
    categoryId: "signs",
    image: IMG.sideRoad,
    prompt: "A warning triangle showing a side road joining from one side warns you to expect:",
    options: [
      "Vehicles emerging from, or turning into, that side road ahead",
      "That your road ends at the side road",
      "That the side road is one-way",
      "That you must turn into the side road",
    ],
    correctIndex: 0,
    explanation:
      "It flags a junction you might not otherwise see. Expect vehicles pulling out, and expect the driver ahead of you to slow suddenly to turn into it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs3_staggered_junctions",
    categoryId: "signs",
    image: IMG.staggered,
    prompt: "A warning sign showing staggered junctions means:",
    options: [
      "Two side roads join close together but not opposite each other — overtaking here is unwise",
      "The road ahead splits into two carriageways",
      "There is a crossroad where all four arms meet",
      "The road ahead zigzags sharply",
    ],
    correctIndex: 0,
    explanation:
      "Staggered junctions produce turning traffic from both sides within a short stretch, and a vehicle waiting in one can hide another. It is a poor place to be overtaking.",
    difficulty: 3,
    scope: "learners",
  },

  // ── Warning of a restriction vs the restriction ─────────────
  {
    id: "qs3_height_warning_vs_prohibition",
    categoryId: "signs",
    image: IMG.heightWarning,
    prompt: "This red triangle showing a height between two arrows means:",
    options: [
      "A height restriction is coming up — the prohibition itself is signed further on",
      "You may not proceed past this sign if you exceed that height",
      "That is the recommended clearance for loads",
      "The bridge ahead has been measured at that height for information only",
    ],
    correctIndex: 0,
    explanation:
      "A triangle warns; a red ring prohibits. This one gives you notice while there is still somewhere to turn — which is the whole point of putting it before the restriction.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qs3_triangle_vs_ring_general",
    categoryId: "signs",
    prompt: "The same measurement can appear on a red-bordered triangle and inside a red ring. The difference is that:",
    options: [
      "The triangle warns a restriction is ahead; the red ring is the restriction and passing it is an offence",
      "The triangle applies to heavy vehicles and the ring to all vehicles",
      "The triangle applies by day and the ring at night",
      "They mean the same thing and are used interchangeably",
    ],
    correctIndex: 0,
    explanation:
      "Shape carries the legal weight in this system. Reading the shape first tells you whether you are being informed or instructed, before you have even read the number.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs3_narrow_structure",
    categoryId: "signs",
    image: IMG.narrowStructure,
    prompt: "A warning sign for a narrow structure ahead, such as a bridge, tells you to expect:",
    options: [
      "A section too narrow for vehicles to pass each other freely — be ready to give way",
      "A structure that is closed to traffic",
      "A weight limit on the structure",
      "A toll point at the structure",
    ],
    correctIndex: 0,
    explanation:
      "Narrow bridges and culverts often take one vehicle at a time. Arriving slowly means you can stop and let an oncoming vehicle through rather than meeting it halfway across.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Temporary (yellow) twins ────────────────────────────────
  {
    id: "qs3_temp_width_twin",
    categoryId: "signs",
    image: IMG.widthWarningTemp,
    prompt: "You meet this warning sign on a yellow background. Compared with the same sign on white, it:",
    options: [
      "Carries the same legal force, but marks a temporary condition such as roadworks",
      "Is advisory only, because temporary signs cannot be enforced",
      "Applies only while workers are present",
      "Replaces the permanent sign permanently",
    ],
    correctIndex: 0,
    explanation:
      "Yellow means the conditions have changed from normal, not that the sign matters less. Temporary signs bind exactly as the permanent ones do, and override them while they stand.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs3_temp_soft_shoulder",
    categoryId: "signs",
    image: IMG.softShoulder,
    prompt: "A temporary sign warning of a soft shoulder means:",
    options: [
      "The edge of the road will not carry your weight — keep to the surfaced lane",
      "The shoulder may be used as an extra lane",
      "The shoulder is reserved for slow vehicles",
      "Loose stones have been swept onto the shoulder",
    ],
    correctIndex: 0,
    explanation:
      "A soft edge grabs a wheel and pulls the vehicle off the road, and the correction drivers make instinctively is what rolls it. Stay on the surfaced part.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs3_temp_surface_step",
    categoryId: "signs",
    image: IMG.surfaceStep,
    prompt: "A temporary sign warning of a step in the road surface means:",
    options: [
      "There is a vertical drop between surface levels — cross it slowly and squarely",
      "The road rises steeply ahead",
      "A speed hump has been installed",
      "The surface changes from tar to gravel",
    ],
    correctIndex: 0,
    explanation:
      "Resurfacing often leaves one lane lower than the next. Taken at an angle or at speed, that edge can deflect the steering or damage a tyre and rim.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs3_temp_loose_stones",
    categoryId: "signs",
    image: IMG.looseStonesTemp,
    prompt: "At roadworks you pass a yellow sign warning of loose stones. The main reason to slow down is that:",
    options: [
      "Grip is reduced and your wheels throw stones at other vehicles and windscreens",
      "The stones will damage your exhaust",
      "Stones indicate the road is about to end",
      "It is only a problem for motorcycles",
    ],
    correctIndex: 0,
    explanation:
      "Loose chippings behave like ball bearings under braking, and speed turns them into projectiles for the vehicle behind and oncoming traffic.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Surface and visibility warnings ─────────────────────────
  {
    id: "qs3_drift",
    categoryId: "signs",
    image: IMG.drift,
    prompt: "This warning sign marks a drift ahead, where water crosses the road. You should:",
    options: [
      "Slow right down, and test your brakes gently once you are through the water",
      "Cross at speed so the water does not slow you",
      "Assume it is dry unless it has rained recently",
      "Stop and wait for another vehicle to cross first",
    ],
    correctIndex: 0,
    explanation:
      "Water between pad and disc kills braking, so a gentle test on the far side tells you whether they have dried. Depth is also unknowable from the driver's seat.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs3_reduced_visibility",
    categoryId: "signs",
    image: IMG.mist,
    prompt: "A warning sign for reduced visibility ahead usually marks a stretch where:",
    options: [
      "Mist or fog forms frequently — be ready to slow and use dipped headlights",
      "Street lighting has been removed",
      "The sun causes glare at certain times only",
      "Overtaking is prohibited at night",
    ],
    correctIndex: 0,
    explanation:
      "These go up where local conditions produce mist regularly — passes, valleys and coastal stretches. The sign warns you before you are in it, when slowing is still easy.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs3_jetty_river",
    categoryId: "signs",
    image: IMG.jetty,
    prompt: "A warning sign showing a vehicle at a water's edge warns that:",
    options: [
      "The road runs close to a quay or river bank with no barrier — a wrong move ends in the water",
      "A ferry service crosses the road",
      "Flooding is likely at that point",
      "A bridge is under construction",
    ],
    correctIndex: 0,
    explanation:
      "Where the road ends at water rather than at a verge, an ordinary misjudgement becomes an immersion. These are placed where there is nothing to stop a vehicle going in.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qs3_agricultural_vehicles",
    categoryId: "signs",
    image: IMG.agricultural,
    prompt: "A warning sign showing a tractor means you should expect:",
    options: [
      "Slow, wide farm vehicles that may turn into fields without much warning",
      "A farm stall selling produce ahead",
      "Livestock crossing the road",
      "That the road becomes a private farm track",
    ],
    correctIndex: 0,
    explanation:
      "Tractors travel far below the limit, are often wider than a lane, and turn into gateways that are hard to see. The closing speed catches drivers out on open rural roads.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Reservation signs ───────────────────────────────────────
  {
    id: "qs3_bus_lane_reservation",
    categoryId: "signs",
    image: IMG.busLane,
    prompt: "This blue sign shows a bus, a large 'R', and a yellow line down one side. It means:",
    options: [
      "The lane on the marked side of the yellow line is reserved for buses",
      "Buses are prohibited from the lane shown",
      "Buses stop at this point",
      "All vehicles must give way to buses here",
    ],
    correctIndex: 0,
    explanation:
      "The 'R' is for reservation, and the yellow line on the sign shows which side of the real yellow line the reserved lane lies. Using it in an ordinary car is an offence.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qs3_reservation_meaning",
    categoryId: "signs",
    prompt: "On South African signs, a large letter 'R' alongside a vehicle symbol indicates:",
    options: [
      "A reservation — that road, lane or area is set aside for the class of vehicle shown",
      "A restriction on that class of vehicle",
      "A recommended route for that class of vehicle",
      "A rest area for that class of vehicle",
    ],
    correctIndex: 0,
    explanation:
      "Reservation signs give a space to one class rather than taking it away. Read the symbol to see who it is for — buses, taxis, goods vehicles or the disabled.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qs3_parking_reservation",
    categoryId: "signs",
    image: IMG.parkingReservation,
    prompt: "A blue sign marking an area reserved for parking tells you:",
    options: [
      "Parking is permitted in that area, subject to any plate beneath the sign",
      "Parking is prohibited in that area",
      "Only buses may park there",
      "The area is a loading zone",
    ],
    correctIndex: 0,
    explanation:
      "Blue reservation signs permit rather than prohibit. The plate underneath is what narrows it — a vehicle class, a time limit or a payment requirement.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs3_time_limited_parking",
    categoryId: "signs",
    image: IMG.timeLimitedParking,
    prompt: "A parking reservation sign showing a time limit means:",
    options: [
      "You may park there only up to the period shown, after which you must move",
      "You may park there only after the time shown",
      "The limit applies to loading only",
      "The limit is a recommendation for busy periods",
    ],
    correctIndex: 0,
    explanation:
      "A time-limited bay turns over so more drivers can use it. Overstaying is a parking offence whether or not the bay is needed at that moment.",
    difficulty: 2,
    scope: "learners",
  },

  // ── De-restriction ──────────────────────────────────────────
  {
    id: "qs3_end_mass_restriction",
    categoryId: "signs",
    image: IMG.endMassRestriction,
    prompt: "This sign repeats a mass restriction with a band struck through it. It means:",
    options: [
      "The mass restriction no longer applies from this point",
      "The restriction now applies more strictly",
      "The restriction applies only to goods vehicles",
      "A weighbridge is ahead",
    ],
    correctIndex: 0,
    explanation:
      "A struck-through repeat cancels the restriction it shows. Until you pass it, the original limit is still in force however far you have driven.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs3_end_lane_reservation",
    categoryId: "signs",
    image: IMG.endLaneReservation,
    prompt: "A sign cancelling a lane reservation tells you that:",
    options: [
      "The lane is no longer reserved and all vehicles may now use it",
      "The lane is now reserved for a different class of vehicle",
      "The lane is closed ahead",
      "The lane becomes a shoulder",
    ],
    correctIndex: 0,
    explanation:
      "Reservations run until cancelled, exactly like prohibitions. This is the sign that gives the lane back to everyone.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Command and prohibition detail ──────────────────────────
  {
    id: "qs3_pass_side_shown",
    categoryId: "signs",
    image: IMG.passSide,
    prompt: "This blue command sign at an obstruction tells you:",
    options: [
      "Which side of the obstruction you must pass",
      "That the road ahead is one-way",
      "That you must turn at the next junction",
      "That the obstruction may be passed on either side",
    ],
    correctIndex: 0,
    explanation:
      "It governs the object immediately in front of you — an island, a works barrier, a bridge pier — rather than the road beyond it. Blue circle, so it is a command.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs3_no_hooter",
    categoryId: "signs",
    image: IMG.noHooter,
    prompt: "A red-ringed sign showing a hooter crossed out means:",
    options: [
      "You may not sound your hooter past this sign except in an emergency",
      "Your vehicle's hooter must be disconnected",
      "Hooting is discouraged but not prohibited",
      "The sign applies only to heavy vehicles",
    ],
    correctIndex: 0,
    explanation:
      "These protect hospitals and residential areas from noise. The general rule still stands that a hooter is for warning others of your presence, not for expressing impatience.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs3_no_overtaking_goods",
    categoryId: "signs",
    image: IMG.noOvertakingGoods,
    prompt: "A no-overtaking sign showing a goods vehicle means that:",
    options: [
      "Goods vehicles may not overtake past this sign — other vehicles are not affected by it",
      "No vehicle may overtake a goods vehicle",
      "Goods vehicles may not be overtaken",
      "Goods vehicles may not use this road",
    ],
    correctIndex: 0,
    explanation:
      "The symbol says who the restriction is aimed at. Class-specific signs are common on long climbs, where a slow truck passing another blocks the road for everyone behind.",
    difficulty: 3,
    scope: "learners",
  },

  // ── Reading the system ──────────────────────────────────────
  {
    id: "qs3_warning_shape_priority",
    categoryId: "signs",
    prompt: "On a junction-warning sign, the thickness of the lines drawn on it tells you:",
    options: [
      "Which road has priority — the thicker line is the priority road",
      "How wide each road is",
      "How many lanes each road has",
      "Which road is surfaced",
    ],
    correctIndex: 0,
    explanation:
      "It is a diagram of rank, not of width. Reading it correctly is the difference between expecting to give way and expecting to be given way to.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qs3_yellow_temp_reason",
    categoryId: "signs",
    prompt: "Temporary signs use a yellow background because:",
    options: [
      "It flags instantly that conditions have changed from normal, so drivers re-assess",
      "Yellow is cheaper to produce for short-term use",
      "Yellow signs are advisory rather than compulsory",
      "Yellow is easier to see only at night",
    ],
    correctIndex: 0,
    explanation:
      "The colour is doing a job: a driver who knows this road can otherwise run on memory. Yellow says the picture you have of this road is out of date.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs3_warning_no_obligation",
    categoryId: "signs",
    prompt: "A warning sign differs from a regulatory sign in that a warning sign:",
    options: [
      "Describes what is ahead and leaves the response to your judgement, rather than imposing a specific act",
      "May be ignored if the hazard is not visible",
      "Applies only outside urban areas",
      "Is always advisory and carries no consequence",
    ],
    correctIndex: 0,
    explanation:
      "Ignoring a warning is not itself an offence the way passing a red-ringed prohibition is — but driving without adjusting to a hazard you were warned about is negligent driving.",
    difficulty: 3,
    scope: "learners",
  },
];
