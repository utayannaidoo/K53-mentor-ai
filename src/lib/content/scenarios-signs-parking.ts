import type { Scenario } from "@/types";
import { signImg } from "./signs";

/**
 * Scenarios for the two categories the scenario bank had almost nothing in.
 *
 * Before this pack there was exactly one parking scenario and one signs
 * scenario — and the signs one is gated to motorcycle codes, so a code 08
 * learner met none at all. Since a session serves 12 from a pool of roughly
 * that size, the imbalance was very visible: hazard-awareness scenarios came up
 * constantly and these two never did.
 *
 * All universal (no `codes`), so every licence code gains the full batch.
 *
 * Scenarios test judgement rather than recall — the question is what you *do*,
 * with each wrong choice explaining the consequence rather than just being
 * marked wrong. Kept off regulated numeric thresholds, which belong in the
 * question packs against a cited regulation.
 */
export const SIGNS_PARKING_SCENARIOS: Scenario[] = [
  // ── Parking ─────────────────────────────────────────────────
  {
    id: "sc_park_downhill_nokerb",
    categoryId: "parking",
    title: "Downhill on a gravel verge",
    situation:
      "You stop on a steep gravel road outside town, facing downhill. There is no kerb — just a soft verge and a drop beyond it.",
    prompt: "How do you leave the vehicle?",
    choices: [
      {
        id: "a",
        text: "Handbrake on, in gear, front wheels turned toward the edge of the road",
        correct: false,
        consequence:
          "Turning the wheels toward the drop means that if the vehicle does creep, it rolls off the road rather than into it. On a verge with a drop, that is the worst direction to aim it.",
      },
      {
        id: "b",
        text: "Handbrake on firmly, leave it in gear, and turn the front wheels so the vehicle would roll into the roadside bank",
        correct: true,
        consequence:
          "Correct. With no kerb to chock against, the wheels themselves are the backup — aim them so any creep runs the car into the bank and stops it. Handbrake plus a gear gives you two independent holds.",
      },
      {
        id: "c",
        text: "Handbrake on and leave it in neutral so it can be pushed if it blocks anyone",
        correct: false,
        consequence:
          "Neutral removes your second line of defence. On a steep slope the handbrake alone carries everything, and a cable that slips leaves nothing holding the vehicle.",
      },
    ],
    debrief:
      "On a slope, the handbrake is never the only thing holding the car. Leave it in gear (or Park) and point the front wheels so that any movement is arrested by the kerb or bank rather than sending it into the road or over an edge.",
  },
  {
    id: "sc_park_reverse_out_blocked",
    categoryId: "parking",
    title: "Boxed in by a panel van",
    situation:
      "You nosed into a shopping-centre bay. A high panel van has since parked alongside, and reversing out means backing blind into a lane where pedestrians and trolleys pass.",
    prompt: "What is the safest way out?",
    choices: [
      {
        id: "a",
        text: "Reverse out slowly in one movement, relying on the reversing camera",
        correct: false,
        consequence:
          "A camera shows what is directly behind, not what is about to walk into the gap from the side — which is exactly what the van is hiding.",
      },
      {
        id: "b",
        text: "Edge back in small movements, pausing to look each time, and get help or wait for the van to leave if you still cannot see",
        correct: true,
        consequence:
          "Correct. Small movements give anyone approaching time to see your bumper and stop, and give you a widening view. If the view never comes, waiting costs a few minutes.",
      },
      {
        id: "c",
        text: "Reverse out briskly so you spend as little time as possible blocking the lane",
        correct: false,
        consequence:
          "Speed is the opposite of what a blind manoeuvre needs. The less you can see, the slower you go — you are trading a few seconds against someone else's shins.",
      },
    ],
    debrief:
      "Reversing out blind is why K53 favours reversing *into* a bay: you do the difficult, sighted manoeuvre on arrival and drive out forwards. When you must back out blind, creep and look repeatedly rather than committing in one movement.",
  },
  {
    id: "sc_park_disabled_bay",
    categoryId: "parking",
    title: "The empty disabled bay",
    situation:
      "The centre is full. The only open space is a bay marked with the wheelchair symbol. You do not have a permit, and you are collecting a prescription that will take five minutes.",
    prompt: "What do you do?",
    choices: [
      {
        id: "a",
        text: "Use it — five minutes is not going to affect anyone",
        correct: false,
        consequence:
          "The bay is wide and close to the entrance for a reason, and it is needed unpredictably. Someone who cannot use an ordinary bay may arrive in those five minutes and have nowhere to go.",
      },
      {
        id: "b",
        text: "Park elsewhere, even if it means waiting or walking",
        correct: true,
        consequence:
          "Correct. A reserved bay without a permit is an offence, and the reservation is not about the length of your stay — it is about the bay being there when someone needs it.",
      },
      {
        id: "c",
        text: "Use it but leave your hazard lights on so people know you will not be long",
        correct: false,
        consequence:
          "Hazard lights do not create permission. They signal a hazard; they do not convert a reserved bay into a general one.",
      },
    ],
    debrief:
      "Bays reserved for disabled persons may only be used by a vehicle displaying a valid permit. Duration is irrelevant, and hazard lights never make an unlawful stop lawful.",
  },
  {
    id: "sc_park_loading_zone",
    categoryId: "parking",
    title: "The convenient loading zone",
    situation:
      "You need to drop paperwork at an office. Outside is a marked loading zone, currently empty. Ordinary bays are a block away.",
    prompt: "What do you do?",
    choices: [
      {
        id: "a",
        text: "Use the loading zone — you are technically dropping something off",
        correct: false,
        consequence:
          "A loading zone is for loading and offloading goods, not for a quick errand. If a delivery vehicle arrives while you are inside, it is forced into the traffic lane.",
      },
      {
        id: "b",
        text: "Park in an ordinary bay and walk",
        correct: true,
        consequence:
          "Correct. The zone exists so that delivery vehicles are not double-parked in a live lane. Leaving it clear keeps the traffic lane clear.",
      },
      {
        id: "c",
        text: "Use it, but stay in the car with the engine running so you can move if needed",
        correct: false,
        consequence:
          "Occupying the space is the problem, whether or not you are in the car — the delivery vehicle still has nowhere to go.",
      },
    ],
    debrief:
      "Loading zones are class-restricted by purpose, not by how long you stay. Blocking one pushes goods vehicles into the traffic lane, which is the exact hazard the zone was created to prevent.",
  },
  {
    id: "sc_park_door_cyclist",
    categoryId: "parking",
    title: "Opening the door on a busy road",
    situation:
      "You have parallel parked on a busy urban street with a cycle lane running along the kerb. You are ready to get out on the traffic side.",
    prompt: "Before you open the door, you…",
    choices: [
      {
        id: "a",
        text: "Open it slowly so anyone coming has time to go around",
        correct: false,
        consequence:
          "A slowly opening door still blocks the lane, and a cyclist arriving at speed has nowhere to go but into it or into traffic. Slow is not the same as checked.",
      },
      {
        id: "b",
        text: "Check the mirror and glance over your shoulder for cyclists and traffic, then open",
        correct: true,
        consequence:
          "Correct. The mirror catches most of it and the shoulder check catches what the mirror does not — which is exactly where a cyclist filtering up the kerb side will be.",
      },
      {
        id: "c",
        text: "Get out quickly so the door is open for the shortest possible time",
        correct: false,
        consequence:
          "Speed does not help if the door opens into someone already there. The check is what prevents the collision, not the duration.",
      },
    ],
    debrief:
      "Opening a door into traffic is the driver's responsibility, and a cyclist in the kerb lane is the classic victim. Mirror, then shoulder, then open — and prefer letting passengers out on the kerb side.",
  },
  {
    id: "sc_park_hidden_crest",
    categoryId: "parking",
    title: "A gap just over the rise",
    situation:
      "On a rural road you spot a level space to pull off, a few metres beyond the crest of a small hill. Traffic here moves quickly.",
    prompt: "Do you use it?",
    choices: [
      {
        id: "a",
        text: "Yes — it is off the road surface, so it is safe",
        correct: false,
        consequence:
          "Being off the surface is only half of it. Drivers coming over the crest see you very late, and anything you do next — a door opening, pulling away — happens inside their reaction distance.",
      },
      {
        id: "b",
        text: "No — carry on until you find somewhere you can be seen from well back",
        correct: true,
        consequence:
          "Correct. The problem with a crest or a bend is sight distance: approaching drivers get almost no warning. Somewhere visible from far back is worth the extra kilometre.",
      },
      {
        id: "c",
        text: "Yes, but leave the hazard lights on so you are visible",
        correct: false,
        consequence:
          "Hazard lights help once you are seen, but they cannot be seen through a hill. The sight line is the problem and lights do not fix it.",
      },
    ],
    debrief:
      "Never stop where approaching traffic cannot see you from a distance — just over a crest or around a bend. Rejoining from such a spot is just as dangerous as sitting in it.",
  },

  // ── Signs ───────────────────────────────────────────────────
  {
    id: "sc_sign_temp_vs_permanent",
    categoryId: "signs",
    image: signImg("speed_limit"),
    title: "Two speed limits, one road",
    situation:
      "A permanent sign gives the limit for this stretch as 100 km/h. A few hundred metres on, a yellow-backed temporary sign at roadworks reads 40 km/h. The road ahead looks clear and the workers seem to have gone home.",
    prompt: "What speed applies?",
    choices: [
      {
        id: "a",
        text: "100 km/h — the permanent sign is the real limit and the works are finished",
        correct: false,
        consequence:
          "Temporary signs override permanent ones for as long as they stand. 'Looks finished' is a guess: loose surface, missing markings or an open trench can remain long after the workers leave.",
      },
      {
        id: "b",
        text: "40 km/h, until a sign tells you the restriction has ended",
        correct: true,
        consequence:
          "Correct. A yellow temporary sign takes precedence over the permanent signage, and it applies until it is cancelled — not until the road looks normal to you.",
      },
      {
        id: "c",
        text: "Whatever is safe, since the temporary sign only applies when workers are present",
        correct: false,
        consequence:
          "The restriction is not conditional on anyone being on site. Unless a sub-plate says otherwise, it applies whenever it is displayed.",
      },
    ],
    debrief:
      "Temporary signs are printed on a yellow background precisely so they read as overriding the permanent signs beside them. They stand until cancelled, whether or not the hazard is visible to you.",
  },
  {
    id: "sc_sign_officer_vs_robot",
    categoryId: "signs",
    image: signImg("robot_green"),
    title: "Green light, raised hand",
    situation:
      "Your traffic light is green, but a traffic officer standing in the intersection is holding up a flat hand toward you and waving the cross-traffic through.",
    prompt: "What do you do?",
    choices: [
      {
        id: "a",
        text: "Proceed — your light is green and that is the legal signal",
        correct: false,
        consequence:
          "Driving into an intersection an officer is holding is dangerous and an offence. They can see something you cannot — a crash, a failed phase, an emergency vehicle on its way.",
      },
      {
        id: "b",
        text: "Stop and wait until the officer signals you forward, even though your light is green",
        correct: true,
        consequence:
          "Correct. A person directing traffic outranks the signals and the signs, because they are managing a situation the fixed signalling was never designed for.",
      },
      {
        id: "c",
        text: "Edge forward slowly to show the officer that your light is green",
        correct: false,
        consequence:
          "The officer knows what the lights are doing; that is usually why they are there. Edging forward pressures the crossing traffic they are trying to clear.",
      },
    ],
    debrief:
      "The order of authority is: a traffic officer's directions first, then traffic signals, then signs, then road markings. A green light permits movement — it never compels it.",
  },
  {
    id: "sc_sign_obscured",
    categoryId: "signs",
    title: "The sign behind the branch",
    situation:
      "Approaching an unfamiliar junction, you glimpse a red-ringed circular sign mostly hidden by an overgrown branch. You cannot read what is inside the ring.",
    prompt: "How do you treat it?",
    choices: [
      {
        id: "a",
        text: "Ignore it — an unreadable sign cannot reasonably be enforced",
        correct: false,
        consequence:
          "The restriction exists regardless of the branch, and so does whatever hazard it was put there for. Unreadable is not the same as absent.",
      },
      {
        id: "b",
        text: "Slow down, treat it as a restriction of some kind, and read the road for what it is protecting",
        correct: true,
        consequence:
          "Correct. The red ring alone tells you something is prohibited. Slowing gives you time to work out what the junction requires and to spot a repeat of the sign further on.",
      },
      {
        id: "c",
        text: "Maintain speed but note the location to report it later",
        correct: false,
        consequence:
          "Reporting it is worth doing, but it does nothing for the next few seconds — which is when the restriction actually applies to you.",
      },
    ],
    debrief:
      "A damaged, dirty or obscured sign still binds. Doubt about what a sign says is a reason to reduce speed and gather information, never a reason to assume nothing applies.",
  },
  {
    id: "sc_sign_subplate",
    categoryId: "signs",
    image: signImg("no_parking"),
    title: "The small print under the sign",
    situation:
      "You pull up at a no-parking sign. Beneath it, a smaller plate reads '08:00 – 17:00, Mon – Fri'. It is Saturday morning.",
    prompt: "What do you conclude?",
    choices: [
      {
        id: "a",
        text: "The restriction applies at all times — the plate is only advisory",
        correct: false,
        consequence:
          "The sub-plate is part of the sign, not a footnote to it. Treating it as advisory would have you obeying restrictions that do not apply.",
      },
      {
        id: "b",
        text: "The restriction applies only during those hours on those days, so parking here now is permitted",
        correct: true,
        consequence:
          "Correct. The plate qualifies the main sign — the times, days, distance or vehicle class it covers. Outside those hours the restriction is simply not in force.",
      },
      {
        id: "c",
        text: "The restriction applies on Saturday too, since weekends are usually busier",
        correct: false,
        consequence:
          "The sign says what it says. Guessing at the intent behind it, in either direction, is how drivers end up wrong.",
      },
    ],
    debrief:
      "Always read the plate under a sign before acting on the sign itself. It is where the times, the exempted vehicles and the distance covered are stated, and it can narrow a restriction as easily as extend it.",
  },
  {
    id: "sc_sign_height_limit",
    categoryId: "signs",
    title: "Low bridge, loaded roof rack",
    situation:
      "You are towing a caravan with bikes on a roof rack. Ahead, a red-ringed sign shows a height limit, and the figure looks close to your loaded height. You are not certain what the vehicle actually measures.",
    prompt: "What is the right call?",
    choices: [
      {
        id: "a",
        text: "Proceed slowly — if it looks tight you can stop before the bridge",
        correct: false,
        consequence:
          "By the time the clearance is obviously too low you may be committed, with a caravan behind you and nowhere to reverse. Bridge strikes are usually made by drivers who were 'nearly sure'.",
      },
      {
        id: "b",
        text: "Do not proceed until you know your loaded height, and take an alternative route if there is any doubt",
        correct: true,
        consequence:
          "Correct. The height limit is a prohibition and knowing the laden height of the vehicle is the driver's responsibility. A detour costs time; a strike costs the bridge and the load.",
      },
      {
        id: "c",
        text: "Follow a similar-looking vehicle through and match its line",
        correct: false,
        consequence:
          "Another vehicle's clearance tells you nothing about yours, and the roof rack is exactly the part you cannot see from the driver's seat.",
      },
    ],
    debrief:
      "A height, width, length or mass sign is a prohibition on the vehicle *including its load*. The driver is responsible for knowing the laden dimensions — a rack or a trailer changes them.",
  },
  {
    id: "sc_sign_no_overtaking_slow",
    categoryId: "signs",
    image: signImg("no_overtaking"),
    title: "Stuck behind a slow truck",
    situation:
      "A heavily loaded truck is crawling up a long climb. A no-overtaking sign stands at the bottom of the hill and a queue is building behind you. The oncoming lane looks empty from where you sit.",
    prompt: "What do you do?",
    choices: [
      {
        id: "a",
        text: "Overtake now while the oncoming lane is clear",
        correct: false,
        consequence:
          "The sign is there because the sight distance is not what it appears from behind a truck. What looks like an empty lane is the part of the road you can see — the restriction covers the part you cannot.",
      },
      {
        id: "b",
        text: "Stay back, keep a gap that improves your view, and wait for the restriction to end or a climbing lane to open",
        correct: true,
        consequence:
          "Correct. Dropping back widens your view and keeps you legal. Long climbs are exactly where climbing lanes are provided, and one is often only a minute or two away.",
      },
      {
        id: "c",
        text: "Move close behind the truck so you are ready to pass the moment the restriction ends",
        correct: false,
        consequence:
          "Sitting close removes your view of the road ahead and your stopping room, in return for a slightly earlier start on an overtake you cannot yet see is safe.",
      },
    ],
    debrief:
      "A no-overtaking restriction runs until a sign or marking cancels it, and it is placed on sight distance you cannot verify from behind a large vehicle. Hanging back is both the legal and the faster-seeing position.",
  },
];
