import type { Question } from "@/types";

/**
 * Rules-section expansion. Facts trace to docs/content/facts/rules.md,
 * intersections.md and hazard-parking-following.md.
 *
 * The mock draws 28 from this whole group per paper, so depth anywhere in the
 * five categories widens the same section. Spread across all five rather than
 * piled into `rules`, weighted toward the thinner ones.
 *
 * Procedure, priority and judgement only. No item turns on a regulated numeric
 * threshold — the roadmap's standing note is to verify those against the
 * regulation first, and the existing packs already carry the well-established
 * figures (speed limits, BAC, following seconds, AARTO points).
 */
export const RULES_LIFT_QUESTIONS: Question[] = [
  // ── Rules ───────────────────────────────────────────────────
  {
    id: "qr3_level_crossing_room",
    categoryId: "rules",
    prompt: "You may only start crossing a railway level crossing when:",
    options: [
      "There is room for your vehicle to clear the tracks completely on the far side",
      "The boom has begun to lift, even if traffic ahead has not moved",
      "You can see no train in either direction",
      "The vehicle ahead of you has started to move",
    ],
    correctIndex: 0,
    explanation:
      "Stopping on the tracks because the queue beyond did not move is how vehicles end up in front of a train. A train cannot stop or swerve, so the space on the far side must exist before you commit.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_collision_duty",
    categoryId: "rules",
    prompt: "After a collision in which someone is injured, the driver must:",
    options: [
      "Stop, render what assistance they can, and give their particulars",
      "Move the vehicles and continue if the damage looks minor",
      "Wait only if the other driver asks them to",
      "Leave the scene and report it at a police station later that week",
    ],
    correctIndex: 0,
    explanation:
      "Stopping is not optional, and neither is identifying yourself. Leaving the scene of an injury collision is a serious offence quite apart from any fault for the crash itself.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_tow_rope_steering",
    categoryId: "rules",
    prompt: "When a broken-down car is towed on a rope, the towed vehicle:",
    options: [
      "Must have a licensed driver at its wheel to steer and brake it",
      "May be left empty as long as the rope is short",
      "Should be left in gear so it cannot roll",
      "Needs no driver if the towing vehicle is heavier",
    ],
    correctIndex: 0,
    explanation:
      "A rope only pulls — it does not steer or stop the vehicle behind it. Someone competent has to be at that wheel, and both vehicles must be lit and signalled as a combination.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_hazards_while_moving",
    categoryId: "rules",
    prompt: "Driving along with your hazard lights flashing is:",
    options: [
      "Wrong in normal driving — they hide your indicators, so nobody can read your intentions",
      "A sensible way to warn others that you are driving slowly",
      "Required whenever it rains",
      "The correct signal that you intend to go straight at a circle",
    ],
    correctIndex: 0,
    explanation:
      "With hazards on, both indicators are already flashing, so a turn signal becomes invisible. They are for warning others that you are a stationary hazard, not a running commentary on your speed.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_yellow_lane_not_a_lane",
    categoryId: "rules",
    prompt: "The yellow line along the left edge of a rural road marks:",
    options: [
      "The edge of the roadway — the shoulder beyond it is not a traffic lane",
      "A permanent lane for slower vehicles to drive in",
      "A parking lane available at all times",
      "A cycle lane that motor vehicles may share",
    ],
    correctIndex: 0,
    explanation:
      "The shoulder carries broken-down vehicles, pedestrians and debris. Driving in it as a matter of course — however common — puts you where none of those expect a moving car.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_rear_seatbelts",
    categoryId: "rules",
    prompt: "Seatbelts fitted to the rear seats of a car:",
    options: [
      "Must be worn by the passengers sitting there",
      "Are optional, since rear seats are safer",
      "Only need to be worn outside urban areas",
      "Only apply to passengers over 18",
    ],
    correctIndex: 0,
    explanation:
      "An unbelted rear passenger is thrown forward in a crash with enough force to injure or kill the person in front of them. Where a belt is fitted, it is there to be used.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr3_projecting_load_marked",
    categoryId: "rules",
    prompt: "A load that projects beyond the rear of your vehicle must:",
    options: [
      "Be clearly marked so following drivers can see where the vehicle actually ends",
      "Be painted a bright colour along its whole length",
      "Be removed before driving on a public road",
      "Simply be secured — marking is only needed at night",
    ],
    correctIndex: 0,
    explanation:
      "A following driver judges your vehicle's length by what they can see. An unmarked projection is invisible until it is through their windscreen, which is why it must be flagged.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_plates_legible",
    categoryId: "rules",
    prompt: "Your number plates must be:",
    options: [
      "Fitted as required and kept legible — obscured or damaged plates are an offence",
      "Legible only at the rear of the vehicle",
      "Cleaned only before a roadworthy test",
      "Visible only when the vehicle is stationary",
    ],
    correctIndex: 0,
    explanation:
      "The plate is how the vehicle is identified after an incident. Mud, a tow bar, a bicycle rack or a cracked plate all defeat that, and all of them are the driver's responsibility.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr3_stationary_bus",
    categoryId: "rules",
    prompt: "Passing a bus or minibus stopped at the roadside to set down passengers, you should:",
    options: [
      "Slow right down and watch for people stepping out from in front of and behind it",
      "Maintain speed, since passengers must wait for traffic",
      "Sound your hooter and pass close to save time",
      "Overtake on the left where there is space",
    ],
    correctIndex: 0,
    explanation:
      "A stopped bus hides the people it just dropped off, and they often cross immediately, in front of or behind it. It is one of the most predictable pedestrian hazards on any road.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_footwear_control",
    categoryId: "rules",
    prompt: "Driving in loose sandals or with wet, slippery shoes matters because:",
    options: [
      "You must stay in proper control — footwear that slips off or jams under a pedal takes that away",
      "It is specifically banned in the K53 syllabus",
      "It only matters in a manual vehicle",
      "It only affects the handbrake",
    ],
    correctIndex: 0,
    explanation:
      "The rule that bites is the general duty to remain in full control. A sandal wedged under the brake pedal is the moment that duty is tested, and no separate footwear regulation is needed to make it your fault.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Intersections ───────────────────────────────────────────
  {
    id: "qr3_keep_clear_marking",
    categoryId: "intersections",
    prompt: "A 'KEEP CLEAR' box painted across the road at a side entrance means you:",
    options: [
      "May not stop within it, even in a queue — it must stay open for traffic using that entrance",
      "May stop in it briefly if traffic is heavy",
      "Have right of way over vehicles emerging from that entrance",
      "Must stop before it and give way to all traffic",
    ],
    correctIndex: 0,
    explanation:
      "The box keeps an access open through standing traffic. Creeping into it because the queue moved a metre is exactly the behaviour it exists to prevent.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_slip_lane_merge",
    categoryId: "intersections",
    prompt: "Joining a main road from an acceleration (slip) lane, you should:",
    options: [
      "Match the speed of the traffic and merge into a gap, giving way to vehicles already on the road",
      "Stop at the end of the lane and wait for a complete break in traffic",
      "Maintain your speed and expect traffic to move over for you",
      "Merge as early as possible regardless of the gap",
    ],
    correctIndex: 0,
    explanation:
      "The slip lane exists so you can arrive at traffic speed. Stopping at its end forces you to rejoin from a standstill, which is far more dangerous than merging at pace.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_green_but_pedestrian",
    categoryId: "intersections",
    prompt: "Your light turns green while a pedestrian is still crossing in front of you. You:",
    options: [
      "Wait for them to finish crossing before moving off",
      "Move off slowly, since your light gives you priority",
      "Sound your hooter to hurry them along",
      "Drive around behind them",
    ],
    correctIndex: 0,
    explanation:
      "A green light permits movement; it does not clear the road of people already in it. Someone who is halfway across cannot simply stop and go back.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr3_right_from_oneway",
    categoryId: "intersections",
    prompt: "Turning right out of a one-way street, you should position your vehicle:",
    options: [
      "Close to the right-hand edge of the roadway, since there is no oncoming traffic",
      "In the centre of the roadway as you would on a two-way road",
      "Close to the left-hand kerb throughout",
      "Wherever the traffic ahead of you happens to be",
    ],
    correctIndex: 0,
    explanation:
      "A one-way street has no oncoming stream, so the whole right-hand side is available for the turn. Sitting in the middle blocks traffic going straight for no reason.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qr3_circle_exit_crossing",
    categoryId: "intersections",
    prompt: "Leaving a traffic circle, the hazard most often missed is:",
    options: [
      "Pedestrians crossing the exit road you are turning into",
      "Vehicles entering the circle behind you",
      "The camber of the circle itself",
      "Traffic on the opposite side of the circle",
    ],
    correctIndex: 0,
    explanation:
      "Attention is still on the circle when the vehicle is already leaving it, and the exit is exactly where people cross. The look has to move to where the car is going.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_turn_across_cycle_lane",
    categoryId: "intersections",
    prompt: "Turning left across a marked cycle lane, you must:",
    options: [
      "Give way to cyclists already in the lane and check your left blind spot before turning",
      "Turn first, since a cyclist can stop more easily than a car",
      "Sound your hooter and turn",
      "Straddle the cycle lane on the approach so cyclists cannot pass you",
    ],
    correctIndex: 0,
    explanation:
      "A cyclist going straight in a lane you are crossing has priority over your turn, and they sit precisely where a mirror alone will not find them.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_yield_line_position",
    categoryId: "intersections",
    prompt: "The broken line painted across your lane at a yield sign marks:",
    options: [
      "The point at which you must be able to give way to traffic on the road you are joining",
      "A place you must always come to a complete stop",
      "The boundary of a pedestrian crossing",
      "Where the speed limit changes",
    ],
    correctIndex: 0,
    explanation:
      "The line is where the obligation bites. You need not stop on it if the way is genuinely clear, but you must arrive slowly enough that stopping there is still possible.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_blocked_box_wait",
    categoryId: "intersections",
    prompt: "Traffic ahead is stationary and your green light is about to change. You should:",
    options: [
      "Wait behind the line — entering now would leave you stranded in the intersection",
      "Move into the intersection so you are first away when it clears",
      "Move up as far as the middle of the intersection",
      "Follow the car in front regardless of the space beyond",
    ],
    correctIndex: 0,
    explanation:
      "A vehicle stuck in the intersection blocks every other direction's phase. The green permits you to go; it does not promise there is anywhere to arrive.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_two_lane_circle_position",
    categoryId: "intersections",
    prompt: "On a two-lane traffic circle, taking an exit more than halfway around, you would normally:",
    options: [
      "Approach in the right-hand lane and move left as you near your exit",
      "Approach in the left-hand lane and stay there throughout",
      "Use whichever lane is emptier and change inside the circle",
      "Straddle both lanes so nobody can pass you",
    ],
    correctIndex: 0,
    explanation:
      "Lane choice on the approach reflects where you are leaving. Entering left for a late exit means crossing traffic inside the circle — the most common collision there.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qr3_scholar_patrol_authority",
    categoryId: "intersections",
    prompt: "A scholar patrol steps into the road with its banners. You must:",
    options: [
      "Stop and remain stopped until the patrol withdraws the banners",
      "Slow down and pass if no children are visible",
      "Stop only if children are already crossing",
      "Continue, since a scholar patrol has no authority over traffic",
    ],
    correctIndex: 0,
    explanation:
      "The banners are the instruction, not the children. Moving off while they are still out is both dangerous and an offence.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Parking ─────────────────────────────────────────────────
  {
    id: "qr3_park_taxi_rank",
    categoryId: "parking",
    prompt: "Parking a private car in a marked taxi rank is:",
    options: [
      "Not allowed — the rank is reserved for the class of vehicle marked",
      "Allowed outside peak hours",
      "Allowed if no taxis are present",
      "Allowed for up to fifteen minutes",
    ],
    correctIndex: 0,
    explanation:
      "A reserved rank is class-restricted the same way a bus lane is. Occupying it pushes taxis into the traffic lane to load, which is the hazard the rank prevents.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr3_park_traffic_island",
    categoryId: "parking",
    prompt: "Stopping on a traffic island or painted median is:",
    options: [
      "Prohibited — it is not roadway, and a vehicle there obstructs sightlines and pedestrian refuge",
      "Permitted if your hazard lights are on",
      "Permitted for loading only",
      "Permitted where the island is wide enough",
    ],
    correctIndex: 0,
    explanation:
      "Islands separate conflicting streams and give pedestrians somewhere to wait mid-crossing. A vehicle parked on one removes both functions at once.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_park_school_gate",
    categoryId: "parking",
    prompt: "Stopping right at a school gate at closing time is a poor idea mainly because:",
    options: [
      "It hides small children from approaching drivers at the exact place they cross",
      "School staff are entitled to that space",
      "It is only an offence during school terms",
      "It blocks the school's own vehicles",
    ],
    correctIndex: 0,
    explanation:
      "Children are short and step out without looking. A car parked across the gate turns the one place drivers most need a clear view into a blind spot.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr3_park_meter_expired",
    categoryId: "parking",
    prompt: "Your paid parking time expires while you are away from the vehicle. The position is that:",
    options: [
      "You are parked without valid payment and may be fined — the bay is only yours while it is paid for",
      "The bay remains yours until someone else needs it",
      "A grace period always applies",
      "Payment only matters if an official is present",
    ],
    correctIndex: 0,
    explanation:
      "Paid bays are rented by time. Once it lapses the vehicle is simply parked without authority, whether or not anyone is watching.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr3_park_verge_services",
    categoryId: "parking",
    prompt: "Parking with two wheels up on a grass verge in a suburban street:",
    options: [
      "Can obstruct pedestrians and damage what is buried under it, and is not a right you have",
      "Is always acceptable if it keeps the road clear",
      "Is acceptable provided the verge is dry",
      "Is only a problem for heavy vehicles",
    ],
    correctIndex: 0,
    explanation:
      "The verge is the pedestrian's road, and pushing them into the traffic lane — especially someone with a pram or a wheelchair — is the cost of that convenience.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_park_abreast",
    categoryId: "parking",
    prompt: "Parking alongside another already-parked vehicle, leaving a narrow gap for traffic, is:",
    options: [
      "An obstruction — the roadway must stay usable by passing traffic",
      "Acceptable if you stay with the vehicle",
      "Acceptable during off-peak hours",
      "Acceptable if your hazard lights are on",
    ],
    correctIndex: 0,
    explanation:
      "Double parking narrows the road to a single lane and forces oncoming traffic into conflict. Staying in the car does not widen the road.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr3_park_angle_reverse_in",
    categoryId: "parking",
    prompt: "In an angled (echelon) bay, reversing in rather than nosing in is safer because:",
    options: [
      "You leave the bay forwards, with a clear view of passing traffic and pedestrians",
      "It is quicker to complete",
      "It puts less strain on the steering",
      "It is the only lawful way to use an angled bay",
    ],
    correctIndex: 0,
    explanation:
      "The difficult, sighted manoeuvre happens on arrival, when you can see. Nosing in means leaving blind, reversing into a lane you cannot properly see.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_park_ev_bay",
    categoryId: "parking",
    prompt: "A bay marked for electric-vehicle charging should be used:",
    options: [
      "Only by a vehicle that is actually charging there",
      "By any vehicle when the charger is out of order",
      "By any small vehicle at any time",
      "For short stops of any kind",
    ],
    correctIndex: 0,
    explanation:
      "Like any class-reserved bay, its purpose is the reservation. A car parked there without charging denies the bay to the only vehicles that cannot use an ordinary one.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Following distance ──────────────────────────────────────
  {
    id: "qr3_fd_being_overtaken",
    categoryId: "following_distance",
    prompt: "A vehicle begins overtaking you on a single-lane road. You should:",
    options: [
      "Hold or ease your speed and keep left, giving them room to complete the pass",
      "Accelerate to make the overtake shorter",
      "Move toward the centre line so they cannot cut back in early",
      "Brake hard so they can get past sooner",
    ],
    correctIndex: 0,
    explanation:
      "Speeding up while being overtaken strands the other driver in the oncoming lane. Easing off shortens the manoeuvre far more safely than accelerating ever could.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_fd_lateral_space",
    categoryId: "following_distance",
    prompt: "Keeping space to the SIDES of your vehicle matters because:",
    options: [
      "Your escape route in an emergency is sideways as often as it is forwards",
      "It reduces wind resistance",
      "It is required only for heavy vehicles",
      "It keeps your mirrors cleaner",
    ],
    correctIndex: 0,
    explanation:
      "Braking is not always enough. Drivers who avoid a collision usually steer into a space they already knew was there — which means not driving boxed in alongside others.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qr3_fd_convoy",
    categoryId: "following_distance",
    prompt: "Travelling as part of a group of vehicles on a long trip, the safe approach is to:",
    options: [
      "Keep normal following distances and let the group spread out",
      "Stay tightly bunched so nobody gets separated",
      "Match the lead vehicle's speed exactly regardless of the gap",
      "Drive two abreast so the group stays together",
    ],
    correctIndex: 0,
    explanation:
      "Bunching turns one driver's mistake into a multi-vehicle crash, and a tight convoy leaves overtaking traffic nowhere to pull in. Arrange to regroup at stops instead.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_fd_dazzle_gap",
    categoryId: "following_distance",
    prompt: "Dazzled by the headlights of an oncoming vehicle at night, you should:",
    options: [
      "Look to the left edge of the road, slow down, and keep your distance from anything ahead",
      "Look directly at the lights so your eyes adjust faster",
      "Switch your own lights to main beam in response",
      "Close one eye until they have passed",
    ],
    correctIndex: 0,
    explanation:
      "Looking away from the source preserves what night vision you have, and the left edge still gives you the road's line. Speed is the only other thing you control.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_fd_emergency_lane_gap",
    categoryId: "following_distance",
    prompt: "Traffic on a freeway slows to a crawl and an ambulance is approaching from behind. Drivers should:",
    options: [
      "Move as far to the sides as they safely can to open a path between the lanes",
      "All move into the emergency lane on the left",
      "Stop where they are and switch off",
      "Speed up to clear the area ahead",
    ],
    correctIndex: 0,
    explanation:
      "Opening a channel between lanes gives the ambulance a continuous path. Everyone crowding into the left lane blocks the very shoulder an emergency vehicle may need.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qr3_fd_tunnel_gap",
    categoryId: "following_distance",
    prompt: "Following another vehicle through a long tunnel, you should:",
    options: [
      "Keep your normal gap or more — there is no shoulder and no way around a stopped vehicle",
      "Close up so more vehicles fit through at once",
      "Switch off your headlights to avoid dazzle",
      "Overtake early to get clear of the tunnel",
    ],
    correctIndex: 0,
    explanation:
      "A tunnel removes every escape route at once: no shoulder, no verge, nowhere to swerve. The gap in front is the only space you have.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Hazard awareness ────────────────────────────────────────
  {
    id: "qr3_hz_reversing_lights",
    categoryId: "hazard_awareness",
    prompt: "The first sign that a parked car is about to pull out is usually:",
    options: [
      "Exhaust smoke, wheels turning slightly, or a head visible in the driver's seat",
      "Its hazard lights coming on",
      "The driver sounding the hooter",
      "Its brake lights going off",
    ],
    correctIndex: 0,
    explanation:
      "Drivers pull out before they indicate, if they indicate at all. The clues are all small and all earlier than the signal — which is why hazard perception is about looking, not waiting.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_hz_low_sun_others",
    categoryId: "hazard_awareness",
    prompt: "Driving with the low sun behind you, the extra risk is that:",
    options: [
      "Drivers coming toward you are dazzled and may not see you at all",
      "Your own brakes will fade in the heat",
      "Your headlights become less effective",
      "Your tyres lose grip in the glare",
    ],
    correctIndex: 0,
    explanation:
      "The dazzle you should worry about is the one you are not experiencing. Oncoming drivers are looking straight into it, so assume they have not seen you and give them room.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qr3_hz_wet_leaves_mud",
    categoryId: "hazard_awareness",
    prompt: "Mud or wet leaves tracked across a rural road by farm vehicles should be treated as:",
    options: [
      "A slippery surface — reduce speed before it and avoid braking or steering sharply on it",
      "A cosmetic problem only",
      "A hazard only for motorcycles",
      "Safe to drive over at normal speed if it looks thin",
    ],
    correctIndex: 0,
    explanation:
      "A thin film of mud behaves like ice, and it usually appears exactly where tractors turn — on bends and at gateways, where you are already asking a lot of the tyres.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_hz_queue_hazards",
    categoryId: "hazard_awareness",
    prompt: "Coming to a stop at the back of stationary traffic on a fast road, a useful precaution is to:",
    options: [
      "Switch on your hazard lights briefly to warn drivers still approaching",
      "Switch off your lights so you are not mistaken for a moving vehicle",
      "Sound your hooter to alert following traffic",
      "Get out and warn traffic on foot",
    ],
    correctIndex: 0,
    explanation:
      "This is one of the few moving-traffic uses of hazard lights: you have become a stationary hazard on a road where others are still travelling fast.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_hz_animals_night",
    categoryId: "hazard_awareness",
    prompt: "Your headlights pick up an animal's eyes at the roadside at night. You should:",
    options: [
      "Slow down and be ready for it to move unpredictably, including into your path",
      "Sound your hooter and maintain speed",
      "Switch to main beam and accelerate past",
      "Swerve immediately to the other side of the road",
    ],
    correctIndex: 0,
    explanation:
      "Animals bolt in whichever direction they happen to face, and often toward the light. Speed is the only variable you control, and swerving blind on a rural road risks far worse.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr3_hz_load_shifting",
    categoryId: "hazard_awareness",
    prompt: "The vehicle ahead is visibly leaning or swaying as it corners. The safest assumption is:",
    options: [
      "Its load may be badly secured or shifting — drop back and do not sit alongside it",
      "The driver is inexperienced but the vehicle is fine",
      "It has a slow puncture that will fix itself",
      "It is normal for any loaded vehicle",
    ],
    correctIndex: 0,
    explanation:
      "A swaying load can come off or roll the vehicle. Neither is survivable from directly behind or alongside, and both are entirely avoidable by giving it room.",
    difficulty: 2,
    scope: "learners",
  },
];
