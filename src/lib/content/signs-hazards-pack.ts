import type { Question } from "@/types";

/**
 * Signs — specific hazards, dimension limits, command signs and service
 * information. Facts trace to docs/content/facts/signs.md.
 *
 * Written to lift the signs pool, which became the binding constraint on
 * distinct mock papers once the generated pack was cut back on quality grounds.
 * The catalogue is exhausted at the quality bar we set, so further depth has to
 * be hand-authored.
 *
 * Deliberately avoids re-treading what the existing packs already cover well
 * (road markings, road studs, temporary/yellow signs, sign shape-and-colour
 * taxonomy) and avoids items turning on a regulated numeric threshold, which
 * belong with the rules pack against a cited regulation.
 *
 * Signs are described in words rather than shown, in the style of the existing
 * text-based sign questions — the point is whether the learner knows what the
 * sign instructs, not whether they can read a thumbnail.
 */
export const SIGNS_HAZARDS_QUESTIONS: Question[] = [
  // ── Warning signs — road geometry ───────────────────────────
  {
    id: "qs2_curve_single",
    categoryId: "signs",
    prompt: "A triangular warning sign shows a single arrow bending sharply to the left. It warns that:",
    options: [
      "A sharp curve to the left is ahead — slow down before you reach it",
      "You must turn left at the next junction",
      "Left turns are prohibited beyond this point",
      "The left lane is closed ahead",
    ],
    correctIndex: 0,
    explanation:
      "Triangular red-bordered signs warn; they never command. This one says a sharp left curve is coming, and the braking must be done before you enter it, not in it.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qs2_curve_series",
    categoryId: "signs",
    prompt: "A warning sign showing a winding, snake-like line tells you that ahead there is:",
    options: [
      "A series of curves, one after the other",
      "A single sharp bend followed by a straight",
      "A slippery section of road",
      "A road that narrows gradually",
    ],
    correctIndex: 0,
    explanation:
      "The winding symbol means successive bends, so the speed you choose has to last through all of them — there is no straight to recover in between.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_hairpin",
    categoryId: "signs",
    prompt: "A warning sign showing the road doubling back sharply on itself indicates:",
    options: [
      "A hairpin bend, needing a much lower speed than an ordinary curve",
      "A U-turn facility ahead",
      "A turning circle for heavy vehicles",
      "A road that loops back to where you started",
    ],
    correctIndex: 0,
    explanation:
      "A hairpin turns through nearly 180 degrees. Long vehicles may need most of the road to get round, so approach slowly and expect oncoming traffic to be wide.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_dip",
    categoryId: "signs",
    prompt: "A warning sign showing a dip in the road surface warns you that:",
    options: [
      "There is a sudden hollow ahead that can ground a low vehicle or hide oncoming traffic",
      "The road ahead has been resurfaced",
      "A drainage channel crosses the road at right angles",
      "The road surface changes from tar to gravel",
    ],
    correctIndex: 0,
    explanation:
      "A dip both bottoms out a vehicle and hides what is on the far side. Slow down, and don't commit to overtaking across one.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_uneven",
    categoryId: "signs",
    prompt: "A warning sign showing an uneven or bumpy road surface means you should:",
    options: [
      "Reduce speed — the surface ahead is rough enough to affect your control",
      "Expect roadworks with a flag person",
      "Change to a lower gear to protect the gearbox",
      "Move into the right-hand lane",
    ],
    correctIndex: 0,
    explanation:
      "A rough surface upsets steering and braking, and at speed it can throw a light vehicle or a motorcycle off line. The sign asks for less speed, not a lane change.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qs2_two_way_resumes",
    categoryId: "signs",
    prompt: "A warning sign showing two arrows pointing in opposite directions tells you that:",
    options: [
      "Two-way traffic resumes ahead — you can no longer treat the whole road as yours",
      "You may overtake in either direction",
      "A dual carriageway begins ahead",
      "The road ahead splits into two separate roads",
    ],
    correctIndex: 0,
    explanation:
      "It marks the end of a one-way or divided section. It is one of the easiest signs to miss and one of the most dangerous to, because oncoming traffic returns without warning.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Warning signs — surface and weather ─────────────────────
  {
    id: "qs2_slippery",
    categoryId: "signs",
    prompt: "A warning sign showing a car with curved skid marks behind it means:",
    options: [
      "The road ahead is slippery — reduce speed and avoid sudden steering or braking",
      "Skidding is common because the road is always wet",
      "The road ahead is used for driver training",
      "Anti-lock brakes are required beyond this point",
    ],
    correctIndex: 0,
    explanation:
      "Slippery-road signs go up where the surface loses grip — polished tar, frequent spillage, or a bend that catches water. Everything you do there should be gradual.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qs2_falling_rocks",
    categoryId: "signs",
    prompt: "A warning sign showing rocks tumbling down a slope tells you to expect:",
    options: [
      "Loose rock on the road, and to watch the cutting above as well as the surface",
      "A quarry entrance with slow-moving trucks",
      "Roadworks involving blasting",
      "A gravel road surface ahead",
    ],
    correctIndex: 0,
    explanation:
      "Rock can already be lying in the lane or can come down as you pass. Keep away from the cutting side where the road allows, and don't stop under an unstable slope.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_side_wind",
    categoryId: "signs",
    prompt: "A warning sign showing a windsock warns of:",
    options: [
      "Strong crosswinds that can push your vehicle out of its lane",
      "An airfield where low-flying aircraft cross the road",
      "A weather station beside the road",
      "Dust that reduces visibility",
    ],
    correctIndex: 0,
    explanation:
      "Crosswind sections are usually bridges, passes and open cuttings. Hold the wheel firmly, ease off, and expect a shove as you leave the shelter of a truck or an embankment.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_causeway",
    categoryId: "signs",
    prompt: "A sign warning that the road ahead crosses a low-water bridge or causeway means you should:",
    options: [
      "Be prepared to find water flowing over the road, and not enter if you cannot judge its depth",
      "Expect a toll booth at the bridge",
      "Reduce speed only when it is raining",
      "Cross quickly to avoid being caught by rising water",
    ],
    correctIndex: 0,
    explanation:
      "Low-water crossings flood fast and moving water floats a car in surprisingly little depth. If you cannot see the surface, you cannot know it is still there — wait or turn around.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qs2_loose_stones",
    categoryId: "signs",
    prompt: "A warning sign showing stones flying up from a vehicle's wheels means:",
    options: [
      "Loose stones or chippings ahead — drop your speed and your following distance",
      "The road ahead is closed to vehicles without mudflaps",
      "A gravel road begins permanently",
      "Stone-throwing has been reported in the area",
    ],
    correctIndex: 0,
    explanation:
      "Loose chippings are usually fresh surfacing. Speed flings them into windscreens — including yours — and grip is poorer than it looks, so leave a bigger gap.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Warning signs — other road users ────────────────────────
  {
    id: "qs2_farm_animals",
    categoryId: "signs",
    prompt: "A warning sign showing a cow silhouette means:",
    options: [
      "Farm animals may be on or crossing the road, often unfenced and unherded",
      "A cattle market operates beside the road",
      "The road runs through a game reserve",
      "Livestock trucks turn frequently at this point",
    ],
    correctIndex: 0,
    explanation:
      "Livestock wander onto rural roads and don't behave predictably. A herd may follow the one already across, so never accelerate through a gap in it.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qs2_cyclists_ahead",
    categoryId: "signs",
    prompt: "A warning sign showing a bicycle tells you that:",
    options: [
      "Cyclists are likely to be on or crossing the road ahead",
      "A cycle path replaces the road ahead",
      "Bicycles are prohibited beyond this point",
      "A cycle race is in progress",
    ],
    correctIndex: 0,
    explanation:
      "A warning sign reports what to expect; a prohibition would carry a red ring and a diagonal bar. Expect cyclists, give them room, and check for them before turning across their path.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qs2_signals_ahead",
    categoryId: "signs",
    prompt: "A warning sign showing a traffic-light symbol means:",
    options: [
      "Traffic signals are ahead, possibly hidden by a bend or a crest",
      "The signals ahead are out of order",
      "The signals ahead are controlled by a traffic officer",
      "You may proceed without stopping if the way is clear",
    ],
    correctIndex: 0,
    explanation:
      "These go up where the robot cannot be seen from far enough away. Slow down and be ready to stop — you may come over a rise to find a red and a queue.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_yield_ahead",
    categoryId: "signs",
    prompt: "A warning sign showing a downward-pointing triangle means:",
    options: [
      "A yield sign is ahead — be ready to give way when you reach it",
      "You must yield immediately at the sign itself",
      "The road ahead narrows to a single lane",
      "Yielding is no longer required beyond this point",
    ],
    correctIndex: 0,
    explanation:
      "It gives advance notice, not the instruction itself. The obligation to give way starts at the yield sign or line further on, but the reading of the junction starts here.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_tunnel",
    categoryId: "signs",
    prompt: "Approaching a sign warning of a tunnel ahead, you should:",
    options: [
      "Switch your headlights on and not overtake inside the tunnel",
      "Switch to parking lights only to avoid dazzling others",
      "Sound your hooter before entering",
      "Increase speed to clear the tunnel quickly",
    ],
    correctIndex: 0,
    explanation:
      "Your eyes take time to adjust going in and coming out, and a tunnel gives you nowhere to go. Lights on so you are seen, and no overtaking.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Regulatory — dimension and mass limits ──────────────────
  {
    id: "qs2_height_limit",
    categoryId: "signs",
    prompt: "A round sign with a red border showing a height in metres between two arrows means:",
    options: [
      "Vehicles higher than that measurement may not proceed past the sign",
      "The road surface is that far below the bridge deck",
      "Loads must be secured below that height",
      "That is the recommended height for safe clearance",
    ],
    correctIndex: 0,
    explanation:
      "It is a prohibition, not advice: a red ring always is. The driver, not the loader, is responsible for knowing the laden height of the vehicle.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_width_limit",
    categoryId: "signs",
    prompt: "A red-bordered round sign showing a width in metres between two arrows prohibits:",
    options: [
      "Vehicles wider than that measurement, including their load",
      "Vehicles carrying abnormal loads of any size",
      "Two vehicles passing each other at that point",
      "Trailers of any width",
    ],
    correctIndex: 0,
    explanation:
      "The limit is the widest point of the vehicle *and* whatever it is carrying — a load that overhangs the body counts.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_length_limit",
    categoryId: "signs",
    prompt: "A red-bordered round sign showing a length in metres applies to:",
    options: [
      "The total length of the vehicle, including any trailer being towed",
      "The tractor unit only, excluding the trailer",
      "The load bed only",
      "Only vehicles carrying goods for reward",
    ],
    correctIndex: 0,
    explanation:
      "A combination is measured end to end. Drivers towing caravans or trailers most often get caught out here, because they think of the limit as applying to the car.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qs2_mass_limit",
    categoryId: "signs",
    prompt: "A red-bordered round sign showing a mass in tonnes means:",
    options: [
      "Vehicles exceeding that mass may not proceed — usually because a structure cannot carry them",
      "Loads above that mass must be declared at a weighbridge",
      "That is the maximum mass the road surface prefers",
      "Only abnormal-load permits above that mass are affected",
    ],
    correctIndex: 0,
    explanation:
      "Mass restrictions protect bridges and weak surfaces. Exceeding one risks a collapse, so it is enforced against the driver regardless of who loaded the vehicle.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Regulatory — command and prohibition ────────────────────
  {
    id: "qs2_minimum_speed",
    categoryId: "signs",
    prompt: "A blue circular sign showing a speed figure means:",
    options: [
      "That is the minimum speed you must maintain unless conditions make it unsafe",
      "That is the maximum speed allowed",
      "That is the speed recommended for heavy vehicles",
      "Speed is measured by camera beyond this point",
    ],
    correctIndex: 0,
    explanation:
      "Blue circles command; red rings prohibit. A minimum speed keeps slow vehicles off roads where they would be a hazard — but safety still overrides it in fog, rain or traffic.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_keep_left",
    categoryId: "signs",
    prompt: "A blue circular sign with a white arrow pointing down and to the left, placed at an obstruction, instructs you to:",
    options: [
      "Pass to the left of the obstruction",
      "Turn left at the next opportunity",
      "Merge into the left lane and stay there",
      "Give way to vehicles coming from the left",
    ],
    correctIndex: 0,
    explanation:
      "It tells you which side of a physical obstruction — an island, a works barrier — to pass. It is about this object in front of you, not about the road beyond it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_no_towing",
    categoryId: "signs",
    prompt: "A round sign with a red border showing a vehicle towing a trailer, crossed by a diagonal line, means:",
    options: [
      "Vehicles drawing a trailer may not proceed past this sign",
      "Towing is permitted only at low speed",
      "Broken-down vehicles may not be towed away from here",
      "Trailers must be parked before this point",
    ],
    correctIndex: 0,
    explanation:
      "Red ring plus diagonal is always a prohibition. These appear where a gradient, a bend or a narrow section makes a towed combination unsafe.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_no_pedestrians_sign",
    categoryId: "signs",
    prompt: "A red-bordered round sign showing a walking figure crossed by a diagonal line means:",
    options: [
      "Pedestrians may not proceed beyond this point",
      "Pedestrians have priority beyond this point",
      "A pedestrian crossing is ahead",
      "Drivers must give way to pedestrians here",
    ],
    correctIndex: 0,
    explanation:
      "It bars pedestrians, typically from a freeway or a tunnel. A pedestrian *crossing* would be a warning triangle or a blue information sign, never a red prohibition ring.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qs2_dangerous_goods_prohibited",
    categoryId: "signs",
    prompt: "A red-bordered round sign showing a tanker crossed by a diagonal line prohibits:",
    options: [
      "Vehicles carrying dangerous goods from using that road",
      "All heavy vehicles from using that road",
      "Refuelling beyond that point",
      "Tankers from stopping on that road",
    ],
    correctIndex: 0,
    explanation:
      "These keep hazardous loads out of tunnels, dense areas and water-catchment routes, where a spill or fire would be far worse than the detour.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qs2_compulsory_ahead",
    categoryId: "signs",
    prompt: "A blue circular sign with a white arrow pointing straight up means:",
    options: [
      "You must proceed straight ahead — turning is not permitted here",
      "There is a one-way road ahead",
      "Straight ahead is the recommended route",
      "The road ahead has priority over side roads",
    ],
    correctIndex: 0,
    explanation:
      "A blue circle is a command you must obey. Here it removes the option of turning, usually to protect a junction that cannot absorb turning traffic.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Information and guidance ────────────────────────────────
  {
    id: "qs2_no_through_road",
    categoryId: "signs",
    prompt: "A sign showing a road with a red bar across its far end tells you that:",
    options: [
      "The road has no through route — you will have to come back the same way",
      "The road is closed to all traffic",
      "The road ahead is a private road",
      "There is a barrier or boom across the road",
    ],
    correctIndex: 0,
    explanation:
      "It marks a cul-de-sac. Useful to spot early, because turning a car — let alone a vehicle with a trailer — at the closed end is often the hard part.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qs2_hospital_sign",
    categoryId: "signs",
    prompt: "A blue information sign showing an 'H' indicates:",
    options: [
      "A hospital, where you should expect ambulances and reduce noise",
      "A helipad for air ambulances only",
      "A hazardous-goods depot",
      "A heavy-vehicle inspection point",
    ],
    correctIndex: 0,
    explanation:
      "Blue rectangles inform. Around a hospital, expect emergency vehicles arriving from unexpected directions and pedestrians who are distracted or distressed.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qs2_rest_area",
    categoryId: "signs",
    prompt: "An information sign marking a rest area or picnic site is most useful to a driver who:",
    options: [
      "Is feeling drowsy and needs somewhere safe to stop and rest",
      "Needs to make a phone call while driving",
      "Wants to avoid paying a toll",
      "Must report a traffic offence",
    ],
    correctIndex: 0,
    explanation:
      "Fatigue is only fixed by stopping, and a marked rest area is a far safer place to do it than the shoulder of a freeway.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qs2_emergency_phone",
    categoryId: "signs",
    prompt: "On a freeway, a sign showing a telephone symbol with an arrow indicates:",
    options: [
      "The direction and distance to the nearest emergency telephone",
      "That cellphone use is permitted at that point",
      "A public telephone available for any purpose",
      "A toll plaza with a payment kiosk",
    ],
    correctIndex: 0,
    explanation:
      "Emergency phones connect straight to a control room and identify where you are — which matters when you have broken down and cannot describe your position.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_route_marker_shape",
    categoryId: "signs",
    prompt: "On South African route markers, a national route number such as N1 is shown:",
    options: [
      "On a distinctive route-number marker that identifies the road, not the destination",
      "Only on brown tourist signage",
      "Only at the entrance to a toll plaza",
      "In red lettering to distinguish it from provincial routes",
    ],
    correctIndex: 0,
    explanation:
      "Route markers tell you which road you are on. Destination boards tell you where it goes — you generally need to read both to navigate a junction correctly.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Reading the sign system ─────────────────────────────────
  {
    id: "qs2_blue_vs_red_circle",
    categoryId: "signs",
    prompt: "The essential difference between a blue circular sign and a red-ringed circular sign is that:",
    options: [
      "Blue circles tell you what you must do; red rings tell you what you may not do",
      "Blue circles are advisory while red rings are compulsory",
      "Blue circles apply to heavy vehicles and red rings to all vehicles",
      "Blue circles apply only in urban areas",
    ],
    correctIndex: 0,
    explanation:
      "Both are compulsory — the difference is direction. Blue commands an action, red forbids one. Reading the shape and colour first tells you which kind of instruction you are getting.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_warning_vs_regulatory",
    categoryId: "signs",
    prompt: "Why does it matter whether a sign is a warning triangle or a regulatory sign?",
    options: [
      "A warning asks you to adjust to a hazard; a regulatory sign imposes a legal requirement you can be prosecuted for ignoring",
      "Warnings apply by day and regulatory signs by night",
      "Warnings apply to light vehicles and regulatory signs to heavy vehicles",
      "There is no practical difference — both are advisory",
    ],
    correctIndex: 0,
    explanation:
      "Ignoring a warning is bad driving; ignoring a regulatory sign is an offence. Both should change your behaviour, but only one carries a charge sheet.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_sign_placement_distance",
    categoryId: "signs",
    prompt: "Warning signs are placed some distance before the hazard itself so that:",
    options: [
      "You have time to slow down and adjust before you reach it",
      "They can be read from a side road",
      "They are easier to maintain away from the hazard",
      "They apply from the sign onwards indefinitely",
    ],
    correctIndex: 0,
    explanation:
      "The gap is the point: a warning you meet at the hazard is useless. Faster roads get longer approach distances for the same reason.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_supplementary_plate",
    categoryId: "signs",
    prompt: "A small rectangular plate mounted beneath a main sign generally:",
    options: [
      "Qualifies the main sign — the times, distance or vehicles it applies to",
      "Repeats the main sign for drivers who missed it",
      "Overrides the main sign entirely",
      "Indicates who is responsible for maintaining the sign",
    ],
    correctIndex: 0,
    explanation:
      "The plate is the fine print: 'except buses', 'for the next 2 km', '07:00–09:00'. Reading the main sign without it can leave you obeying a restriction that doesn't apply, or breaking one that does.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qs2_sign_conflict_officer",
    categoryId: "signs",
    prompt: "A permanent sign and a traffic officer's directions conflict. You must:",
    options: [
      "Follow the traffic officer",
      "Follow the permanent sign, since it is the law",
      "Stop and wait for the officer to leave",
      "Choose whichever is safer in your judgement",
    ],
    correctIndex: 0,
    explanation:
      "A person directing traffic outranks the signage, because they can see the situation the signs were never designed for — a crash, a failed robot, a closure.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_faded_sign",
    categoryId: "signs",
    prompt: "You approach a regulatory sign that is faded, dirty or partly obscured by a branch. You should:",
    options: [
      "Obey it as far as you can determine its meaning, and drive more cautiously because of the doubt",
      "Ignore it, since an unclear sign cannot be enforced",
      "Stop next to it until you are certain of its meaning",
      "Assume it carries the same meaning as the previous sign you passed",
    ],
    correctIndex: 0,
    explanation:
      "A damaged sign is still a sign, and the restriction it marks is still there. Uncertainty about the instruction is a reason to slow down, not to disregard it.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Hazard markers and delineation ──────────────────────────
  {
    id: "qs2_chevron_board",
    categoryId: "signs",
    prompt: "A board carrying large arrows or chevrons pointing to one side, mounted on the outside of a bend, tells you:",
    options: [
      "Which way the road turns, and that the bend is sharper than it may appear",
      "That overtaking is permitted around the bend",
      "That the road surface changes at that point",
      "That a side road joins from that direction",
    ],
    correctIndex: 0,
    explanation:
      "Chevron boards are aimed straight at approaching headlights so the bend reads clearly at night. Several of them stacked through a curve is a warning that it tightens.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_hazard_marker",
    categoryId: "signs",
    prompt: "Black-and-yellow striped marker boards placed at an obstruction indicate:",
    options: [
      "A physical hazard at the roadside, and which side of it the traffic must pass",
      "A pedestrian crossing point",
      "A temporary speed restriction",
      "The boundary of a municipal area",
    ],
    correctIndex: 0,
    explanation:
      "They mark the thing itself — a bridge pier, an island nose, a culvert end. The direction the stripes slope shows the side you should be passing on.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_delineator_posts",
    categoryId: "signs",
    prompt: "Reflective marker posts spaced along the edge of a rural road are there mainly to:",
    options: [
      "Show the line of the road ahead at night or in poor visibility",
      "Mark the boundary of the road reserve for landowners",
      "Indicate distance from the nearest town",
      "Show where it is safe to stop",
    ],
    correctIndex: 0,
    explanation:
      "They trace the road's course beyond your headlights, so you can read a curve before you are in it. They are guidance, not permission to use the verge.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Level crossings ─────────────────────────────────────────
  {
    id: "qs2_st_andrews_cross",
    categoryId: "signs",
    prompt: "An X-shaped cross sign at a railway line marks:",
    options: [
      "The level crossing itself — the point at which you must be prepared to stop for a train",
      "A crossing that has been permanently closed",
      "A crossing where trains have right of way only at night",
      "A pedestrian-only crossing over the line",
    ],
    correctIndex: 0,
    explanation:
      "The cross marks the crossing itself, as opposed to the triangular sign that warned you it was coming. Trains always have right of way — they physically cannot give it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_crossing_flashing_red",
    categoryId: "signs",
    prompt: "Red lights begin flashing at a level crossing as you approach. You must:",
    options: [
      "Stop before the crossing and wait until the lights stop flashing, even if you cannot see a train",
      "Cross quickly before the train arrives",
      "Proceed if the boom has not yet come down",
      "Stop only if you can hear a train approaching",
    ],
    correctIndex: 0,
    explanation:
      "The lights start well before the train reaches you, and a second train can follow the first. Not seeing a train is not evidence there isn't one.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Freeway and lane signage ────────────────────────────────
  {
    id: "qs2_freeway_ends",
    categoryId: "signs",
    prompt: "A sign indicating that the freeway ends warns you that:",
    options: [
      "Freeway rules no longer apply — expect pedestrians, cross-traffic and slower vehicles",
      "The road surface deteriorates beyond that point",
      "The speed limit automatically becomes 60 km/h",
      "The road becomes a toll route",
    ],
    correctIndex: 0,
    explanation:
      "It is the protections that end, not just the name. Everything a freeway excludes — junctions at grade, pedestrians, cyclists, stopping — can now be present.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_lane_control_x",
    categoryId: "signs",
    prompt: "An overhead signal shows a red X above your lane. It means:",
    options: [
      "That lane is closed ahead — move out of it safely",
      "That lane is reserved for emergency vehicles",
      "Traffic in that lane must stop immediately",
      "The lane ends and merges to the right",
    ],
    correctIndex: 0,
    explanation:
      "Overhead lane signals close individual lanes for an incident or works ahead. Change lanes in good time rather than at the obstruction itself.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_climbing_lane",
    categoryId: "signs",
    prompt: "A sign announcing a climbing (passing) lane ahead is most useful because it tells you:",
    options: [
      "There will shortly be a safe, marked place to pass slow traffic — so you need not force a pass now",
      "Slow vehicles are prohibited beyond that point",
      "Overtaking is prohibited until the lane begins",
      "The gradient ahead requires a lower gear",
    ],
    correctIndex: 0,
    explanation:
      "Most dangerous overtaking on a rural road happens within a few kilometres of a climbing lane the driver didn't know was coming. Waiting costs a minute.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_exit_number",
    categoryId: "signs",
    prompt: "Exit numbers on freeway direction signs are useful mainly because they:",
    options: [
      "Identify each interchange unambiguously, even when place names are unfamiliar",
      "Indicate the distance to the next fuel station",
      "Show the speed limit applying to the off-ramp",
      "Number the lanes that may be used to exit",
    ],
    correctIndex: 0,
    explanation:
      "A number cannot be confused the way two similar suburb names can, which is why directions are given as exit numbers.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_distance_board",
    categoryId: "signs",
    prompt: "A green board listing towns with numbers beside them shows:",
    options: [
      "The distance in kilometres to each of those places along that route",
      "The speed limit applying to each section",
      "The route numbers serving each town",
      "The population of each town",
    ],
    correctIndex: 0,
    explanation:
      "Distance boards let you plan fuel and rest stops. Reading one is also a cheap way to confirm you took the right road out of a junction.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Restriction start and end ───────────────────────────────
  {
    id: "qs2_end_of_restriction",
    categoryId: "signs",
    prompt: "A sign repeating a restriction with a diagonal line struck through it means:",
    options: [
      "That particular restriction now ends",
      "The restriction is temporarily suspended",
      "The restriction now applies more strictly",
      "The restriction applies only to heavy vehicles",
    ],
    correctIndex: 0,
    explanation:
      "The struck-through version cancels the restriction it repeats. Until you pass it — or a sign setting a new limit — the original one is still in force.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qs2_restriction_until_cancelled",
    categoryId: "signs",
    prompt: "You pass a sign restricting overtaking. In the absence of any further signs, that restriction applies:",
    options: [
      "Until a sign cancels it or the road situation it governs clearly ends",
      "For exactly one kilometre",
      "Only while you can still see the sign in your mirror",
      "Only until the next intersection",
    ],
    correctIndex: 0,
    explanation:
      "Restrictions run until cancelled. Assuming one has quietly lapsed because you have driven a while is how drivers end up overtaking on the approach to the hazard it was protecting.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qs2_speed_limit_is_maximum",
    categoryId: "signs",
    prompt: "A speed limit sign sets the maximum for ideal conditions, which means:",
    options: [
      "In rain, fog or heavy traffic the safe speed may be well below the posted figure",
      "You are entitled to drive at that speed in any conditions",
      "The limit only applies in daylight",
      "You may exceed it slightly if traffic is flowing faster",
    ],
    correctIndex: 0,
    explanation:
      "The number is a ceiling, never a target. Driving at the limit in conditions that don't allow it is both dangerous and chargeable as reckless or negligent driving.",
    difficulty: 1,
    scope: "learners",
  },
];
