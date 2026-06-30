import type { Scenario } from "@/types";
import { signImg } from "./signs";
import { VEHICLE_SCENARIOS } from "./scenarios.vehicle";

const CORE_SCENARIOS: Scenario[] = [
  {
    id: "sc_circle",
    categoryId: "intersections",
    image: signImg("traffic_circle"),
    title: "The busy traffic circle",
    situation:
      "You approach a single-lane traffic circle. A car is already in the circle, approaching from your right and not signalling to exit.",
    prompt: "What do you do?",
    choices: [
      {
        id: "a",
        text: "Enter quickly before the other car reaches you",
        correct: false,
        consequence:
          "You cut in front of a vehicle that has right of way. In a test this is an immediate failure, and in real life it risks a side-on collision.",
      },
      {
        id: "b",
        text: "Yield, wait for the car to pass, then enter when there is a safe gap",
        correct: true,
        consequence:
          "Correct. Traffic already in the circle (approaching from your right) has right of way. You wait, then enter safely and signal left before your exit.",
      },
      {
        id: "c",
        text: "Stop completely and wait for the circle to be totally empty",
        correct: false,
        consequence:
          "Over-cautious. You only need to yield to traffic from the right, not wait for an empty circle — this can frustrate and confuse following traffic.",
      },
    ],
    debrief:
      "At a traffic circle, yield to vehicles already in it (they come from your right), enter on a safe gap, keep left, and signal left just before you leave.",
  },
  {
    id: "sc_pedestrian",
    categoryId: "hazard_awareness",
    image: signImg("pedestrians"),
    title: "Ball into the road",
    situation:
      "You are doing 50 km/h on a suburban street. A ball rolls into the road from between two parked cars about 30 m ahead.",
    prompt: "Your first reaction is to…",
    choices: [
      {
        id: "a",
        text: "Carry on — it is only a ball",
        correct: false,
        consequence:
          "Where a ball goes, a child often follows. Carrying on at speed leaves no margin if a child runs out chasing it.",
      },
      {
        id: "b",
        text: "Ease off, cover the brake and prepare to stop",
        correct: true,
        consequence:
          "Correct. You read the hazard early: a ball suggests a child nearby. Slowing and covering the brake buys you reaction time.",
      },
      {
        id: "c",
        text: "Swerve into the oncoming lane to avoid where the ball was",
        correct: false,
        consequence:
          "Swerving into oncoming traffic creates a worse hazard. Controlled braking in your lane is safer.",
      },
    ],
    debrief:
      "Hazard perception is about cause and effect: a ball implies a child. Reduce speed and cover the brake before the hazard fully appears.",
  },
  {
    id: "sc_following",
    categoryId: "following_distance",
    title: "Rain on the highway",
    situation:
      "It starts raining heavily on the freeway. You were keeping a two-second gap behind the car ahead at 120 km/h.",
    prompt: "What should you change?",
    choices: [
      {
        id: "a",
        text: "Nothing — two seconds is always enough",
        correct: false,
        consequence:
          "Wet roads can double your braking distance. Two seconds that was safe in the dry is no longer enough.",
      },
      {
        id: "b",
        text: "Increase the gap to at least 3–4 seconds and reduce speed",
        correct: true,
        consequence:
          "Correct. You extend the following distance and ease off the speed to match the reduced grip and visibility.",
      },
      {
        id: "c",
        text: "Move closer so you can see the car's tail lights better",
        correct: false,
        consequence:
          "Moving closer removes your safety buffer exactly when you need it most. Hold back further in the rain.",
      },
    ],
    debrief:
      "Following distance is not fixed. In rain, fog or at night, increase the two-second rule to three or four seconds and slow down.",
  },
  {
    id: "sc_4way",
    categoryId: "intersections",
    title: "The crowded four-way stop",
    situation:
      "You arrive at a four-way stop. A bakkie to your right stopped just before you. A car opposite you arrived after you.",
    prompt: "Whose turn is it to go, and when is yours?",
    choices: [
      {
        id: "a",
        text: "You go first because you are going straight",
        correct: false,
        consequence:
          "Direction of travel does not override order of arrival. The bakkie stopped before you and goes first.",
      },
      {
        id: "b",
        text: "The bakkie on the right goes first; you go next; the opposite car after you",
        correct: true,
        consequence:
          "Correct. Order of stopping decides the sequence. The bakkie stopped first, then you, then the later-arriving car opposite.",
      },
      {
        id: "c",
        text: "Everyone edges out together and sorts it out",
        correct: false,
        consequence:
          "Edging out together causes confusion and collisions. The four-way stop has a clear order: first to stop, first to go.",
      },
    ],
    debrief:
      "Four-way stops run on order of arrival. If two vehicles stop together, the one on the right has priority.",
  },
  {
    id: "sc_parking",
    categoryId: "parking",
    title: "Quick stop at the shops",
    situation:
      "You want to dash into a shop. The closest space is right next to a 'no stopping' sign, but you will 'only be a minute'.",
    prompt: "What do you do?",
    choices: [
      {
        id: "a",
        text: "Stop there — you will only be a minute",
        correct: false,
        consequence:
          "A no-stopping sign means no stopping at all, not even briefly. You risk a fine and may obstruct sightlines or traffic flow.",
      },
      {
        id: "b",
        text: "Find a legal parking space, even if it means walking further",
        correct: true,
        consequence:
          "Correct. No stopping means exactly that. Park legally — the short walk is worth avoiding a fine and a hazard.",
      },
      {
        id: "c",
        text: "Stop but leave your hazard lights on",
        correct: false,
        consequence:
          "Hazard lights do not make illegal stopping legal. The restriction still applies.",
      },
    ],
    debrief:
      "'No stopping' is stricter than 'no parking': you may not stop for any reason in the zone. Hazard lights do not create an exemption.",
  },
  {
    id: "sc_overtake",
    categoryId: "rules",
    image: signImg("no_overtaking"),
    title: "Slow truck on a barrier line",
    situation:
      "You are stuck behind a slow truck on a single-lane road. There is a solid (no-overtaking) line and a blind rise ahead.",
    prompt: "What is the safe and legal choice?",
    choices: [
      {
        id: "a",
        text: "Overtake quickly — the truck is too slow",
        correct: false,
        consequence:
          "Overtaking across a barrier line near a blind rise means you cannot see oncoming traffic. This is illegal and a common cause of head-on crashes.",
      },
      {
        id: "b",
        text: "Stay back, be patient, and only overtake where it is legal and you can see far enough ahead",
        correct: true,
        consequence:
          "Correct. You wait for a broken line with a clear, long view before overtaking. Patience here genuinely saves lives.",
      },
      {
        id: "c",
        text: "Tailgate the truck to pressure it to speed up",
        correct: false,
        consequence:
          "Tailgating removes your reaction space and does not make the truck faster — it just makes a rear-end crash more likely.",
      },
    ],
    debrief:
      "Never overtake on a barrier line, blind rise or bend. Only pass where the line is broken and you can clearly see the road is clear far enough ahead.",
  },
  {
    id: "sc_robot_dead",
    categoryId: "intersections",
    title: "Load-shedding intersection",
    situation:
      "During load-shedding you reach a major intersection where the traffic lights are completely dead. Cars are approaching from all four directions.",
    prompt: "How should you treat it?",
    choices: [
      {
        id: "a",
        text: "Whoever is biggest or fastest goes first",
        correct: false,
        consequence:
          "Might-is-right is not a rule. It causes gridlock and crashes at dead intersections.",
      },
      {
        id: "b",
        text: "Treat it as a four-way stop — stop, then go in order of arrival",
        correct: true,
        consequence:
          "Correct. A dead traffic light becomes a four-way stop: everyone stops and proceeds in turn, yielding to the right when simultaneous.",
      },
      {
        id: "c",
        text: "Drive through without stopping if your direction looks clear",
        correct: false,
        consequence:
          "Not stopping at a dead robot is dangerous and illegal — cross traffic is doing the same from other directions.",
      },
    ],
    debrief:
      "When signals fail, the intersection is a four-way stop. Stop fully, take your turn by order of arrival, and yield to the right if you arrive together.",
  },
  {
    id: "sc_emergency",
    categoryId: "hazard_awareness",
    title: "Siren behind you",
    situation:
      "You are in moving traffic when an ambulance approaches from behind with lights and siren on.",
    prompt: "What is the correct response?",
    choices: [
      {
        id: "a",
        text: "Stop dead immediately in your lane",
        correct: false,
        consequence:
          "Stopping dead in a live lane can block the ambulance and cause a rear-end crash. You need to move aside, not just stop.",
      },
      {
        id: "b",
        text: "Safely pull to the left and slow or stop to let it pass, without breaking the law dangerously",
        correct: true,
        consequence:
          "Correct. You give way by moving to the left when safe, clearing a path. You should not jump a red light dangerously to do so.",
      },
      {
        id: "c",
        text: "Speed up to stay ahead of it",
        correct: false,
        consequence:
          "Racing ahead of an emergency vehicle is dangerous and delays it. Move aside and let it through.",
      },
    ],
    debrief:
      "Yield to emergency vehicles by moving left and slowing/stopping where safe — but never by making a dangerous or illegal manoeuvre.",
  },
  {
    id: "sc_amber",
    categoryId: "intersections",
    image: signImg("robot_amber"),
    title: "The light turns amber",
    situation:
      "You are 10 m from the line at 60 km/h when the green light turns amber. There is a car close behind you.",
    prompt: "What is the safest, correct action?",
    choices: [
      {
        id: "a",
        text: "Accelerate hard to beat the red",
        correct: false,
        consequence:
          "Speeding up to beat a red is how side-impact crashes happen, and amber means stop. It is not a cue to accelerate.",
      },
      {
        id: "b",
        text: "Stop if you can do so safely; if you are too close to stop without slamming on, proceed with care",
        correct: true,
        consequence:
          "Correct. Amber means stop unless stopping cannot be done safely. From 10 m at 60 km/h you usually can't stop in time, so clear the intersection carefully — but never speed up.",
      },
      {
        id: "c",
        text: "Brake as hard as you possibly can regardless",
        correct: false,
        consequence:
          "Slamming on with a car close behind invites a rear-end crash. The decision is whether you can stop safely, not at any cost.",
      },
    ],
    debrief:
      "Amber = stop, unless you are so close that stopping would be unsafe. Decide early and never treat amber as 'hurry up'.",
  },
  {
    id: "sc_school",
    categoryId: "hazard_awareness",
    image: signImg("children"),
    title: "School's out",
    situation:
      "You pass a 'children' warning sign near a school at home time. Kids are walking on both pavements and a bus is stopped ahead.",
    prompt: "How should you drive through here?",
    choices: [
      {
        id: "a",
        text: "Keep to the limit — they should stay on the pavement",
        correct: false,
        consequence:
          "Children are unpredictable and may dart out, especially around a stopped bus. The limit may be too fast for the conditions.",
      },
      {
        id: "b",
        text: "Slow well down, cover the brake and watch for children stepping out, especially near the bus",
        correct: true,
        consequence:
          "Correct. You read the warning sign and the scene, reduce speed below the limit if needed, and stay ready to stop.",
      },
      {
        id: "c",
        text: "Hoot continuously to warn the children",
        correct: false,
        consequence:
          "Hooting doesn't replace slowing down and can startle people. Lower speed and readiness to stop is what keeps them safe.",
      },
    ],
    debrief:
      "Near schools and stopped buses, drop your speed and cover the brake. The legal limit is a maximum, not a target — drive to the conditions.",
  },
  {
    id: "sc_railway",
    categoryId: "hazard_awareness",
    image: signImg("railway"),
    title: "Boom at the crossing",
    situation:
      "You approach a railway level crossing. The warning lights start flashing and the boom begins to lower as you near the tracks.",
    prompt: "What do you do?",
    choices: [
      {
        id: "a",
        text: "Speed up and cross before the boom is fully down",
        correct: false,
        consequence:
          "Beating a lowering boom is how fatal train collisions happen — a train cannot stop for you and may arrive sooner than it looks.",
      },
      {
        id: "b",
        text: "Stop behind the line and wait for the lights to stop and the boom to lift",
        correct: true,
        consequence:
          "Correct. Trains always have right of way. You stop well back and only cross once the warning has stopped and the boom is fully up.",
      },
      {
        id: "c",
        text: "Drive around the boom if no train is visible yet",
        correct: false,
        consequence:
          "Going around a boom is illegal and lethal. Visibility and timing at crossings are deceptive — never gamble with a train.",
      },
    ],
    debrief:
      "At a railway crossing, flashing lights or a lowering boom mean stop and wait. Trains can't stop for you and always have right of way.",
  },
  {
    id: "sc_lane_change",
    categoryId: "hazard_awareness",
    title: "Changing lanes on the freeway",
    situation:
      "On a busy three-lane freeway you want to move one lane to the right to pass a slower vehicle. Your mirrors look clear.",
    prompt: "Before moving across, you should:",
    choices: [
      {
        id: "a",
        text: "Move over now — the mirrors are clear",
        correct: false,
        consequence:
          "Mirrors have a blind spot. A vehicle sitting alongside you won't show, and moving on mirrors alone risks side-swiping it.",
      },
      {
        id: "b",
        text: "Signal, then do a quick shoulder check of the blind spot before moving smoothly across",
        correct: true,
        consequence:
          "Correct. Mirror, signal, blind-spot check, then manoeuvre. The shoulder glance catches anything the mirrors miss.",
      },
      {
        id: "c",
        text: "Swerve across quickly so you spend less time exposed",
        correct: false,
        consequence:
          "A sudden swerve gives others no time to react and unsettles the car. A smooth, checked lane change is safer.",
      },
    ],
    debrief:
      "Always follow mirror–signal–blind-spot–manoeuvre. The blind-spot shoulder check is what the mirrors cannot do for you.",
  },
  {
    id: "sc_steep_descent",
    categoryId: "following_distance",
    image: signImg("steep_descent"),
    title: "Long mountain pass",
    situation:
      "A 'steep descent' sign marks the top of a long mountain pass. You are in a high gear and the road drops away ahead.",
    prompt: "How should you tackle the descent?",
    choices: [
      {
        id: "a",
        text: "Stay in high gear and ride the brakes the whole way down",
        correct: false,
        consequence:
          "Riding the brakes down a long pass overheats them and can cause brake fade — exactly when you need them most.",
      },
      {
        id: "b",
        text: "Select a lower gear before the descent and let engine braking control your speed",
        correct: true,
        consequence:
          "Correct. A lower gear uses engine braking to hold your speed, sparing the brakes. Keep a larger gap, too, as stopping distances grow downhill.",
      },
      {
        id: "c",
        text: "Knock it into neutral and coast",
        correct: false,
        consequence:
          "Coasting in neutral removes engine braking and control — speed builds quickly and you're relying only on the brakes.",
      },
    ],
    debrief:
      "Heed the steep-descent sign: change down before the hill, use engine braking, keep extra following distance and avoid continuous braking.",
  },
  {
    id: "sc_yield_junction",
    categoryId: "intersections",
    image: signImg("yield"),
    title: "Yield onto the main road",
    situation:
      "A yield sign faces you as your road meets a busier main road. Traffic on the main road is steady but has gaps.",
    prompt: "What should you do?",
    choices: [
      {
        id: "a",
        text: "Come to a full stop and wait, even though the way is clear",
        correct: false,
        consequence:
          "A yield sign is not a stop sign. Stopping unnecessarily when there's a clear, safe gap can frustrate and surprise traffic behind you.",
      },
      {
        id: "b",
        text: "Slow down, give way to main-road traffic, and pull out in a safe gap without stopping if it's clear",
        correct: true,
        consequence:
          "Correct. Yield means give way: adjust speed, judge the gap, and join smoothly. Stop only if you must to let traffic pass.",
      },
      {
        id: "c",
        text: "Maintain speed and force your way into the gap",
        correct: false,
        consequence:
          "Forcing in takes right of way you don't have. Main-road traffic has priority and may not be able to avoid you.",
      },
    ],
    debrief:
      "A yield sign means give way to the through road and merge in a safe gap. You only need to stop if traffic doesn't allow a safe entry.",
  },
  {
    id: "sc_fatigue",
    categoryId: "hazard_awareness",
    title: "The long night drive",
    situation:
      "Two hours into a night drive you catch yourself blinking slowly and drifting toward the line. You're still 150 km from home.",
    prompt: "What is the right call?",
    choices: [
      {
        id: "a",
        text: "Push on — you're more than halfway",
        correct: false,
        consequence:
          "Micro-sleeps at speed are deadly. 'Almost there' is exactly the thinking that causes fatigue crashes.",
      },
      {
        id: "b",
        text: "Pull off at a safe place, rest or nap, and only continue once you're alert",
        correct: true,
        consequence:
          "Correct. The only real cure for fatigue is rest. Stop somewhere safe, take a break or a short nap, and resume when you're genuinely alert.",
      },
      {
        id: "c",
        text: "Wind down the window and speed up to get home sooner",
        correct: false,
        consequence:
          "Cold air gives a few minutes' false alertness; speeding shortens your reaction time further. Neither fixes fatigue.",
      },
    ],
    debrief:
      "Drowsiness impairs you like alcohol. Recognise the signs early — drifting, heavy eyes — and stop to rest. No trick substitutes for sleep.",
  },
];

/** Core (universal) scenarios plus the vehicle-code–specific ones. */
export const SCENARIOS: Scenario[] = [...CORE_SCENARIOS, ...VEHICLE_SCENARIOS];

export const SCENARIOS_BY_ID: Record<string, Scenario> = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s]),
);

export function scenariosByCategory(categoryId: Scenario["categoryId"]) {
  return SCENARIOS.filter((s) => s.categoryId === categoryId);
}
