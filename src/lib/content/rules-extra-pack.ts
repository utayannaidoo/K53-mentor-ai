import type { Question } from "@/types";

/**
 * Rules-section expansion — road rules, intersections, parking, following
 * distance and hazard awareness. Facts trace to docs/content/facts/rules.md,
 * intersections.md and hazard-parking-following.md.
 *
 * The mock draws 28 questions from this whole group per paper, so depth in any
 * of the five categories widens the same section. Spread across all five rather
 * than piled into `rules`, because the thin categories were also the ones that
 * made papers feel samey.
 *
 * Confined to procedure, priority and judgement — the material that is stable
 * and universally taught. New items turning on a regulated numeric threshold
 * (following distances in metres, reporting deadlines, permitted dimensions)
 * are deliberately absent: the roadmap's standing note is to verify regulated
 * facts against the regulation before publishing, and the existing packs
 * already carry the well-established figures.
 */
export const RULES_EXTRA_QUESTIONS: Question[] = [
  // ── Rules — priority and procedure ──────────────────────────
  {
    id: "qr2_right_of_way_given",
    categoryId: "rules",
    prompt: "The most accurate way to think about 'right of way' is that it is:",
    options: [
      "Something another road user gives you, never something you may take",
      "A legal entitlement you may insist on once it is yours",
      "Decided by whichever vehicle is larger",
      "Only relevant at intersections controlled by signs",
    ],
    correctIndex: 0,
    explanation:
      "Being entitled to proceed is not the same as it being safe to. The rules decide who should yield; they cannot make another driver actually do it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_funeral_procession",
    categoryId: "rules",
    prompt: "You meet a funeral procession or a marked convoy travelling together. The courteous and safe approach is to:",
    options: [
      "Avoid cutting into the middle of it, and wait rather than force a gap",
      "Overtake the whole procession at speed to clear it quickly",
      "Join the procession to move through traffic faster",
      "Sound your hooter to ask them to make way",
    ],
    correctIndex: 0,
    explanation:
      "Splitting a convoy strands its drivers, who are watching the vehicle ahead rather than the traffic. Ordinary road rules still apply to them and to you.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_roadblock",
    categoryId: "rules",
    prompt: "You are signalled to stop at a roadblock. You should:",
    options: [
      "Stop where directed, keep your hands visible, and produce your licence when asked",
      "Slow down but continue if you are in a hurry",
      "Stop only if a marked patrol vehicle is present",
      "Reverse and take an alternative route",
    ],
    correctIndex: 0,
    explanation:
      "Failing to stop when directed is an offence in itself. Stop where indicated and produce your driving licence on demand.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr2_yield_to_pedestrian_turning",
    categoryId: "rules",
    prompt: "You are turning into a side road and a pedestrian has already started crossing it. You must:",
    options: [
      "Give way and let them finish crossing",
      "Proceed, because the pedestrian should have waited for traffic",
      "Sound your hooter to warn them and continue turning",
      "Give way only if they are on a marked crossing",
    ],
    correctIndex: 0,
    explanation:
      "A pedestrian already in the roadway you are turning into has committed to the crossing. Turning across them is both dangerous and an offence.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_animal_drawn",
    categoryId: "rules",
    prompt: "You come up behind an animal-drawn cart on a rural road. You should:",
    options: [
      "Slow right down and pass wide only when you can see well ahead — animals can move unpredictably",
      "Sound your hooter continuously so the driver moves over",
      "Overtake immediately, since the cart is travelling slowly",
      "Follow closely so you can pass at the first opportunity",
    ],
    correctIndex: 0,
    explanation:
      "A hooter or a close pass can startle the animal into the road. Treat it like any slow vehicle that might swerve without warning: space and patience.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_headlights_courtesy",
    categoryId: "rules",
    prompt: "Flashing your headlights at another driver is best understood as:",
    options: [
      "A warning that you are there — it does not grant them permission to proceed",
      "A recognised signal that you are giving way",
      "A legal instruction the other driver must obey",
      "The correct way to indicate you intend to overtake",
    ],
    correctIndex: 0,
    explanation:
      "There is no legal meaning to a flash, and drivers read it both ways. Waving someone into a gap you cannot fully see is how people get hit.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_slow_vehicle_courtesy",
    categoryId: "rules",
    prompt: "You are driving a slow vehicle on a single-lane road and traffic has built up behind you. You should:",
    options: [
      "Pull over where it is safe and let the queue pass",
      "Maintain your speed — following traffic must simply wait",
      "Speed up beyond what is comfortable to clear the queue",
      "Drive on the yellow line so vehicles can pass you",
    ],
    correctIndex: 0,
    explanation:
      "A long queue produces risky overtaking. Letting it past when there is a safe place is both courteous and the safer outcome for everyone.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_lights_dusk",
    categoryId: "rules",
    prompt: "The purpose of switching your lights on at dusk, before it is properly dark, is mainly to:",
    options: [
      "Be seen by others — your own vision is not the limiting factor yet",
      "Comply with a rule that applies only after sunset",
      "Warm the headlamps up before full darkness",
      "Signal to other drivers that you intend to travel a long distance",
    ],
    correctIndex: 0,
    explanation:
      "At dusk you can still see fine, which is exactly why drivers leave lights off — while becoming almost invisible to everyone else against a grey background.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Intersections ───────────────────────────────────────────
  {
    id: "qr2_box_junction_entry",
    categoryId: "intersections",
    prompt: "You may only enter an intersection when:",
    options: [
      "There is room for you to clear it completely on the far side",
      "Your light is green, regardless of the traffic ahead",
      "The vehicle in front has begun to move",
      "You can get at least halfway across",
    ],
    correctIndex: 0,
    explanation:
      "Stopping inside an intersection blocks the phase for every other direction. A green light permits you to go; it does not promise you somewhere to arrive.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_stop_line_position",
    categoryId: "intersections",
    prompt: "At a stop street where the stop line is set well back from the corner, the correct procedure is to:",
    options: [
      "Stop at the line first, then creep forward for a view if buildings block it",
      "Ignore the line and stop where you can see",
      "Stop only once your bonnet is level with the cross street",
      "Stop at the line and proceed regardless, since you have complied",
    ],
    correctIndex: 0,
    explanation:
      "The line is a legal stopping point and a second, edged-out stop is how you actually see. Complying with the line without ever getting a view is a stop you learned nothing from.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qr2_turn_across_queue",
    categoryId: "intersections",
    prompt: "You are turning right across a queue of stopped traffic that has left you a gap. The main danger is:",
    options: [
      "A vehicle or motorcycle passing the queue in the lane you cannot see into",
      "That the queue will start moving before you complete the turn",
      "That you will stall in the intersection",
      "That the gap will close behind you",
    ],
    correctIndex: 0,
    explanation:
      "The courteous gap hides the lane beyond it. Edge across slowly so anything filtering past the queue has time to see you and you to see it.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qr2_traffic_circle_exit_signal",
    categoryId: "intersections",
    prompt: "When leaving a traffic circle, you should:",
    options: [
      "Signal left as you pass the exit before the one you want",
      "Signal right throughout, until you have left",
      "Not signal at all — circles are exempt",
      "Signal left only after you have already begun to exit",
    ],
    correctIndex: 0,
    explanation:
      "Signalling left on the approach to your exit tells drivers waiting to enter that the circle is about to clear. Signalling as you leave tells them nothing in time.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_yield_no_stop_needed",
    categoryId: "intersections",
    prompt: "At a yield sign with a completely clear road, you:",
    options: [
      "May proceed without stopping, provided you have genuinely checked and can give way if needed",
      "Must always come to a complete stop first",
      "Must stop only if another vehicle is visible",
      "May proceed without slowing at all",
    ],
    correctIndex: 0,
    explanation:
      "Yield requires you to be able to give way, not necessarily to stop. That means arriving slowly enough that stopping is still an option.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_blocked_view_junction",
    categoryId: "intersections",
    prompt: "A hedge or parked truck blocks your view at a junction you must pull out of. The safe method is to:",
    options: [
      "Edge forward in small movements, looking each time, until you can see both ways",
      "Pull out quickly so you spend less time exposed",
      "Rely on hearing to judge whether traffic is coming",
      "Wait for another driver to wave you out",
    ],
    correctIndex: 0,
    explanation:
      "Creep and peep: small movements give approaching drivers time to see your nose and react, and each one buys you more view. Darting out gives nobody time.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_emergency_at_red",
    categoryId: "intersections",
    prompt: "You are stopped at a red light and an ambulance behind you needs to get through. You should:",
    options: [
      "Move aside only when you can do so safely and lawfully, without entering the intersection against the red",
      "Drive through the red light immediately to clear the way",
      "Stay exactly where you are under all circumstances",
      "Reverse to create a gap",
    ],
    correctIndex: 0,
    explanation:
      "Helping an emergency vehicle never requires committing an offence that endangers cross-traffic. Make room where you safely can; the ambulance is trained to work around a red.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qr2_left_turn_cyclist",
    categoryId: "intersections",
    prompt: "Before turning left at a junction, the road user most easily missed is:",
    options: [
      "A cyclist or motorcyclist coming up on your left, alongside or just behind you",
      "A vehicle approaching from the right",
      "A pedestrian on the far side of the junction",
      "A vehicle following directly behind you",
    ],
    correctIndex: 0,
    explanation:
      "Turning left sweeps your vehicle across exactly where a cyclist would be. A mirror check plus a glance over the left shoulder is what finds them.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Parking ─────────────────────────────────────────────────
  {
    id: "qr2_park_against_flow",
    categoryId: "parking",
    prompt: "Parking facing against the direction of traffic on a two-way road is a problem mainly because:",
    options: [
      "Your lights and reflectors face the wrong way and you must cross traffic to leave",
      "It makes the vehicle harder to lock",
      "It is only permitted for goods vehicles",
      "It shortens the distance to the kerb",
    ],
    correctIndex: 0,
    explanation:
      "Rear reflectors and lights are designed to be seen by traffic approaching from behind. Facing the wrong way removes that, and getting out means crossing the road from a standstill.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_park_obstruct_sign",
    categoryId: "parking",
    prompt: "Parking where your vehicle hides a road sign or traffic signal from other drivers is:",
    options: [
      "An obstruction — other drivers lose information they need to act on",
      "Acceptable if you park there only briefly",
      "Acceptable provided the sign is not a regulatory one",
      "Only a problem for vehicles taller than the sign",
    ],
    correctIndex: 0,
    explanation:
      "A sign that cannot be seen does no work. Parking that hides one transfers the risk to every driver who then arrives unwarned.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_park_loading_zone",
    categoryId: "parking",
    prompt: "A marked loading zone may be used:",
    options: [
      "For loading or offloading goods, not as general parking while you run errands",
      "By any vehicle at any time",
      "Only by vehicles displaying a disabled permit",
      "Only outside business hours",
    ],
    correctIndex: 0,
    explanation:
      "The bay exists so delivery vehicles are not forced to double-park in the traffic lane. Occupying it for anything else pushes them there.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_park_kerb_side_urban",
    categoryId: "parking",
    prompt: "Where there is no kerb, a vehicle parked beside a rural road should be:",
    options: [
      "As far off the travelled roadway as the ground safely allows",
      "Parked with two wheels on the roadway to stay out of soft ground",
      "Parked at an angle so it is more visible",
      "Left in the lane with hazard lights on",
    ],
    correctIndex: 0,
    explanation:
      "Rural traffic arrives fast and often at night. Every metre you get off the travelled surface is margin for the driver who is not expecting you.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_park_children_exit",
    categoryId: "parking",
    prompt: "Parked at the kerb with children in the car, you should let them get out:",
    options: [
      "On the kerb side only, and only once you have checked for cyclists and traffic",
      "On whichever side is closest to where they are going",
      "On the traffic side, so you can watch them cross",
      "Immediately, before you switch the engine off",
    ],
    correctIndex: 0,
    explanation:
      "Children step out without looking. The kerb side puts the vehicle between them and the traffic, and the check catches a cyclist coming up the gutter.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr2_park_hazard_lights_myth",
    categoryId: "parking",
    prompt: "Switching on your hazard lights while stopped somewhere you may not stop:",
    options: [
      "Does not make it lawful — hazards warn others, they do not create permission",
      "Makes a brief stop lawful anywhere",
      "Is required whenever you park legally",
      "Transfers responsibility to passing drivers",
    ],
    correctIndex: 0,
    explanation:
      "Hazards say 'I am a hazard', which is an admission rather than an excuse. If stopping there is prohibited, it stays prohibited with the lights flashing.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Following distance ──────────────────────────────────────
  {
    id: "qr2_following_reason_space",
    categoryId: "following_distance",
    prompt: "The single biggest benefit of a generous following distance is that it:",
    options: [
      "Buys time — the one thing you cannot manufacture once something goes wrong",
      "Reduces fuel consumption",
      "Lets you travel faster overall",
      "Keeps your vehicle cleaner in the wet",
    ],
    correctIndex: 0,
    explanation:
      "Every emergency response you have — braking, steering, deciding — is bought with time. Distance is simply how you store it in advance.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr2_following_view_ahead",
    categoryId: "following_distance",
    prompt: "Beyond stopping room, a longer gap to the vehicle ahead also gives you:",
    options: [
      "A better view of the road past it, so you see hazards earlier",
      "A legal defence if you do collide",
      "Permission to overtake without signalling",
      "Priority at the next intersection",
    ],
    correctIndex: 0,
    explanation:
      "Sitting close means the vehicle in front is your whole world. Dropping back turns it into one object in a scene you can actually read.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_following_gap_closed",
    categoryId: "following_distance",
    prompt: "Every time you drop back, another driver moves into the gap. The correct response is to:",
    options: [
      "Ease off again and rebuild the gap, however often it takes",
      "Close up so nobody can move in",
      "Match the gap the other drivers are keeping",
      "Move to the right-hand lane and stay there",
    ],
    correctIndex: 0,
    explanation:
      "Rebuilding the gap costs a few seconds over a journey. Refusing to, so that nobody 'takes' your space, means driving without any space at all.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_following_downhill_load",
    categoryId: "following_distance",
    prompt: "Going downhill, your following distance should be increased because:",
    options: [
      "Gravity adds to your momentum, so the same brakes need more distance to stop you",
      "Brake lights are harder to see on a slope",
      "Engine braking is unavailable on a descent",
      "Tyres grip better uphill than downhill",
    ],
    correctIndex: 0,
    explanation:
      "The slope is working with your momentum and against your brakes. The gap that was adequate on the flat is no longer adequate on the way down.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_following_stale_gap",
    categoryId: "following_distance",
    prompt: "A following distance judged as safe at 60 km/h in town becomes inadequate on the open road because:",
    options: [
      "The same time gap covers far more ground at higher speed",
      "Rural roads are always in worse condition",
      "Brakes work less well when warm",
      "There is less traffic to warn you of hazards",
    ],
    correctIndex: 0,
    explanation:
      "This is why the rule is counted in seconds rather than car lengths: the time you need stays roughly constant while the distance it represents grows with speed.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Hazard awareness ────────────────────────────────────────
  {
    id: "qr2_hazard_scan_pattern",
    categoryId: "hazard_awareness",
    prompt: "Good scanning while driving means you:",
    options: [
      "Keep your eyes moving — far ahead, near, mirrors, instruments — rather than fixing on one point",
      "Stare at the vehicle immediately ahead so you react to it fastest",
      "Watch the road surface just in front of your bonnet",
      "Check your mirrors only before a manoeuvre",
    ],
    correctIndex: 0,
    explanation:
      "A fixed stare stops finding new information within seconds. Moving eyes build a picture that includes things not yet in your path.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_hazard_escape_route",
    categoryId: "hazard_awareness",
    prompt: "Keeping an 'escape route' in mind while driving means:",
    options: [
      "Continuously knowing where you would go if the space ahead suddenly closed",
      "Planning an alternative route in case of traffic",
      "Staying near an off-ramp at all times",
      "Driving in the lane closest to the shoulder",
    ],
    correctIndex: 0,
    explanation:
      "Braking is not always enough. Drivers who avoid collisions usually already knew which way was open, because they had been noticing.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qr2_hazard_covering_children",
    categoryId: "hazard_awareness",
    prompt: "Driving past a school at closing time, the safest assumption is that:",
    options: [
      "A child may step out from between parked cars without looking",
      "Children will use the marked crossing because they were taught to",
      "The scholar patrol will control all pedestrian movement",
      "Children are only a risk on the school's own side of the road",
    ],
    correctIndex: 0,
    explanation:
      "Children are short, quick and focused on their friends, not on traffic. Plan for the one who doesn't look, because that is the one who will be there.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qr2_hazard_indicator_trust",
    categoryId: "hazard_awareness",
    prompt: "A vehicle waiting at a side road is indicating that it will turn away from you. You should:",
    options: [
      "Wait until it actually begins to move that way before you commit",
      "Proceed immediately, since it has signalled its intention",
      "Flash your lights to confirm it should go",
      "Sound your hooter as you pass",
    ],
    correctIndex: 0,
    explanation:
      "Indicators get left on from the last turn, and drivers change their minds. Movement is evidence; a blinking light is only a claim.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_hazard_wet_first_rain",
    categoryId: "hazard_awareness",
    prompt: "Approaching a large puddle spanning your lane at speed, the main risk is that:",
    options: [
      "It can pull the steering sharply and hide a pothole beneath it",
      "It will dirty your windscreen",
      "Your brakes will fail permanently",
      "The engine will stall immediately",
    ],
    correctIndex: 0,
    explanation:
      "Water drags on whichever wheels hit it first, which twists the steering, and you cannot see what the surface is doing underneath. Slow down before it, not in it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_hazard_emerging_vehicle",
    categoryId: "hazard_awareness",
    prompt: "You are passing a line of driveways in a residential street. The defensive approach is to:",
    options: [
      "Cover the brake and watch for reversing lights and movement in each opening",
      "Maintain speed and rely on the other driver to check before emerging",
      "Move to the middle of the road to gain distance",
      "Sound your hooter as you pass each driveway",
    ],
    correctIndex: 0,
    explanation:
      "A vehicle reversing out of a driveway has almost no view of the road. Reversing lights and any movement in the gap are your only early warning.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qr2_hazard_overload_visibility",
    categoryId: "hazard_awareness",
    prompt: "A vehicle ahead is piled high with an unsecured load. The safest response is to:",
    options: [
      "Drop well back and avoid sitting directly behind it",
      "Overtake immediately regardless of the road ahead",
      "Follow closely so you can see any load that shifts",
      "Sound your hooter to alert the driver",
    ],
    correctIndex: 0,
    explanation:
      "Anything that comes off arrives at your windscreen at closing speed. Distance gives you time to see it fall and room to avoid it.",
    difficulty: 2,
    scope: "learners",
  },
];
