import type { Question } from "@/types";

/**
 * Vehicle controls — faults, maintenance checks and control technique.
 * Facts trace to docs/content/facts/controls-yard.md.
 *
 * Sized to unlock code 08. Controls and the rules group sat exactly level at ten
 * distinct mock papers, so growing rules alone would have gained code 08
 * nothing — the smallest section caps the count, and both were the smallest.
 * Universal (no `codes`), so all three codes gain it.
 *
 * Covers the ground the existing packs leave: symptoms of a developing fault,
 * the checks that catch them, and the controls whose misuse is invisible until
 * it matters. No item turns on a regulated numeric threshold.
 */
export const CONTROLS_LIFT_QUESTIONS: Question[] = [
  // ── Developing faults ───────────────────────────────────────
  {
    id: "qc3_handbrake_partly_on",
    categoryId: "controls",
    prompt: "You drive off and notice a warning light plus a faint burning smell after a few hundred metres. The most likely cause is:",
    options: [
      "The handbrake is still partly applied",
      "The engine oil is low",
      "A tyre is under-inflated",
      "The clutch needs adjustment",
    ],
    correctIndex: 0,
    explanation:
      "Driving with the handbrake partly on overheats the rear brakes and can glaze or destroy them. Stop, release it fully, and let them cool before driving on.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc3_spongy_pedal",
    categoryId: "controls",
    prompt: "The brake pedal feels soft and travels closer to the floor than usual. You should:",
    options: [
      "Treat it as a brake fault and have it checked before driving further",
      "Pump the pedal and carry on as normal",
      "Adjust the handbrake to compensate",
      "Ignore it unless the brakes stop working entirely",
    ],
    correctIndex: 0,
    explanation:
      "A soft pedal usually means air or fluid loss in the system. It rarely improves on its own, and the failure it precedes tends to arrive when you brake hardest.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc3_pulls_under_braking",
    categoryId: "controls",
    prompt: "Under firm braking the car pulls noticeably to one side. This suggests:",
    options: [
      "Uneven braking or a suspension or tyre problem — it needs checking, not compensating for",
      "Normal behaviour on a cambered road",
      "That the ABS is working correctly",
      "That the handbrake needs adjusting",
    ],
    correctIndex: 0,
    explanation:
      "Uneven braking force steers the car for you, and it gets worse the harder you brake — which is exactly when you need it to go straight. Steering around it is not a fix.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qc3_steering_play",
    categoryId: "controls",
    prompt: "There is noticeable free play at the steering wheel before the wheels respond. This means:",
    options: [
      "Wear in the steering system — your inputs are delayed exactly when precision matters",
      "The power steering is working normally",
      "The tyres are over-inflated",
      "The wheel alignment is correct",
    ],
    correctIndex: 0,
    explanation:
      "Play means a gap between what you ask and what the car does. In an emergency swerve that gap is distance travelled in the wrong direction.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qc3_bonnet_unlatched",
    categoryId: "controls",
    prompt: "The bonnet feels loose or the warning light shows it is not properly closed. You should:",
    options: [
      "Stop and close it properly — at speed it can fly up and block your view entirely",
      "Drive slowly with your head out of the window",
      "Continue and close it at your destination",
      "Rely on the safety catch to hold it",
    ],
    correctIndex: 0,
    explanation:
      "A bonnet that opens at speed covers the whole windscreen at once. The secondary catch is a backup, not a licence to drive with the primary one undone.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qc3_windscreen_chip",
    categoryId: "controls",
    prompt: "A stone chip has left a small crack in the windscreen directly in your line of sight. You should:",
    options: [
      "Have it repaired — damage in the driver's view obstructs vision and spreads over time",
      "Ignore it while it is small",
      "Cover it with tape until convenient",
      "Only act on it if it fails a roadworthy test",
    ],
    correctIndex: 0,
    explanation:
      "A crack in the driver's field of view scatters light, especially at night and into low sun, and temperature changes make it grow. Small is the cheapest time to fix it.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Checks and consequences ─────────────────────────────────
  {
    id: "qc3_low_pressure_handling",
    categoryId: "controls",
    prompt: "Driving on significantly under-inflated tyres affects the vehicle by:",
    options: [
      "Making steering vague, lengthening stopping distance and overheating the tyre",
      "Improving grip because more rubber touches the road",
      "Affecting only fuel consumption",
      "Making the ride harsher",
    ],
    correctIndex: 0,
    explanation:
      "A soft tyre flexes and builds heat, which is what causes a blowout at speed. It also rolls on its edges, so the part designed to grip is not the part doing the work.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc3_wheel_nuts_recheck",
    categoryId: "controls",
    prompt: "After changing a wheel at the roadside, you should:",
    options: [
      "Recheck the wheel nuts for tightness after driving a short distance",
      "Assume they are fine if the wheel does not wobble immediately",
      "Loosen them slightly so the wheel can settle",
      "Only recheck them at the next service",
    ],
    correctIndex: 0,
    explanation:
      "Nuts bed down as the wheel seats against the hub, so ones that felt tight can slacken within a few kilometres. It is a thirty-second check against losing a wheel.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc3_warning_triangle_place",
    categoryId: "controls",
    prompt: "Broken down on the shoulder of a busy road, your warning triangle should be placed:",
    options: [
      "Well back along the road, far enough for approaching drivers to react before they reach you",
      "Directly against the rear bumper",
      "On the roof of the vehicle",
      "Only if the breakdown happens at night",
    ],
    correctIndex: 0,
    explanation:
      "A triangle at the bumper warns drivers at the moment they arrive, which is too late. Set it back so traffic can see it, understand it and change lanes in time — and stand off the road while you do.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc3_headlight_aim_loaded",
    categoryId: "controls",
    prompt: "With a heavily loaded boot, your headlights may:",
    options: [
      "Aim too high and dazzle oncoming drivers, so the beam should be adjusted if the car allows it",
      "Aim too low and become useless",
      "Be unaffected — headlights are fixed",
      "Automatically switch to main beam",
    ],
    correctIndex: 0,
    explanation:
      "Weight in the back lifts the nose and lifts the beam with it. Many cars have a levelling control for exactly this; using it is the difference between lighting the road and blinding people.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qc3_jump_start_order",
    categoryId: "controls",
    prompt: "Jump-starting a flat battery, the safe approach is to:",
    options: [
      "Connect and disconnect the leads in the correct order, keeping them clear of moving engine parts",
      "Connect either lead to either terminal — the order makes no difference",
      "Rev both engines hard throughout",
      "Leave both vehicles in gear while connecting",
    ],
    correctIndex: 0,
    explanation:
      "A battery gives off flammable gas and the leads carry enough current to weld. Order matters because the last connection is where a spark happens — it belongs away from the battery.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Using the controls well ─────────────────────────────────
  {
    id: "qc3_fog_lights_use",
    categoryId: "controls",
    prompt: "Rear fog lights should be:",
    options: [
      "Switched on only when visibility is genuinely poor, and off again once it clears",
      "Left on at night for extra visibility",
      "Used instead of headlights in rain",
      "Used whenever you are on a freeway",
    ],
    correctIndex: 0,
    explanation:
      "A rear fog light is far brighter than a tail light. In clear conditions it dazzles the driver behind and masks your brake lights — the opposite of what you want them to see.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc3_cruise_control_when_not",
    categoryId: "controls",
    prompt: "Cruise control should NOT be used:",
    options: [
      "In heavy traffic, on wet or slippery roads, or on winding roads",
      "On long straight stretches of freeway",
      "When travelling alone",
      "In daylight",
    ],
    correctIndex: 0,
    explanation:
      "Cruise control holds speed when you should be varying it, and adds a step between you and slowing down. In the wet it can also drive a slipping wheel rather than easing off.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc3_block_gear_change",
    categoryId: "controls",
    prompt: "Changing directly from a higher gear to a much lower one (for example fifth to second) when slowing:",
    options: [
      "Is acceptable when the road speed suits the gear you select — you need not work down through every gear",
      "Is always wrong; every gear must be used in turn",
      "Will damage the gearbox in any modern car",
      "Is only permitted in an automatic",
    ],
    correctIndex: 0,
    explanation:
      "Brakes do the slowing; gears match the engine to the speed you have reached. Selecting the gear that suits that speed is both smoother and less work than shuffling down through each one.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qc3_over_revving",
    categoryId: "controls",
    prompt: "Holding the engine near the top of the rev counter between gear changes:",
    options: [
      "Wastes fuel and stresses the engine without adding useful acceleration",
      "Is necessary to keep the engine from stalling",
      "Improves fuel consumption",
      "Is required before every gear change",
    ],
    correctIndex: 0,
    explanation:
      "Past a point the engine is making noise rather than progress. Changing up as the car gains speed is quieter, cheaper and easier on the machinery.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc3_convex_mirror_distance",
    categoryId: "controls",
    prompt: "A convex (curved) door mirror gives a wider view but:",
    options: [
      "Makes vehicles appear smaller and further away than they really are",
      "Makes vehicles appear closer than they really are",
      "Shows an accurate distance in all conditions",
      "Removes the blind spot entirely",
    ],
    correctIndex: 0,
    explanation:
      "The wider field comes at the cost of scale, so a car that looks comfortably back may be right beside you. It is another reason the blind-spot check is a head turn, not a glance.",
    difficulty: 3,
    scope: "learners",
  },
];
