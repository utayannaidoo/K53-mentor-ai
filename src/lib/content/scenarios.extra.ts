import type { Scenario } from "@/types";
import { signImg } from "./signs";

/**
 * Second scenario bank — situational-judgement items that expand the pool per
 * vehicle code so the scenario player stops repeating the same handful.
 */
export const EXTRA_SCENARIOS: Scenario[] = [
  {
    id: "sc2_taxi_stop",
    categoryId: "hazard_awareness",
    title: "The taxi ahead slows",
    situation:
      "You are following a minibus taxi through town. A group of people stands at the roadside ahead, and the taxi starts drifting toward them without indicating.",
    prompt: "What do you do?",
    choices: [
      {
        id: "a",
        text: "Overtake immediately before it stops",
        correct: false,
        consequence:
          "As you pull out, the taxi could swing back into the lane — or a passenger could step out in front of you. Overtaking into an unfolding situation is gambling.",
      },
      {
        id: "b",
        text: "Back off, cover the brake and expect it to stop suddenly",
        correct: true,
        consequence:
          "Correct. People at the roadside plus a drifting taxi means a stop is coming, indicated or not. The extra gap turns a sudden stop into a non-event.",
      },
      {
        id: "c",
        text: "Hoot continuously so it keeps moving",
        correct: false,
        consequence:
          "The taxi is going to stop for its passengers regardless. Hooting changes nothing and can startle pedestrians near the roadway.",
      },
    ],
    debrief:
      "Read the cause, not the indicator: waiting passengers tell you what a taxi will do before its driver does. Space and a covered brake are your protection.",
  },
  {
    id: "sc2_oncoming_overtaker",
    categoryId: "hazard_awareness",
    title: "Head-on closing fast",
    situation:
      "On a single carriageway at 100 km/h, an oncoming bakkie pulls out to overtake a truck and is now heading straight at you in your lane.",
    prompt: "Your best move?",
    choices: [
      {
        id: "a",
        text: "Hold your line and flash your lights — you have right of way",
        correct: false,
        consequence:
          "Right of way won't soften a head-on at a combined 200 km/h. Insisting on the rule leaves your survival in the other driver's hands.",
      },
      {
        id: "b",
        text: "Brake hard and move left, onto the shoulder if needed",
        correct: true,
        consequence:
          "Correct. Braking sheds energy and buys the bakkie space to complete or abort; moving left opens the escape route that doesn't depend on anyone else.",
      },
      {
        id: "c",
        text: "Swerve right into the oncoming lane the bakkie came from",
        correct: false,
        consequence:
          "If the bakkie ducks back into its lane — the most likely outcome — you've swapped a near-miss for a guaranteed head-on.",
      },
    ],
    debrief:
      "Against a head-on threat: brake, go left, never right. Shedding speed is the one action that always helps, whatever the other driver does.",
  },
  {
    id: "sc2_cyclist_pass",
    categoryId: "rules",
    image: signImg("cyclists"),
    title: "Cyclist on a narrow road",
    situation:
      "You catch up to a cyclist on a narrow two-way road. There is a steady stream of oncoming traffic, and passing now would leave the cyclist perhaps half a metre.",
    prompt: "What do you do?",
    choices: [
      {
        id: "a",
        text: "Squeeze past — half a metre is enough if they hold their line",
        correct: false,
        consequence:
          "Cyclists swerve for potholes, drains and gusts. At half a metre, their small wobble is your collision — and passing that close is exactly how cyclists get killed.",
      },
      {
        id: "b",
        text: "Hold back at a safe distance and pass with at least a metre once oncoming traffic clears",
        correct: true,
        consequence:
          "Correct. A few seconds of patience buys a legal, safe pass with a metre-plus of space.",
      },
      {
        id: "c",
        text: "Hoot until the cyclist rides in the gravel so you can pass",
        correct: false,
        consequence:
          "Forcing a cyclist off the tar into loose gravel is how you cause the crash you were trying to avoid. They're entitled to the roadway.",
      },
    ],
    debrief:
      "Pass cyclists with at least 1 m of space — and if that space doesn't exist yet, the pass simply waits until it does.",
  },
  {
    id: "sc2_blowout",
    categoryId: "hazard_awareness",
    title: "Bang at 110",
    situation:
      "On the freeway at 110 km/h there's a loud bang and the steering yanks left — a front tyre has burst.",
    prompt: "Your immediate response?",
    choices: [
      {
        id: "a",
        text: "Brake as hard as possible to stop quickly",
        correct: false,
        consequence:
          "Hard braking on a burst front tyre multiplies the pull and can spin the car. This is the classic blowout mistake.",
      },
      {
        id: "b",
        text: "Grip the wheel, ease off the accelerator and keep it straight; brake gently once it's under control",
        correct: true,
        consequence:
          "Correct. Let the drag of the flat shed your speed while you hold the car straight, then ease over to the emergency lane and stop.",
      },
      {
        id: "c",
        text: "Swerve immediately for the emergency lane",
        correct: false,
        consequence:
          "Sharp steering on three good tyres and one flat is how blowouts become rollovers. Straight first, steer later.",
      },
    ],
    debrief:
      "Blowout drill: grip, ease off, straight line — brake and change course only once the car is stable. Hands at quarter-to-three make the first second survivable.",
  },
  {
    id: "sc2_fog_patch",
    categoryId: "hazard_awareness",
    title: "Into the fog",
    situation:
      "Early morning on a rural road, a dense fog bank sits across a dip ahead. You can't see how far it stretches.",
    prompt: "Before entering it, you…",
    choices: [
      {
        id: "a",
        text: "Switch to main beam so you can see deeper into it",
        correct: false,
        consequence:
          "Main beam reflects off the water droplets and whites out your entire view — you'll see less, not more.",
      },
      {
        id: "b",
        text: "Slow down first, switch to dipped beams and widen your following gap",
        correct: true,
        consequence:
          "Correct. You shed the speed while you can still see; inside the fog you drive at a pace you can stop within your visible distance.",
      },
      {
        id: "c",
        text: "Stop in your lane before the fog to assess it",
        correct: false,
        consequence:
          "A stationary car in a live lane at a fog line is exactly what the next driver won't see in time. If you must wait it out, get fully off the road.",
      },
    ],
    debrief:
      "Slow before the fog, not inside it. Dipped beams, a bigger gap, and never stop on the roadway — pull right off if visibility gets undriveable.",
  },
  {
    id: "sc2_green_ped",
    categoryId: "intersections",
    title: "Green light, slow walker",
    situation:
      "Your robot turns green. An elderly man with a walking stick is still only halfway across your side of the intersection. The car behind you hoots.",
    prompt: "You…",
    choices: [
      {
        id: "a",
        text: "Pull off slowly and steer around behind him",
        correct: false,
        consequence:
          "Weaving around a pedestrian in the intersection is unpredictable for him and for other drivers — if he hesitates or steps back, you've built the collision yourself.",
      },
      {
        id: "b",
        text: "Wait until he has safely cleared your path, whatever the car behind thinks",
        correct: true,
        consequence:
          "Correct. A pedestrian lawfully in the crossing keeps right of way until across. The hooting driver's impatience is not your emergency.",
      },
      {
        id: "c",
        text: "Hoot too, so he speeds up",
        correct: false,
        consequence:
          "Startling an elderly pedestrian mid-crossing risks a stumble in front of moving cars. Green means go only when the way is actually clear.",
      },
    ],
    debrief:
      "Green is permission, not priority over people already in the intersection. Pressure from behind never transfers the responsibility off you.",
  },
  {
    id: "sc2_breakdown_freeway",
    categoryId: "rules",
    title: "Dead on the freeway",
    situation:
      "Your engine dies on a busy freeway. You coast to a stop — you just managed to get fully into the emergency lane. Traffic is passing at 120 km/h.",
    prompt: "What now?",
    choices: [
      {
        id: "a",
        text: "Stay in the car with everyone belted, doors locked, and phone for help",
        correct: false,
        consequence:
          "A stationary car in the emergency lane gets rear-ended by drifting trucks often enough that sitting in it is the riskiest place to wait.",
      },
      {
        id: "b",
        text: "Hazards on, triangle at least 45 m back, then wait with passengers behind the barrier away from traffic",
        correct: true,
        consequence:
          "Correct. Warn approaching traffic early (hazards + triangle 45 m), then put steel or distance between your people and the traffic stream.",
      },
      {
        id: "c",
        text: "Stand behind the car and wave traffic past",
        correct: false,
        consequence:
          "Standing in or at the edge of a 120 km/h traffic stream to direct it is a fast way to become the second casualty.",
      },
    ],
    debrief:
      "Breakdown drill: fully off the roadway, hazards on, triangle 45 m back, people behind the barrier. The car is replaceable.",
  },
  {
    id: "sc2_uncontrolled_int",
    categoryId: "intersections",
    title: "No signs, no robots",
    situation:
      "In an older suburb you approach a crossroad with no stop signs, no yield signs and no markings. A car approaches the crossing road from your left at similar speed.",
    prompt: "How do you handle it?",
    choices: [
      {
        id: "a",
        text: "Maintain speed — traffic from the left must yield to you",
        correct: false,
        consequence:
          "Assuming the other driver knows and follows the same rule you do, at full speed, is how uncontrolled intersections produce T-bones.",
      },
      {
        id: "b",
        text: "Slow down, be ready to stop, and only proceed once you've made eye contact or the other car clearly yields",
        correct: true,
        consequence:
          "Correct. At an uncontrolled intersection you approach at a speed you can stop from, yield to anyone in it before you, and negotiate the rest with eye contact.",
      },
      {
        id: "c",
        text: "Hoot and accelerate through first",
        correct: false,
        consequence:
          "Claiming the gap with noise and speed removes every margin if the other driver does the same.",
      },
    ],
    debrief:
      "Uncontrolled intersections are negotiations, not races: arrive slow enough to stop, yield to whoever's in first, and confirm the other driver has seen you.",
  },
  {
    id: "sc2_gravel_bend",
    categoryId: "hazard_awareness",
    title: "Gravel road, tightening bend",
    situation:
      "You're on a farm gravel road at 80 km/h. A bend ahead tightens more than you expected, and the car starts to slide wide toward the outside edge.",
    prompt: "You…",
    choices: [
      {
        id: "a",
        text: "Brake hard mid-bend",
        correct: false,
        consequence:
          "Hard braking on loose gravel mid-corner locks wheels and turns a slide into a spin or rollover off the edge.",
      },
      {
        id: "b",
        text: "Ease gently off the accelerator, look through the bend, and let the front regain grip while steering smoothly",
        correct: true,
        consequence:
          "Correct. A gentle lift transfers weight forward onto the steering wheels without breaking traction — the car tightens its line as grip returns.",
      },
      {
        id: "c",
        text: "Add power to drive out of the slide",
        correct: false,
        consequence:
          "More power on loose gravel pushes the car wider — straight off the outside of the bend.",
      },
    ],
    debrief:
      "On gravel, speed you carry into a bend is the mistake; everything after is damage control. Slow in, smooth inputs, eyes through the corner.",
  },
  // ── Car-specific (Code 8) ──────────────────────────────────
  {
    id: "sc2_car_lap_child",
    categoryId: "rules",
    codes: ["8"],
    title: "The short trip excuse",
    situation:
      "You're giving a friend and her two-year-old a lift to the shop, five minutes away. She climbs into the back and holds the toddler on her lap: \"It's just around the corner.\"",
    prompt: "You…",
    choices: [
      {
        id: "a",
        text: "Drive — for five minutes the risk is negligible",
        correct: false,
        consequence:
          "Most crashes happen close to home at ordinary speeds. In a 60 km/h stop, a held toddler becomes an unholdable projectile many times their weight.",
      },
      {
        id: "b",
        text: "Only drive once the child is secured in a child seat",
        correct: true,
        consequence:
          "Correct. Children under three must be in a child restraint — the law doesn't have a 'short trip' exception, and neither does physics.",
      },
      {
        id: "c",
        text: "Ask her to belt herself and the child in together under one belt",
        correct: false,
        consequence:
          "One belt over two bodies concentrates the adult's weight onto the child in a stop — it's more dangerous than it looks.",
      },
    ],
    debrief:
      "Under-3s ride in a child restraint, every trip. As the driver, the child's restraint is legally your responsibility.",
  },
  {
    id: "sc2_car_cruise_rain",
    categoryId: "hazard_awareness",
    codes: ["8"],
    title: "Cruise control and the downpour",
    situation:
      "You're cruising at 120 km/h on cruise control when a summer thunderstorm hits. Water starts pooling in the wheel tracks ahead.",
    prompt: "You…",
    choices: [
      {
        id: "a",
        text: "Leave cruise on — it keeps the speed steadier than your foot",
        correct: false,
        consequence:
          "If the tyres aquaplane, cruise holds (or adds) power with zero feel for the loss of grip — and your foot is nowhere near ready.",
      },
      {
        id: "b",
        text: "Switch cruise off, slow down and steer around the pooled water where safe",
        correct: true,
        consequence:
          "Correct. Your own foot on the throttle gives instant response the moment the steering goes light — and less speed means the tyres can clear more water.",
      },
      {
        id: "c",
        text: "Brake hard the moment you hit standing water",
        correct: false,
        consequence:
          "Braking hard on aquaplaning tyres locks them instantly — you become a passenger. Ease off and keep the wheel straight instead.",
      },
    ],
    debrief:
      "Cruise control is a dry-road tool. In rain: cruise off, speed down, gentle inputs — and if the steering goes light, ease off and hold straight.",
  },
  // ── Motorcycle-specific (Code A / A1) ──────────────────────
  {
    id: "sc2_mc_robot_paint",
    categoryId: "hazard_awareness",
    codes: ["A"],
    title: "Wet arrows at the robot",
    situation:
      "Riding in rain, you approach a red robot. Your braking zone is covered by big painted lane arrows, shiny with water.",
    prompt: "How do you brake?",
    choices: [
      {
        id: "a",
        text: "Brake normally — paint is part of the road",
        correct: false,
        consequence:
          "Wet paint offers a fraction of tar's grip. Braking hard on it, especially with the front, tucks the wheel and drops the bike.",
      },
      {
        id: "b",
        text: "Do most of your braking early on clean tar, then roll over the paint with brakes eased",
        correct: true,
        consequence:
          "Correct. You planned the surface like a hazard: hard braking where grip lives, light or no braking where it doesn't.",
      },
      {
        id: "c",
        text: "Swerve between the arrows while braking hard",
        correct: false,
        consequence:
          "Combining hard braking with swerving on a wet surface asks for grip you don't have — one input at a time.",
      },
    ],
    debrief:
      "Read the surface as part of your braking plan: finish the hard braking on clean tar, cross paint and steel upright with the brakes eased.",
  },
  {
    id: "sc2_mc_pillion_ask",
    categoryId: "rules",
    codes: ["A"],
    title: "\"Just take me down the road\"",
    situation:
      "You have a motorcycle learner's licence. A friend asks you to drop him at the taxi rank two kilometres away, riding pillion.",
    prompt: "You…",
    choices: [
      {
        id: "a",
        text: "Take him — two kilometres is nothing",
        correct: false,
        consequence:
          "A learner rider may not carry a passenger at all. If anything happens, you're unlicensed for what you were doing — with your friend as the casualty.",
      },
      {
        id: "b",
        text: "Decline — a learner may not carry a pillion",
        correct: true,
        consequence:
          "Correct. Motorcycle learners ride alone; there's no supervising-driver setup like in a car. The rule exists because a pillion changes the bike's braking and balance completely.",
      },
      {
        id: "c",
        text: "Take him but ride slowly on back streets",
        correct: false,
        consequence:
          "Slower and quieter doesn't make it legal — and low-speed balance with an untrained pillion is exactly where learners drop bikes.",
      },
    ],
    debrief:
      "On a learner's licence you ride solo, full stop. Carrying a pillion needs a full licence, a proper seat and footrests — and practice.",
  },
  // ── Heavy-specific (Code 10 / 14) ──────────────────────────
  {
    id: "sc2_hv_low_bridge",
    categoryId: "rules",
    codes: ["14"],
    title: "The 4,2 m bridge",
    situation:
      "Your GPS reroutes you through town. Ahead, a railway bridge is signed '4,2 m'. Your rig with its load stands 4,3 m tall.",
    prompt: "You…",
    choices: [
      {
        id: "a",
        text: "Creep under slowly — signs always have a safety margin",
        correct: false,
        consequence:
          "Betting your trailer roof on an assumed margin peels containers open and brings down bridge services. 'Slow' doesn't make you shorter.",
      },
      {
        id: "b",
        text: "Stop safely before the bridge and work out a legal detour, reversing only with help if unavoidable",
        correct: true,
        consequence:
          "Correct. A clearance lower than your height is a hard stop. You plan the escape calmly — controlled delay beats a destroyed load and a closed line.",
      },
      {
        id: "c",
        text: "Let some air out of the suspension and try again",
        correct: false,
        consequence:
          "Suspension tricks buy centimetres unreliably and leave you committed under the bridge if you're wrong. The answer is a route, not a squeeze.",
      },
    ],
    debrief:
      "Know your travelling height before every trip and treat clearance signs as absolute. The professional move at a too-low bridge is the boring one: stop and re-route.",
  },
  {
    id: "sc2_hv_brake_fade",
    categoryId: "controls",
    codes: ["14"],
    title: "Fading brakes on the pass",
    situation:
      "Halfway down a long mountain pass, fully loaded, your brake pedal starts feeling spongy and the smell of hot linings reaches the cab. An arrester bed is signed 800 m ahead.",
    prompt: "You…",
    choices: [
      {
        id: "a",
        text: "Keep braking hard — the bottom can't be far",
        correct: false,
        consequence:
          "Fading brakes get worse with every application. 'Hoping to the bottom' is how runaway crashes start — and the next escape route may be beyond your control point.",
      },
      {
        id: "b",
        text: "Commit to the arrester bed: signal, line up early and steer positively into it",
        correct: true,
        consequence:
          "Correct. You still have enough control to choose where this ends. The bed's gravel does the stopping your brakes no longer can.",
      },
      {
        id: "c",
        text: "Grab a lower gear and yank the trailer handbrake",
        correct: false,
        consequence:
          "At overspeed you may not get the lower gear at all — and a snatched trailer brake can jackknife the combination. The decision point for engine braking was at the summit.",
      },
    ],
    debrief:
      "Descend in the gear you'd climb in, selected at the top, retarder on, brakes in reserve. Once fade starts, take the escape route while you still steer the outcome.",
  },
];
