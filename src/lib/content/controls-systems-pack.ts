import type { Question } from "@/types";

/**
 * Vehicle controls — safety systems, skid control, night and wet driving,
 * emergencies, and the everyday checks that keep a vehicle usable.
 * Facts trace to docs/content/facts/controls-yard.md.
 *
 * Written for the "Controls only" section drill rather than the mock ceiling.
 * Controls stopped being the binding section some sprints ago — it now has the
 * most headroom of the three — so depth here buys distinct *drills* (8 questions
 * each) rather than distinct mock papers. That is the honest reason this pack
 * exists, and it is worth recording so nobody later mistakes it for ceiling work.
 *
 * Universal (no `codes`). No item turns on a regulated numeric threshold.
 */
export const CONTROLS_SYSTEMS_QUESTIONS: Question[] = [
  // ── Driver-assistance systems ───────────────────────────────
  {
    id: "qc5_abs_purpose",
    categoryId: "controls",
    prompt: "The purpose of an anti-lock braking system (ABS) is to:",
    options: [
      "Stop the wheels locking, so you keep steering control while braking hard",
      "Shorten stopping distance on every surface",
      "Apply the brakes for you when a hazard appears",
      "Prevent the vehicle from skidding under acceleration",
    ],
    correctIndex: 0,
    explanation:
      "A locked wheel slides and cannot be steered. ABS trades a little stopping distance on some surfaces for the ability to steer around what you are braking for.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc5_abs_not_shorter",
    categoryId: "controls",
    prompt: "On loose gravel or snow, ABS may actually:",
    options: [
      "Lengthen the stopping distance slightly, because a locked wheel would dig in and build a wedge of material",
      "Stop working altogether",
      "Halve the stopping distance",
      "Lock the wheels deliberately for grip",
    ],
    correctIndex: 0,
    explanation:
      "It is a genuine trade-off, not a flaw. You give up a little distance on loose surfaces and get steering control back, which is almost always the better bargain.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qc5_esc_purpose",
    categoryId: "controls",
    prompt: "Electronic stability control works by:",
    options: [
      "Braking individual wheels to pull the car back into line when it starts to slide",
      "Increasing engine power to drive out of a skid",
      "Locking the differential in corners",
      "Stiffening the suspension automatically",
    ],
    correctIndex: 0,
    explanation:
      "It compares where you are steering with where the car is actually going, and brakes one wheel to close the gap. It cannot exceed the grip available, so it delays trouble rather than abolishing it.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qc5_systems_not_substitute",
    categoryId: "controls",
    prompt: "ABS, stability control and traction control:",
    options: [
      "Help within the limits of available grip — they cannot make an unsafe speed safe",
      "Make a vehicle safe at any speed in any conditions",
      "Replace the need to leave a following distance",
      "Only operate above highway speeds",
    ],
    correctIndex: 0,
    explanation:
      "Every one of them works by managing grip that already exists. Drivers who treat them as a safety margin end up using the margin, and there is nothing left when it runs out.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc5_airbag_with_belt",
    categoryId: "controls",
    prompt: "An airbag is designed to work:",
    options: [
      "Together with a seatbelt — it is a supplement to the belt, not a replacement for it",
      "Instead of a seatbelt in modern cars",
      "Only for the driver, never for passengers",
      "Only in low-speed collisions",
    ],
    correctIndex: 0,
    explanation:
      "The belt holds you in position so the bag catches you correctly. Unbelted, you are already moving toward a bag that is still inflating, which is how airbags cause injury rather than prevent it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc5_reversing_camera_limits",
    categoryId: "controls",
    prompt: "A reversing camera or parking sensors should be treated as:",
    options: [
      "An aid that supplements looking around — they miss things approaching from the side",
      "A complete replacement for looking over your shoulder",
      "Reliable enough to reverse at normal road speed",
      "Accurate for judging the speed of approaching vehicles",
    ],
    correctIndex: 0,
    explanation:
      "A camera frames what is directly behind. A child running in from the side, or a cyclist coming up the kerb, arrives from outside that frame — and sensors rarely see them in time.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Skid control ────────────────────────────────────────────
  {
    id: "qc5_skid_cause",
    categoryId: "controls",
    prompt: "Skids are almost always caused by:",
    options: [
      "The driver asking more of the tyres than the surface can give — braking, steering or accelerating too hard for the conditions",
      "Faulty brakes",
      "Bad luck with the road surface",
      "Driving too slowly for the conditions",
    ],
    correctIndex: 0,
    explanation:
      "Grip is a budget shared between turning, stopping and accelerating. A skid is what happens when you spend more than you have, which is why smoothness is the whole defence.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc5_rear_skid_correct",
    categoryId: "controls",
    prompt: "The back of the car slides out to the right in a bend. You should:",
    options: [
      "Ease off, look where you want to go and steer gently in the direction the rear is sliding",
      "Brake hard immediately",
      "Steer sharply the opposite way",
      "Accelerate hard to pull the car straight",
    ],
    correctIndex: 0,
    explanation:
      "Steering into the slide points the front wheels where the car is actually travelling and lets it line up again. Braking or a sharp correction usually swaps one skid for a worse one in the other direction.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qc5_front_skid",
    categoryId: "controls",
    prompt: "You turn the wheel into a bend and the car carries on straight ahead. The right response is to:",
    options: [
      "Ease off the accelerator and reduce steering slightly, so the front tyres regain grip",
      "Turn the wheel further into the bend",
      "Brake as hard as you can",
      "Accelerate to transfer weight to the front",
    ],
    correctIndex: 0,
    explanation:
      "The front tyres are already asking for more than they have; adding lock asks for more still. Reducing both speed and steering angle is what gives them something back.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qc5_smoothness_principle",
    categoryId: "controls",
    prompt: "The single most useful habit for avoiding skids is:",
    options: [
      "Doing everything progressively — braking, steering and accelerating smoothly rather than suddenly",
      "Keeping a hand on the handbrake",
      "Driving in a lower gear at all times",
      "Using the brakes as little as possible",
    ],
    correctIndex: 0,
    explanation:
      "Sudden inputs are what break traction. A smooth driver is using the same grip more gradually, which is why they rarely find its limit by accident.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Night and poor visibility ───────────────────────────────
  {
    id: "qc5_main_beam_when",
    categoryId: "controls",
    prompt: "Main-beam headlights should be dipped:",
    options: [
      "When you meet oncoming traffic and when following another vehicle closely",
      "Only when meeting oncoming traffic",
      "Only in built-up areas",
      "Only when it starts to rain",
    ],
    correctIndex: 0,
    explanation:
      "Following traffic is the half drivers forget. Your main beam fills the mirror of the car ahead and dazzles that driver just as effectively as an oncoming one.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc5_fog_lights_front",
    categoryId: "controls",
    prompt: "Front fog lights are designed to:",
    options: [
      "Throw a wide, low beam under the fog rather than reflecting off it",
      "Shine further ahead than main beam",
      "Replace headlights in fog",
      "Make the vehicle more visible from behind",
    ],
    correctIndex: 0,
    explanation:
      "Main beam in fog bounces straight back as glare. Fog lights sit low and spread wide to light the road surface and the verge, which is what you actually steer by.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc5_dirty_lights",
    categoryId: "controls",
    prompt: "After a long trip on a dusty or wet road, headlights and tail lights should be:",
    options: [
      "Wiped clean — a film of dirt cuts their output dramatically",
      "Left alone, since the lenses are sealed",
      "Cleaned only at a service",
      "Polished with an abrasive to restore brightness",
    ],
    correctIndex: 0,
    explanation:
      "A grey film costs a surprising share of the light getting out and of your visibility to others. It is a thirty-second job with the same effect as an upgrade.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qc5_interior_light_night",
    categoryId: "controls",
    prompt: "Driving at night with the interior light on is unwise because:",
    options: [
      "It reflects in the glass and destroys your night vision",
      "It drains the battery quickly",
      "It is an offence in all circumstances",
      "It makes the headlights dimmer",
    ],
    correctIndex: 0,
    explanation:
      "Your eyes adjust to the brightest thing in view, and a lit cabin becomes exactly that. The road outside then looks far darker than it is.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc5_dashboard_brightness",
    categoryId: "controls",
    prompt: "Dashboard illumination should be dimmed at night mainly because:",
    options: [
      "A bright dash reduces how well your eyes adapt to the dark road ahead",
      "It uses less electricity",
      "The instruments last longer",
      "Bright dials are illegal after dark",
    ],
    correctIndex: 0,
    explanation:
      "Same principle as the interior light, in miniature. Most cars have a dimmer for this reason, and it is worth finding before you need it.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Wet weather ─────────────────────────────────────────────
  {
    id: "qc5_tread_water_job",
    categoryId: "controls",
    prompt: "The grooves in a tyre's tread exist mainly to:",
    options: [
      "Channel water out from under the tyre so the rubber can reach the road",
      "Make the tyre grip better on dry tar",
      "Reduce road noise",
      "Help the tyre run cooler",
    ],
    correctIndex: 0,
    explanation:
      "On a dry road a slick would grip best — the grooves are entirely about water. A worn tyre has nowhere to put it, which is why wet grip collapses long before the tyre looks finished.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc5_wipers_smear",
    categoryId: "controls",
    prompt: "Wiper blades that smear rather than clear the screen:",
    options: [
      "Should be replaced — smearing into low sun or oncoming headlights is close to blindness",
      "Only need cleaning with water",
      "Are normal once blades are a few months old",
      "Can be ignored if the rain is light",
    ],
    correctIndex: 0,
    explanation:
      "A smeared screen is fine until you drive into glare, at which point the whole windscreen goes opaque. It is one of the cheapest fixes on the car.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qc5_demist_fastest",
    categoryId: "controls",
    prompt: "The fastest way to clear a misted-up windscreen is to:",
    options: [
      "Use the demister with the air conditioning on, which dries the air",
      "Wipe it with a cloth and drive on",
      "Open all the windows and drive faster",
      "Turn the heater off so the glass cools",
    ],
    correctIndex: 0,
    explanation:
      "Misting is moisture condensing on cold glass. Air conditioning removes the moisture rather than just moving it around, which is why it clears far faster than wiping.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qc5_wet_brake_test",
    categoryId: "controls",
    prompt: "After driving through standing water, you should:",
    options: [
      "Test the brakes gently at low speed and dry them with light pressure if they feel weak",
      "Brake hard once at speed to clear them",
      "Assume they are fine if the pedal feels normal",
      "Drive faster so airflow dries them",
    ],
    correctIndex: 0,
    explanation:
      "Water between pad and disc removes most of the friction. Light, sustained pressure at low speed heats and wipes them dry — and the test tells you whether you needed to.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Emergencies ─────────────────────────────────────────────
  {
    id: "qc5_engine_fire",
    categoryId: "controls",
    prompt: "Smoke starts coming from under the bonnet. You should:",
    options: [
      "Stop, switch off, get everyone well clear, and not open the bonnet fully",
      "Open the bonnet immediately to see what is burning",
      "Keep driving to the nearest garage",
      "Pour water over the bonnet while the engine runs",
    ],
    correctIndex: 0,
    explanation:
      "Lifting the bonnet feeds the fire a rush of air. Switch off to cut the fuel and electrical supply, get people away, and call for help rather than investigating.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qc5_stuck_in_water",
    categoryId: "controls",
    prompt: "Your vehicle stalls in rising water. The priority is to:",
    options: [
      "Get out and to higher ground immediately — the vehicle is replaceable and water rises fast",
      "Stay inside and wait for the water to recede",
      "Try repeatedly to restart the engine",
      "Open the bonnet to dry the electrics",
    ],
    correctIndex: 0,
    explanation:
      "Moving water shifts a car in surprisingly little depth, and doors become impossible to open against pressure. Leaving early is the only reliable option.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qc5_breakdown_position",
    categoryId: "controls",
    prompt: "Broken down on a busy road, you and your passengers are safest:",
    options: [
      "Out of the vehicle and well off the road, behind a barrier where there is one",
      "Sitting in the vehicle with seatbelts on",
      "Standing directly behind the vehicle to warn traffic",
      "Standing beside the driver's door",
    ],
    correctIndex: 0,
    explanation:
      "A stationary vehicle on a fast road is the thing most likely to be hit, so being inside it is the worst place to be. Get everyone out on the verge side and away from the traffic.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qc5_warning_triangle_carry",
    categoryId: "controls",
    prompt: "A warning triangle is only useful if:",
    options: [
      "It is carried, accessible, and actually set out well behind the vehicle when you break down",
      "It is stored in the boot under the luggage",
      "It is displayed inside the rear window",
      "It is used only at night",
    ],
    correctIndex: 0,
    explanation:
      "Plenty of cars carry one buried under everything else. If you cannot reach it in seconds, or you set it down at the bumper, it does nothing for the driver approaching at speed.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Everyday checks and habits ──────────────────────────────
  {
    id: "qc5_fuel_wrong_type",
    categoryId: "controls",
    prompt: "You realise you have put the wrong fuel in the tank. You should:",
    options: [
      "Not start the engine, and have the vehicle attended to before it is run",
      "Start it and drive gently to a workshop",
      "Top up with the correct fuel to dilute it",
      "Start it and let it idle to clear the system",
    ],
    correctIndex: 0,
    explanation:
      "As long as the wrong fuel stays in the tank the damage is limited. Starting the engine pumps it through the whole fuel system and turns an inconvenience into a large bill.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc5_tyre_pressure_cold",
    categoryId: "controls",
    prompt: "Tyre pressures should be checked:",
    options: [
      "When the tyres are cold, since driving heats the air and raises the reading",
      "Immediately after a long fast drive",
      "Only when a tyre looks flat",
      "Once a year at the roadworthy test",
    ],
    correctIndex: 0,
    explanation:
      "Hot tyres read high, so setting them warm leaves them under-inflated once they cool. Check them before you set off, not at the end of the journey.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc5_spare_check",
    categoryId: "controls",
    prompt: "The most commonly neglected item in a pre-trip check is:",
    options: [
      "The spare wheel's pressure and the presence of the jack and wheel spanner",
      "The interior mirror",
      "The fuel gauge",
      "The horn",
    ],
    correctIndex: 0,
    explanation:
      "A flat spare and a missing spanner are discovered at the roadside in the dark, which is the worst possible moment. Check them before a long trip, not during one.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qc5_washer_fluid",
    categoryId: "controls",
    prompt: "Running out of windscreen washer fluid matters because:",
    options: [
      "Wipers alone smear dust and insects across the glass and make visibility worse",
      "The wiper motor will burn out",
      "It is only a problem in winter",
      "The windscreen will crack",
    ],
    correctIndex: 0,
    explanation:
      "Dry wipers grind whatever is on the screen into a film. On a summer trip the insect layer alone can reduce a clear windscreen to a glare-catching mess.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qc5_warning_light_colours",
    categoryId: "controls",
    prompt: "On most dashboards, a red warning light rather than an amber one generally means:",
    options: [
      "Stop as soon as it is safe — red signals a fault that can damage the vehicle or endanger you",
      "The system is working normally",
      "A service is due at your convenience",
      "A bulb somewhere has failed",
    ],
    correctIndex: 0,
    explanation:
      "The colour is a severity code. Amber says get it looked at; red says the thing it monitors is failing now, which is why oil pressure and brakes are red.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc5_handbrake_ratchet",
    categoryId: "controls",
    prompt: "A handbrake that pulls up much further than it used to:",
    options: [
      "Needs adjustment — it may not hold the vehicle on a slope",
      "Is working better as the cable stretches",
      "Should simply be pulled harder",
      "Is normal and needs no attention",
    ],
    correctIndex: 0,
    explanation:
      "Cables stretch and shoes wear, so the lever travels further for less braking. The first real test of a neglected handbrake is usually a hill, which is a poor place to find out.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc5_seat_adjust_while_driving",
    categoryId: "controls",
    prompt: "Adjusting your seat position while driving is dangerous because:",
    options: [
      "The seat can slide unexpectedly, taking your feet off the pedals and your hands off the wheel",
      "It wears the seat rails",
      "It sets off the airbag warning",
      "It is only a problem in a manual vehicle",
    ],
    correctIndex: 0,
    explanation:
      "Releasing the catch at speed can let the seat run back on its rails. Suddenly you cannot reach the pedals or see properly, in the middle of traffic.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc5_mirror_blindspot_overlap",
    categoryId: "controls",
    prompt: "Door mirrors are best adjusted so that:",
    options: [
      "Their view just picks up where the interior mirror's view ends, minimising the gap between them",
      "They duplicate what the interior mirror already shows",
      "They both show as much of your own vehicle as possible",
      "They point at the road surface behind the wheels",
    ],
    correctIndex: 0,
    explanation:
      "Three mirrors covering the same view leave a large blind area on each side. Set so their fields just meet, and a vehicle overtaking passes from one mirror to the next without vanishing.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qc5_wheel_alignment_symptom",
    categoryId: "controls",
    prompt: "A car that pulls steadily to one side on a level, straight road most likely has:",
    options: [
      "A tyre pressure or wheel alignment problem — it also wears tyres unevenly",
      "A faulty handbrake",
      "Too much oil in the engine",
      "A blown fuse",
    ],
    correctIndex: 0,
    explanation:
      "You end up holding a constant correction without noticing, which is tiring and hides what the car is really doing. It also scrubs a tyre out long before its time.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qc5_engine_braking_meaning",
    categoryId: "controls",
    prompt: "'Engine braking' means:",
    options: [
      "Letting the engine slow the vehicle in a lower gear, instead of relying only on the brakes",
      "Switching the engine off to stop faster",
      "Braking hard enough to stall the engine",
      "Using the handbrake while the engine runs",
    ],
    correctIndex: 0,
    explanation:
      "The engine resists being turned, and in a low gear that resistance holds your speed down a hill. It costs nothing and saves the brakes for when you actually need them.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc5_child_seat_rear",
    categoryId: "controls",
    prompt: "A rear-facing child seat must never be fitted:",
    options: [
      "In a front seat with an active airbag in front of it",
      "In the back seat of any vehicle",
      "In a vehicle with ABS",
      "Behind the driver",
    ],
    correctIndex: 0,
    explanation:
      "An airbag deploys with enormous force into exactly where the child's head is. If the seat must go in front, the airbag has to be deactivated first.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc5_documents_carry",
    categoryId: "controls",
    prompt: "Before a long trip, the sensible document check is:",
    options: [
      "That your licence is valid and with you, and the vehicle's licence disc has not expired",
      "That the radio licence is paid",
      "That the service book is in the glovebox",
      "That the original purchase invoice is on board",
    ],
    correctIndex: 0,
    explanation:
      "Both are things you can fix at home in five minutes and cannot fix at a roadblock. Expiry dates are easy to lose track of when nothing prompts you.",
    difficulty: 1,
    scope: "learners",
  },
];
