import type { Scenario } from "@/types";

/**
 * Vehicle-code–specific scenarios — motorcycle (A1, A) and heavy (10, 14)
 * situational judgement, tagged with the codes they apply to. Original wording
 * derived from official SA sources.
 */
export const VEHICLE_SCENARIOS: Scenario[] = [
  {
    id: "vs_mc_wet_manhole",
    categoryId: "hazard_awareness",
    title: "Wet manhole cover mid-corner",
    situation:
      "You are riding a motorcycle through a gentle left-hand bend on a wet road. You notice a painted lane line and a metal manhole cover lying directly on your chosen line through the corner.",
    prompt: "What should you do?",
    choices: [
      {
        id: "a",
        text: "Lean harder and ride straight over both at your current speed",
        correct: false,
        consequence:
          "Painted lines and metal covers offer far less grip when wet; riding over them while leaned over risks a sudden loss of front or rear traction.",
      },
      {
        id: "b",
        text: "Stand the motorcycle up slightly, adjust your line to avoid the marking and cover where safely possible, and keep the bike as upright as possible if you must cross them",
        correct: true,
        consequence:
          "Reducing lean angle and crossing slippery surfaces as upright as possible minimises the chance of a slide.",
      },
      {
        id: "c",
        text: "Brake hard immediately while still leaned over",
        correct: false,
        consequence:
          "Heavy braking while leaned over on a wet, low-grip surface significantly increases the risk of the front wheel sliding out.",
      },
      {
        id: "d",
        text: "Accelerate hard to get past the hazard as quickly as possible",
        correct: false,
        consequence:
          "Sudden acceleration while leaned over on a slippery surface can break rear-wheel traction.",
      },
    ],
    debrief:
      "Riders should plan their line through a corner to avoid low-grip surfaces where possible, and if a hazard can't be avoided, reduce lean angle and keep speed/inputs smooth rather than braking or accelerating hard while leaned over.",
    codes: ["A1", "A"],
  },
  {
    id: "vs_mc_crosswind_trucks",
    categoryId: "hazard_awareness",
    title: "Crosswind gap between two trucks",
    situation:
      "You are riding on a two-lane road. Two large trucks are approaching from the opposite direction, travelling close together, just as you are about to pass between them and a parked vehicle on your side.",
    prompt: "How should you prepare for this situation?",
    choices: [
      {
        id: "a",
        text: "Hold a loose, relaxed grip and maintain a steady, slightly reduced speed, anticipating a turbulence gust as you pass each truck",
        correct: true,
        consequence:
          "A controlled, anticipatory approach lets you absorb sudden turbulence without overreacting.",
      },
      {
        id: "b",
        text: "Speed up to clear the gap before the trucks arrive",
        correct: false,
        consequence:
          "Increasing speed reduces your margin for error and reaction time if turbulence pushes you off line.",
      },
      {
        id: "c",
        text: "Grip the handlebars tightly and look directly at the trucks",
        correct: false,
        consequence:
          "Target fixation on the hazard, plus an overly tense grip, can amplify any sideways push instead of letting you absorb it.",
      },
      {
        id: "d",
        text: "Move further toward the parked vehicle to maximise distance from the trucks",
        correct: false,
        consequence:
          "This reduces your safety margin from a different hazard (the parked vehicle/possible opening door) and may not meaningfully reduce turbulence effects.",
      },
    ],
    debrief:
      "Anticipating turbulence from large vehicles, keeping a relaxed but firm grip, and maintaining a steady, safe speed and road position is the recommended way to ride through such gaps safely.",
    codes: ["A1", "A"],
  },
  {
    id: "vs_mc_incline_start",
    categoryId: "controls",
    title: "Incline start during the K53 test",
    situation:
      "During your motorcycle yard test, the examiner asks you to stop on a marked incline and then move off without rolling back.",
    prompt: "What is the correct sequence of control inputs to avoid rolling backward?",
    choices: [
      {
        id: "a",
        text: "Release the clutch fully first, then apply throttle, then release the rear brake",
        correct: false,
        consequence:
          "Releasing the clutch fully before drive is established, with the brake still held, would stall the engine or jolt the motorcycle.",
      },
      {
        id: "b",
        text: "Hold the rear brake, bring the clutch in to the friction point while adding throttle, then release the rear brake smoothly as drive takes effect",
        correct: true,
        consequence:
          "This sequence keeps the motorcycle stationary until the engine's drive can support it moving forward, preventing rollback.",
      },
      {
        id: "c",
        text: "Release the rear brake immediately and rely on throttle alone",
        correct: false,
        consequence:
          "Releasing the brake before drive is established will let the motorcycle roll backward down the slope.",
      },
      {
        id: "d",
        text: "Use the front brake instead of the rear brake to hold the incline",
        correct: false,
        consequence:
          "The rear brake is the standard control for holding a stationary motorcycle on an incline while preparing to move off; the front brake alone is less practical for this manoeuvre.",
      },
    ],
    debrief:
      "The K53 incline-start procedure relies on coordinating the rear brake, clutch and throttle so that engine drive takes over from the brake at the right moment, avoiding any backward roll.",
    codes: ["A1", "A"],
  },
  {
    id: "vs_mc_no_passenger_seat",
    categoryId: "rules",
    title: "Friend wants a lift with no passenger seat",
    situation:
      "A friend asks for a quick lift on the back of your motorcycle, which has no passenger seat or footrests fitted.",
    prompt: "What should you do?",
    choices: [
      {
        id: "a",
        text: "Let them sit on the fuel tank or rear fairing and hold on tightly",
        correct: false,
        consequence:
          "Carrying a pillion without a proper seat and footrests is unlawful and unsafe — there is nowhere secure for the passenger to brace or place their feet.",
      },
      {
        id: "b",
        text: "Decline, and explain that the motorcycle is not equipped to carry a pillion passenger",
        correct: true,
        consequence:
          "This keeps both of you within the law and avoids a serious safety risk to an unsecured passenger.",
      },
      {
        id: "c",
        text: "Carry them only at very low speed on quiet roads",
        correct: false,
        consequence:
          "Speed does not make an improperly seated pillion passenger lawful or safe; the requirement for a proper seat and footrests still applies.",
      },
      {
        id: "d",
        text: "Let them stand on the rear footpegs of another rider's motorcycle instead",
        correct: false,
        consequence:
          "This does not address the question and would carry similar legal/safety issues if that motorcycle also lacks proper passenger provision.",
      },
    ],
    debrief:
      "A motorcycle may only carry a pillion passenger where it is fitted with a proper seat and footrests for that passenger; without them, carrying someone is both unlawful and dangerous.",
    codes: ["A1", "A"],
  },
  {
    id: "vs_hv_wide_turn",
    categoryId: "intersections",
    title: "Heavy vehicle turning wide at an intersection",
    situation:
      "You are driving a car and stop behind an articulated truck waiting to turn left at an intersection. The truck appears to swing slightly to the right before starting its left turn, opening a gap on its left.",
    prompt: "What should you do?",
    choices: [
      {
        id: "a",
        text: "Quickly move into the gap on the truck's left to get ahead before it turns",
        correct: false,
        consequence:
          "This is a classic 'squeeze' situation: the truck's trailer will swing back to the left as it completes the turn, and a vehicle in that gap risks being struck or crushed.",
      },
      {
        id: "b",
        text: "Hold back and wait for the truck to complete its turn before proceeding",
        correct: true,
        consequence:
          "Long and articulated vehicles need extra space to turn, and their rear sections move differently from the cab — waiting avoids a serious collision.",
      },
      {
        id: "c",
        text: "Hoot to alert the truck driver that there's space and proceed",
        correct: false,
        consequence:
          "Hooting does not change the physical reality that the trailer will swing into the space; proceeding remains dangerous.",
      },
      {
        id: "d",
        text: "Overtake the truck on the right at the same time",
        correct: false,
        consequence:
          "Overtaking a turning heavy vehicle at an intersection is hazardous and likely illegal, and the truck's own swing or signals may not be predictable to you.",
      },
    ],
    debrief:
      "Long and articulated vehicles often need to swing wide (sometimes opposite to their turn direction) before completing a turn; other road users must never try to fill the resulting gap and should wait for the manoeuvre to finish.",
    codes: ["10", "14"],
  },
  {
    id: "vs_hv_air_warning",
    categoryId: "controls",
    title: "Air pressure warning light before departure",
    situation:
      "You climb into a heavy truck, start the engine, and notice the air pressure warning light and buzzer are still active a minute later.",
    prompt: "What should you do?",
    choices: [
      {
        id: "a",
        text: "Drive off carefully at low speed since the engine is running",
        correct: false,
        consequence:
          "Moving off with insufficient air pressure risks the brakes not applying with full force, or the spring brakes suddenly locking on, both of which are dangerous.",
      },
      {
        id: "b",
        text: "Let the engine continue idling and wait until the air pressure gauges reach the safe operating range and the warning clears before moving off",
        correct: true,
        consequence:
          "This is the correct procedure — air brakes are only reliable once sufficient pressure has built up in the system.",
      },
      {
        id: "c",
        text: "Switch off the warning buzzer and proceed",
        correct: false,
        consequence:
          "Disabling or ignoring a safety warning does not resolve the underlying lack of air pressure and is unsafe.",
      },
      {
        id: "d",
        text: "Rev the engine hard to build pressure faster",
        correct: false,
        consequence:
          "Air compressors are typically driven at a rate tied to engine operation; aggressive revving is not the recommended way to build pressure and may cause other issues while the vehicle is stationary.",
      },
    ],
    debrief:
      "A heavy vehicle must never be moved until the air brake system has built up to its safe operating pressure range, as shown on the gauges and confirmed by the warning light/buzzer clearing.",
    codes: ["10", "14"],
  },
  {
    id: "vs_hv_coupling_check",
    categoryId: "controls",
    title: "Coupling check before a long haul",
    situation:
      "You have just reverse-coupled your truck-tractor to a semi-trailer. Before setting off on a long-distance trip, you want to be sure the combination is safely connected.",
    prompt: "What is the most thorough way to confirm the coupling is secure?",
    choices: [
      {
        id: "a",
        text: "Listen for a 'click' sound only and then drive off",
        correct: false,
        consequence:
          "Relying on sound alone is not a reliable confirmation; a visual check and a tug test are needed.",
      },
      {
        id: "b",
        text: "Visually confirm the kingpin is locked with the safety lock-pin engaged, connect and check the air lines and electrical plug, raise and secure the landing gear, then perform a tug test against the applied trailer brakes",
        correct: true,
        consequence:
          "This sequence covers the mechanical lock, air supply, electrics and a physical confirmation that the coupling holds — the recommended thorough check.",
      },
      {
        id: "c",
        text: "Only check the electrical plug, since that is the most common fault",
        correct: false,
        consequence:
          "The electrical connection is only one of several systems that must be checked; the mechanical coupling and air lines are equally critical to safety.",
      },
      {
        id: "d",
        text: "Drive a short distance on a public road to see if the trailer follows correctly",
        correct: false,
        consequence:
          "Testing a potentially unsecured coupling on a public road risks a dangerous separation in traffic; checks must be completed before moving onto the road.",
      },
    ],
    debrief:
      "A full coupling check — visual lock confirmation, air lines, electrical connection, landing gear, and a tug test — should always be completed in the yard before a combination is taken onto the public road.",
    codes: ["14"],
  },
  {
    id: "vs_hv_long_descent",
    categoryId: "hazard_awareness",
    title: "Long downhill gradient with a loaded truck",
    situation:
      "You are driving a fully loaded rigid truck and see a warning sign for a long, steep downhill gradient ahead.",
    prompt: "What is the safest approach?",
    choices: [
      {
        id: "a",
        text: "Select a high gear and coast down using only the foot brake as needed",
        correct: false,
        consequence:
          "Riding the foot brake continuously on a long descent can cause the brakes to overheat and fade, reducing their effectiveness when most needed.",
      },
      {
        id: "b",
        text: "Select a suitably low gear before the descent and use engine braking (and an exhaust brake/retarder if fitted) to control speed, applying the foot brake only periodically",
        correct: true,
        consequence:
          "Using a low gear and engine braking keeps speed controlled without overusing the service brakes, reducing the risk of brake fade.",
      },
      {
        id: "c",
        text: "Switch off the engine and coast in neutral to save fuel",
        correct: false,
        consequence:
          "Coasting in neutral removes engine braking entirely and can also affect power steering/braking assistance, making the descent far more dangerous.",
      },
      {
        id: "d",
        text: "Maintain the same gear and speed as on the flat approach road",
        correct: false,
        consequence:
          "Gravity will accelerate a heavy vehicle on a downhill gradient; failing to adjust gear and speed increases the risk of losing control or overheating the brakes.",
      },
    ],
    debrief:
      "On long descents, heavy-vehicle drivers should select a low gear in advance and rely primarily on engine braking (assisted by a retarder/exhaust brake where fitted) to avoid overheating the service brakes.",
    codes: ["10", "14"],
  },
  {
    id: "vs_mc_truck_only_lane",
    categoryId: "signs",
    title: "Unfamiliar truck-only lane marking",
    situation:
      "While riding your motorcycle, you approach a multi-lane road where the leftmost lane has a regulatory sign showing a truck symbol above the word 'ONLY', with a sub-plate giving a mass figure.",
    prompt: "What does this most likely mean for you, on a motorcycle?",
    choices: [
      {
        id: "a",
        text: "The lane is reserved for heavy vehicles over the stated mass, so you should not use that lane",
        correct: true,
        consequence:
          "Class-restricted lane signs reserve a lane for the indicated vehicle class; a motorcycle is not part of that class and should use another lane.",
      },
      {
        id: "b",
        text: "The sign only applies between certain hours, so you can ignore it now",
        correct: false,
        consequence:
          "There is no time sub-plate described here — a time restriction is shown separately and should not be assumed without seeing it.",
      },
      {
        id: "c",
        text: "It means motorcycles must travel at the mass figure shown, interpreted as a speed",
        correct: false,
        consequence:
          "The mass figure on a vehicle-class lane sign refers to vehicle mass, not a speed instruction, and does not apply to motorcycles at all.",
      },
      {
        id: "d",
        text: "It is purely an information sign with no legal effect",
        correct: false,
        consequence:
          "A regulatory sign (red/blue command-style, here reserving a lane for a vehicle class) does carry legal force, unlike a blue/green guidance sign.",
      },
    ],
    debrief:
      "Lane-reservation regulatory signs naming a vehicle class and a mass threshold reserve that lane for vehicles of that class — a rider should recognise the sign and move to an appropriate lane rather than guessing its meaning.",
    codes: ["A1", "A"],
  },
  {
    id: "vs_hv_following_rain",
    categoryId: "following_distance",
    title: "Following a heavy vehicle in light rain",
    situation:
      "You are driving your car directly behind a loaded articulated truck on a wet road, at the same following distance you would normally use behind a car.",
    prompt: "What should you reconsider?",
    choices: [
      {
        id: "a",
        text: "Nothing — following distance does not need to change for the vehicle ahead",
        correct: false,
        consequence:
          "The size, stopping distance and visibility characteristics of the vehicle ahead are highly relevant to a safe following distance.",
      },
      {
        id: "b",
        text: "Increase your following distance, since the truck's spray reduces your visibility and a heavy, loaded vehicle's stopping behaviour differs from a car's",
        correct: true,
        consequence:
          "More space gives you better visibility (out of the worst spray) and more time to react if the truck brakes or its trailer behaves unexpectedly.",
      },
      {
        id: "c",
        text: "Move even closer so you can see past the truck's mirrors",
        correct: false,
        consequence:
          "Moving closer increases your risk and worsens the effect of road spray and reduced visibility, and puts you in the truck's blind spot.",
      },
      {
        id: "d",
        text: "Switch on your hazard lights instead of adjusting distance",
        correct: false,
        consequence:
          "Hazard lights are for warning others of a stationary or slow-moving hazard, not a substitute for an adequate following distance.",
      },
    ],
    debrief:
      "Wet conditions and road spray from a heavy vehicle reduce visibility and increase stopping distances for everyone, so a longer following distance is the appropriate response, not a change in lights or closing the gap.",
    codes: ["8", "10", "14"],
  },
];
