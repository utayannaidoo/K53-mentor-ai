import type { Question } from "@/types";

/**
 * Rules-section pack — lane discipline, overtaking limits, sharing the road,
 * and the vehicle-condition rules a driver is answerable for.
 * Facts trace to docs/content/facts/rules.md and hazard-parking-following.md.
 *
 * Rules is the binding section for code 08, so depth here is what raises its
 * mock ceiling. Spread across the five categories that feed the section.
 *
 * Principles and procedure only — no item turns on a regulated numeric
 * threshold, per the standing rule that a regulated number needs the
 * regulation open beside it.
 */
export const RULES_LANE_QUESTIONS: Question[] = [
  // ── Lane discipline and overtaking ──────────────────────────
  {
    id: "qr5_keep_left_pass_right",
    categoryId: "rules",
    prompt: "On a multi-lane road in South Africa, the general principle is:",
    options: [
      "Keep left and pass right — the right-hand lane is for overtaking, not for cruising",
      "Choose whichever lane is emptiest and stay in it",
      "Keep right so slower traffic can use the left",
      "Lane choice is entirely a matter of preference",
    ],
    correctIndex: 0,
    explanation:
      "Sitting in the right-hand lane forces others to undertake on the left, which is where drivers are not looking. Returning left after passing is what keeps the system working.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr5_overtake_prohibited_where",
    categoryId: "rules",
    prompt: "Even with no sign or barrier line, overtaking is prohibited or unsafe:",
    options: [
      "Approaching a rise, a bend, an intersection or a pedestrian crossing — anywhere your view is not certain",
      "Only where a solid line is painted",
      "Only in urban areas",
      "Only when a vehicle is towing",
    ],
    correctIndex: 0,
    explanation:
      "Markings cannot cover every hazard, so the underlying duty is to see the road you are committing to. If you cannot see far enough to complete the pass and return, you may not start it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_overtake_return_gap",
    categoryId: "rules",
    prompt: "Having overtaken a vehicle, you should return to the left:",
    options: [
      "Once you can see the whole vehicle you passed in your interior mirror",
      "As soon as your rear bumper clears its front bumper",
      "Only after passing two more vehicles",
      "Whenever the driver behind flashes you in",
    ],
    correctIndex: 0,
    explanation:
      "Seeing the whole car in the mirror is the reliable test that there is room. Cutting back early is what forces the overtaken driver to brake — and it is how many overtakes end badly.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_being_overtaken_duty",
    categoryId: "rules",
    prompt: "While another vehicle is overtaking you, your duty is to:",
    options: [
      "Keep as far left as is safe and not increase your speed",
      "Speed up so the manoeuvre takes less road",
      "Move toward the centre line to discourage them",
      "Brake sharply to open a gap",
    ],
    correctIndex: 0,
    explanation:
      "Accelerating strands the other driver in the oncoming lane, which is the single most dangerous thing you can do to them. Holding or easing your speed is what shortens the pass.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr5_zip_merge",
    categoryId: "rules",
    prompt: "Where two lanes reduce to one, traffic merges most safely when drivers:",
    options: [
      "Take turns, one from each lane, at the point where the lanes actually join",
      "All move into the continuing lane as early as possible",
      "Race to the front of the closing lane",
      "Refuse to let anyone in from the closing lane",
    ],
    correctIndex: 0,
    explanation:
      "Merging in turn at the pinch point uses both lanes for their full length and keeps the queue shorter. Everyone shuffling across early wastes half the road and creates its own conflict.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_undertake_left",
    categoryId: "rules",
    prompt: "Passing a vehicle on its left is generally:",
    options: [
      "Only lawful in specific situations, such as when it is signalling and moving to turn right, or in slow-moving lanes of traffic",
      "Always permitted on a multi-lane road",
      "Always prohibited without exception",
      "Permitted whenever the left lane is moving faster",
    ],
    correctIndex: 0,
    explanation:
      "Drivers check their right mirror before moving right and expect to be passed there. Coming up the left is arriving where they are not looking, which is why it is confined to narrow exceptions.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qr5_slow_lane_freeway",
    categoryId: "rules",
    prompt: "A vehicle unable to maintain a reasonable freeway speed should:",
    options: [
      "Keep to the left-hand lane and let faster traffic pass",
      "Use the right-hand lane to stay out of merging traffic",
      "Travel in the middle lane at all times",
      "Use the shoulder to keep the lanes clear",
    ],
    correctIndex: 0,
    explanation:
      "Freeway lanes are ordered by speed, so a slow vehicle in a fast lane forces everyone around it. The shoulder is never an answer — it is for emergencies only.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr5_lane_change_signal_check",
    categoryId: "rules",
    prompt: "The correct order for changing lanes is:",
    options: [
      "Mirrors, signal, blind-spot check, then move if it is clear",
      "Signal, move, then check the mirrors",
      "Blind-spot check, move, then signal",
      "Move first and signal only if another vehicle appears",
    ],
    correctIndex: 0,
    explanation:
      "Mirrors build the picture, the signal warns others, and the shoulder check catches what the mirrors cannot. The move comes last because it depends on all three.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Sharing the road ────────────────────────────────────────
  {
    id: "qr5_bus_pulling_off",
    categoryId: "rules",
    prompt: "A bus is signalling to pull away from a marked bus stop. The courteous and safe response is to:",
    options: [
      "Give way where you safely can — a bus needs a long gap and blocks a lane while it waits",
      "Accelerate past before it moves",
      "Sound your hooter to tell it to wait",
      "Stop and wave it out regardless of the traffic behind you",
    ],
    correctIndex: 0,
    explanation:
      "A stationary bus half in the lane is a hazard to everyone. Letting it out costs you seconds — though never at the price of stopping abruptly for the driver behind you.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_abnormal_load_escort",
    categoryId: "rules",
    prompt: "You meet an abnormal load with escort vehicles displaying flashing lights. You should:",
    options: [
      "Follow the escort's directions, slow down, and be prepared to pull over or stop",
      "Overtake quickly before the road narrows",
      "Ignore the escorts, since they are not traffic officers",
      "Maintain speed and pass on the left",
    ],
    correctIndex: 0,
    explanation:
      "Abnormal loads take up more than their lane and cannot manoeuvre. The escorts are there because the load's driver cannot see or avoid you — they are managing the road on its behalf.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_scholar_transport",
    categoryId: "rules",
    prompt: "Approaching a stopped vehicle that is dropping off schoolchildren, you should:",
    options: [
      "Slow right down and expect children to cross in front of or behind it without looking",
      "Maintain speed if the children are on the pavement",
      "Sound your hooter as a warning and continue",
      "Overtake on the left to give it room",
    ],
    correctIndex: 0,
    explanation:
      "Children head straight for whoever is waiting for them, and a stopped vehicle hides them completely. This is one of the most predictable pedestrian conflicts on any road.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr5_horse_rider",
    categoryId: "rules",
    prompt: "Passing a horse and rider on a rural road, you should:",
    options: [
      "Slow right down, pass wide, and avoid sudden noise — a startled horse can move into your path instantly",
      "Pass normally, since the rider is in control",
      "Sound your hooter first so the rider knows you are there",
      "Pass close and quickly to minimise the time alongside",
    ],
    correctIndex: 0,
    explanation:
      "A horse reacts to noise and movement regardless of what the rider wants. Space and quiet are the only things that make the pass predictable.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_road_workers",
    categoryId: "rules",
    prompt: "At roadworks, a flag person turns their board from GO to STOP as you approach. You must:",
    options: [
      "Stop — the board is a lawful instruction, the same as a road sign",
      "Continue if the road ahead looks clear",
      "Slow down but keep moving through",
      "Stop only if machinery is crossing",
    ],
    correctIndex: 0,
    explanation:
      "The flag person is holding a single lane for alternating traffic. Driving past a STOP board sends you into oncoming vehicles that have been released.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr5_disabled_pedestrian",
    categoryId: "rules",
    prompt: "A pedestrian with a white cane or guide dog is waiting to cross ahead of you. You should:",
    options: [
      "Give way and wait — they may not be able to judge your approach, and hooting does not help",
      "Sound your hooter so they know you are there",
      "Continue if you have right of way",
      "Flash your lights to invite them across",
    ],
    correctIndex: 0,
    explanation:
      "A white cane signals limited or no sight, so visual invitations like a flash or a wave are useless. Stopping and waiting quietly is the one signal that works.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Vehicle condition and load ──────────────────────────────
  {
    id: "qr5_driver_responsible_condition",
    categoryId: "rules",
    prompt: "Responsibility for a vehicle being in a safe, roadworthy condition when it is driven rests with:",
    options: [
      "The driver, alongside the owner — you cannot rely on someone else having checked it",
      "The owner only, if that is a different person",
      "The last workshop that serviced it",
      "The testing station that issued the certificate",
    ],
    correctIndex: 0,
    explanation:
      "You are the one operating it on the road, so the defect is yours at that moment. 'It is not my car' is not a defence for driving with failed brakes or no lights.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_obscured_view_load",
    categoryId: "rules",
    prompt: "A load, passengers or stickers that obstruct the driver's view:",
    options: [
      "Are prohibited — you must have a clear view of the road in all necessary directions",
      "Are acceptable if you drive more slowly",
      "Are only a problem for goods vehicles",
      "Are acceptable provided the mirrors are clear",
    ],
    correctIndex: 0,
    explanation:
      "The requirement is a clear view, not a partial one. Rear-window obstruction is the common version and it removes exactly the view you need before reversing or changing lanes.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_load_secure_duty",
    categoryId: "rules",
    prompt: "The duty to make sure a load cannot fall from a vehicle rests with:",
    options: [
      "The driver — anything that comes off is treated as their responsibility",
      "Whoever loaded the vehicle",
      "The consignee expecting the goods",
      "Nobody, if the load was secured when it left",
    ],
    correctIndex: 0,
    explanation:
      "The driver is the last person able to check before it moves. A load shedding onto a freeway is both an offence and a hazard arriving at other windscreens at closing speed.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_trailer_lights",
    categoryId: "rules",
    prompt: "A trailer or caravan being towed must:",
    options: [
      "Carry working lights and indicators that repeat the towing vehicle's signals",
      "Carry lights only if towed after dark",
      "Rely on the towing vehicle's lights being visible around it",
      "Display a warning triangle instead of lights",
    ],
    correctIndex: 0,
    explanation:
      "The trailer hides the car's own lights from everyone behind. Without repeaters, a following driver gets no warning that the combination is braking or turning.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_tinted_windows",
    categoryId: "rules",
    prompt: "Window tinting on a vehicle is regulated because:",
    options: [
      "Excessive tint reduces the driver's own visibility, especially at night, and hides the occupants",
      "It damages the glass over time",
      "It interferes with the radio",
      "It is purely a matter of appearance",
    ],
    correctIndex: 0,
    explanation:
      "Tint that looks fine by day can make a dark rural road nearly opaque. The limits exist because the driver's night vision is the thing being traded away.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_noise_exhaust",
    categoryId: "rules",
    prompt: "A vehicle with a modified exhaust that is excessively noisy:",
    options: [
      "Is not roadworthy — noise limits are part of the vehicle's condition, not a matter of taste",
      "Is acceptable provided it passes an emissions test",
      "Is only an issue in residential areas",
      "Is acceptable if the vehicle is not used at night",
    ],
    correctIndex: 0,
    explanation:
      "It is treated as a defect like any other. Excessive noise also masks the sounds a driver relies on — sirens, hooters, and the vehicle's own warning noises.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_litter_from_vehicle",
    categoryId: "rules",
    prompt: "Throwing litter, a cigarette or any object from a moving vehicle is:",
    options: [
      "An offence, and a hazard — objects can strike following vehicles or start a veld fire",
      "Acceptable if the item is biodegradable",
      "Only an offence in a national park",
      "Acceptable outside urban areas",
    ],
    correctIndex: 0,
    explanation:
      "A discarded cigarette in dry grass is a standard cause of roadside fires, and anything thrown from a car arrives at the vehicle behind at combined speed.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Intersections ───────────────────────────────────────────
  {
    id: "qr5_t_junction_priority",
    categoryId: "intersections",
    prompt: "Arriving at a T-junction where your road ends, you must:",
    options: [
      "Give way to traffic on the road you are joining, in both directions",
      "Proceed if you arrived first",
      "Give way only to traffic from your right",
      "Expect the through traffic to give way to you",
    ],
    correctIndex: 0,
    explanation:
      "Your road ends; theirs continues. That is what decides it, regardless of who arrived first or how busy the through road is.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr5_filter_lane_yield",
    categoryId: "intersections",
    prompt: "A dedicated left-turn filter lane separated by an island means you:",
    options: [
      "Still give way to traffic and pedestrians on the road you are joining, unless a signal releases you",
      "Have automatic right of way into the new road",
      "Need not check for pedestrians",
      "May proceed without slowing",
    ],
    correctIndex: 0,
    explanation:
      "The island separates you from the intersection; it does not grant priority. Filter lanes are exactly where drivers roll out without looking because the geometry feels like a slip road.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qr5_officer_signal_stop",
    categoryId: "intersections",
    prompt: "A traffic officer directing traffic holds up a hand with the palm toward you. This means:",
    options: [
      "Stop — and remain stopped until they signal you forward",
      "Slow down but proceed",
      "Turn in the direction they are facing",
      "Proceed with caution",
    ],
    correctIndex: 0,
    explanation:
      "Officer signals outrank the lights and the signs, because they are managing something the fixed signalling cannot see. Their instruction is the one that counts.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr5_pedestrian_signal_flashing",
    categoryId: "intersections",
    prompt: "A pedestrian signal begins flashing while someone is already crossing. As a driver, you must:",
    options: [
      "Wait for them to finish crossing before moving off",
      "Proceed, since their time has expired",
      "Move off slowly to encourage them along",
      "Sound your hooter",
    ],
    correctIndex: 0,
    explanation:
      "The flashing phase is there so people already in the road can finish. Someone halfway across cannot go back, and older or slower pedestrians need all of it.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr5_yield_to_right_circle",
    categoryId: "intersections",
    prompt: "At a mini-circle where vehicles arrive at the same time from different arms, priority goes to:",
    options: [
      "The vehicle on the right, once anything already in the circle has cleared",
      "The largest vehicle",
      "Whoever enters the circle fastest",
      "The vehicle going straight ahead",
    ],
    correctIndex: 0,
    explanation:
      "Traffic already circulating clears first, and simultaneous arrivals resolve by the right-hand rule. Mini-circles work on courtesy as much as on rules, so arrive slowly.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_railway_multiple_tracks",
    categoryId: "intersections",
    prompt: "At a level crossing with more than one track, the danger after a train passes is that:",
    options: [
      "A second train may be approaching on another track, hidden by the first",
      "The rails will be slippery",
      "The boom may close again immediately",
      "The crossing surface becomes uneven",
    ],
    correctIndex: 0,
    explanation:
      "The passing train both hides and drowns out the second one. Wait until the signals stop and you can see clearly along every track before crossing.",
    difficulty: 3,
    scope: "learners",
  },

  // ── Parking ─────────────────────────────────────────────────
  {
    id: "qr5_park_corner_visibility",
    categoryId: "parking",
    prompt: "Parking close to a street corner is restricted mainly because:",
    options: [
      "It hides emerging traffic and pedestrians from each other at the exact point they meet",
      "Corners have weaker road surfaces",
      "It makes street cleaning difficult",
      "It is only restricted in commercial areas",
    ],
    correctIndex: 0,
    explanation:
      "A vehicle parked at the corner forces drivers to nose right out into the junction to see. It converts an ordinary turn into a blind one for everybody.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_park_driveway_own",
    categoryId: "parking",
    prompt: "Parking across a driveway is an obstruction:",
    options: [
      "Even if it is your own — the vehicle still blocks the pavement and the crossing point",
      "Only if it belongs to someone else",
      "Only during business hours",
      "Only if a vehicle is trapped inside",
    ],
    correctIndex: 0,
    explanation:
      "The pavement across a driveway is still the pedestrian's route. Blocking it pushes someone with a pram or wheelchair into the road, whoever owns the gate.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_park_leaving_kerb",
    categoryId: "parking",
    prompt: "Pulling out of a parallel parking space into traffic, the correct sequence is:",
    options: [
      "Mirrors, signal, full observation including the blind spot, then move only when there is a safe gap",
      "Signal and pull out — following traffic must give way",
      "Move out quickly to claim the gap",
      "Reverse slightly, then pull out without signalling",
    ],
    correctIndex: 0,
    explanation:
      "You are joining moving traffic from a standstill, so the gap has to be genuine. The signal announces intent; the observation is what decides whether you go.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_park_wheels_kerb_touch",
    categoryId: "parking",
    prompt: "Finishing a parallel park, your wheels should be:",
    options: [
      "Close and parallel to the kerb, without mounting it",
      "Touching the kerb firmly so the car cannot roll",
      "Turned sharply toward the road",
      "Wherever they end up, provided the car is off the lane",
    ],
    correctIndex: 0,
    explanation:
      "Parallel and close keeps the car out of the traffic lane without damaging tyres or blocking the pavement. Mounting the kerb is both a fail item and hard on the sidewalls.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Following distance and hazard awareness ─────────────────
  {
    id: "qr5_fd_spray_from_trucks",
    categoryId: "following_distance",
    prompt: "Following a large vehicle in heavy rain, the extra problem beyond stopping distance is:",
    options: [
      "Its spray can blind you completely for several seconds",
      "Its brake lights are mounted too high to see",
      "Its tyres throw water that improves your grip",
      "It blocks the radio signal",
    ],
    correctIndex: 0,
    explanation:
      "The wall of spray arrives faster than the wipers clear it. Dropping well back gets you out of it, which restores the view you need to react to anything at all.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_fd_merging_gap_courtesy",
    categoryId: "following_distance",
    prompt: "A vehicle needs to merge into your lane from a slip road. Leaving a gap for it:",
    options: [
      "Keeps traffic flowing and costs you almost nothing — refusing forces them to stop or cut in",
      "Gives up your right of way and should be avoided",
      "Is only necessary for heavy vehicles",
      "Encourages dangerous driving",
    ],
    correctIndex: 0,
    explanation:
      "Merging traffic has to go somewhere. A driver forced to stop at the end of a slip road then rejoins from a standstill, which is far more dangerous than the gap you gave up.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_hz_gps_distraction",
    categoryId: "hazard_awareness",
    prompt: "Setting a destination on a navigation device is safest:",
    options: [
      "Before you move off — programming it while driving is as distracting as texting",
      "While waiting at a red light",
      "While driving slowly in traffic",
      "At any time, since it is a driving aid",
    ],
    correctIndex: 0,
    explanation:
      "It takes eyes, hands and attention together, which is the same combination that makes texting dangerous. Being a driving aid does not change what using it costs.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_hz_eating_driving",
    categoryId: "hazard_awareness",
    prompt: "Eating, drinking or reaching for something while driving matters because:",
    options: [
      "It can leave you without proper control, which is an offence regardless of whether anything is spilled",
      "It is specifically banned by name in the regulations",
      "It only matters in a manual vehicle",
      "It is only a problem on freeways",
    ],
    correctIndex: 0,
    explanation:
      "There is no separate offence for a sandwich — the duty to remain in full control covers it. A hot drink spilled at the wrong moment is how that duty gets tested.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_hz_passenger_distraction",
    categoryId: "hazard_awareness",
    prompt: "Passengers who are noisy or demanding your attention are a hazard because:",
    options: [
      "The driver remains responsible for the vehicle — if you cannot concentrate, stop and settle it",
      "They add weight to the vehicle",
      "They obstruct the mirrors",
      "They are only a problem for new drivers",
    ],
    correctIndex: 0,
    explanation:
      "Nobody in the car shares the driver's legal responsibility. Pulling over to deal with it takes a minute and is the only response that actually restores your attention.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr5_hz_roadworks_speed",
    categoryId: "hazard_awareness",
    prompt: "Temporary speed limits through roadworks apply:",
    options: [
      "Whenever the signs are displayed, whether or not workers are present",
      "Only when workers are visibly on site",
      "Only during daylight hours",
      "Only to heavy vehicles",
    ],
    correctIndex: 0,
    explanation:
      "The limit is protecting you from the road as much as the workers from you — loose surfaces, missing markings, open trenches and narrowed lanes are all still there at night.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr5_hz_crash_scene_pass",
    categoryId: "hazard_awareness",
    prompt: "Passing the scene of a crash on the opposite carriageway, the main risk to you is:",
    options: [
      "Slowing to look, which causes collisions in your own direction",
      "Debris crossing the median",
      "Emergency vehicles turning across you",
      "Losing radio reception",
    ],
    correctIndex: 0,
    explanation:
      "Rubbernecking causes a second crash behind the first with grim regularity. Keep your eyes on your own lane and your speed steady unless you are actually stopping to help.",
    difficulty: 2,
    scope: "learners",
  },
];
