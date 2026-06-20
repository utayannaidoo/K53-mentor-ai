import type { Scenario } from "@/types";

export const SCENARIOS: Scenario[] = [
  {
    id: "sc_circle",
    categoryId: "intersections",
    sign: "traffic_circle",
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
    sign: "pedestrian",
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
    sign: "no_stopping",
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
      "‘No stopping’ is stricter than ‘no parking’: you may not stop for any reason in the zone. Hazard lights do not create an exemption.",
  },
  {
    id: "sc_overtake",
    categoryId: "rules",
    sign: "no_overtaking",
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
];

export const SCENARIOS_BY_ID: Record<string, Scenario> = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s]),
);

export function scenariosByCategory(categoryId: Scenario["categoryId"]) {
  return SCENARIOS.filter((s) => s.categoryId === categoryId);
}
