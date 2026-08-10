import type { Flashcard, Question } from "@/types";

/**
 * Sprint 8 — the K53 test *sheet*: what each fault actually costs.
 *
 * Facts trace to docs/content/facts/motus-manual-11ed.md (Official
 * Motus/Safeways K53 Learner's & Driver's Manual, 11th ed.). That book prints
 * the examiner's yard- and road-test score sheets, which is material nothing
 * else in the bank had: we taught the manoeuvres, but never the penalty
 * attached to each fault, the SIM sequence that governs every yard movement,
 * the pre-trip inspection's *order*, or the handful of faults that end the test
 * on the spot.
 *
 * Category split follows where yard content already lives: manoeuvre and
 * scoring items are `controls` (as with the existing alley-docking and
 * parallel-parking questions), and items about where you may leave or halt a
 * vehicle on a public road are `parking`.
 *
 * Two deliberate omissions, both recorded in the fact file's "Conflicts to
 * resolve":
 *  - No item turns on the exact yard-test time limit. This manual says 20
 *    minutes; controls-extra-pack.ts already asks it against the DoT's 20:59
 *    and answers "about 21 minutes", which is compatible with both. Adding a
 *    sharper version would make the bank contradict itself.
 *  - No item makes the word order of "push-pull" vs "pull-push" the answer.
 */

/** Item-level provenance for the figures taken straight off the score sheet. */
const MOTUS = "Official Motus/Safeways K53 Learner's & Driver's Manual, 11th ed.";

export const MOTUS_YARD_QUESTIONS: Question[] = [
  // ── The score sheet ─────────────────────────────────────────
  {
    id: "qm_yard_total_points",
    categoryId: "controls",
    prompt: "The yard test is marked out of a fixed number of points. That total is:",
    options: ["50", "100", "25", "There is no points total — it is simply pass or fail"],
    correctIndex: 0,
    explanation:
      "The yard test sheet totals 50. You lose points fault by fault, so a run can be untidy in several small ways and still pass — but a few specific faults end it outright regardless of your score.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_yard_black_box",
    categoryId: "controls",
    prompt:
      "Certain items on the examiner's yard-test sheet are printed in a solid black box. Those items mean:",
    options: [
      "The test stops immediately if that fault occurs",
      "They are worth double points",
      "They are optional and only scored on request",
      "They apply only to heavy vehicles",
    ],
    correctIndex: 0,
    explanation:
      "A black box is not a penalty, it is a full stop. Rolling, touching a pole, mounting the kerb or needing a fourth movement in the turn in the road all end the test where you sit — there is no points arithmetic to argue about afterwards.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_yard_obs_cost",
    categoryId: "controls",
    prompt: "Failing to do the full 360° observation before a yard movement costs you:",
    options: ["5 points", "1 point", "2 points", "Nothing — it is only a recommendation"],
    correctIndex: 0,
    explanation:
      "Observation is the most expensive single item on the yard sheet at 5 points, and it is scored on every movement. Two missed checks cost more than most learners lose in the whole rest of the test.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_yard_sig_can_cost",
    categoryId: "controls",
    prompt: "Leaving your indicator on after finishing a yard manoeuvre costs:",
    options: ["4 points", "1 point", "Nothing if it self-cancels later", "The test is stopped"],
    correctIndex: 0,
    explanation:
      "A signal that outlives the manoeuvre tells everyone around you that you are still about to move, which is worse than no signal at all. Cancelling is scored separately from signalling, at 4 points.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_yard_ratchet_cost",
    categoryId: "controls",
    prompt:
      "During the yard test the examiner hears the parking brake ratchet click as you pull it up. This:",
    options: [
      "Costs one point — the thumb button should be pressed in as you apply it",
      "Costs nothing, the clicking is unavoidable",
      "Stops the test immediately",
      "Costs five points",
    ],
    correctIndex: 0,
    explanation:
      "Pressing the release button in while you lift the lever stops the ratchet clicking, which spares the mechanism and shows control. It is a single point, but it is a point the examiner can hear without looking.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_yard_stall_cost",
    categoryId: "controls",
    prompt: "You stall during a yard manoeuvre. The correct response is to:",
    options: [
      "Lose one point, then restart using the full starting procedure",
      "Restart immediately in gear and carry on",
      "Abandon the manoeuvre and ask to begin the test again",
      "Wait for the examiner to restart the vehicle for you",
    ],
    correctIndex: 0,
    explanation:
      "A stall is a single point, so it is recoverable — but the recovery is scored too. Go back through the whole starting procedure rather than stabbing at the key, or you turn one cheap point into several.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_yard_second_attempt",
    categoryId: "controls",
    prompt: "A second attempt at a yard parking manoeuvre is allowed only if, on the first attempt, you:",
    options: [
      "Neither rolled nor touched an obstacle",
      "Stayed inside the time limit",
      "Asked the examiner's permission first",
      "Did not stall",
    ],
    correctIndex: 0,
    explanation:
      "Rolling and pole contact are both test-ending faults, so there is nothing left to re-attempt. Anything short of those — an awkward line, a stall, an untidy finish — leaves you a second try.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_yard_no_fixed_sequence",
    categoryId: "controls",
    prompt: "The order in which the yard-test manoeuvres are done is:",
    options: [
      "Not fixed — the examiner may start with any of them",
      "Always alley docking, then parallel parking, then the turn in the road",
      "Chosen by the candidate",
      "Always the incline start first",
    ],
    correctIndex: 0,
    explanation:
      "There is no set running order, so you cannot rehearse a script. Practise each manoeuvre as a self-contained routine that begins with the same sequence checks, and the order stops mattering.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },

  // ── SIM: the sequence checks ────────────────────────────────
  {
    id: "qm_sim_meaning",
    categoryId: "controls",
    prompt:
      "The sequence checks done before every yard movement are remembered as 'SIM'. That stands for:",
    options: [
      "Stop, Indicate, Move",
      "Signal, Ignition, Mirror",
      "Steer, Inspect, Manoeuvre",
      "Stop, Inspect, Mirror",
    ],
    correctIndex: 0,
    explanation:
      "Stop, Indicate, Move. It is the backbone of the yard test — every manoeuvre is just this loop repeated, so learning it once earns points in all four.",
    difficulty: 1,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_sim_stop_phase",
    categoryId: "controls",
    prompt: "In the 'Stop' phase of the yard sequence checks, the correct order is:",
    options: [
      "Parking brake on immediately, gear to neutral, then both feet on the floor and relax",
      "Gear to neutral, then the parking brake",
      "Handbrake only once the examiner asks for it",
      "Feet on the pedals, ready to move again",
    ],
    correctIndex: 0,
    explanation:
      "The parking brake goes on the moment the vehicle is fully stopped — before neutral, not after — because it is the brake, not the gearbox, that keeps you still. Feet then come off the pedals so the examiner can see nothing is holding the car.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_sim_obs_before_signal",
    categoryId: "controls",
    prompt: "In the yard sequence checks, the 360° observation is done:",
    options: [
      "Before you indicate",
      "After you indicate",
      "Only if the examiner is watching",
      "At the same time as releasing the parking brake",
    ],
    correctIndex: 0,
    explanation:
      "You look first, then announce. Indicating before you have looked commits you to a direction you have not yet checked is safe — and the examiner scores the order, not just the fact that both happened.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_sim_two_observations",
    categoryId: "controls",
    prompt:
      "How many full 360° observations does the yard sequence require between stopping and moving off?",
    options: [
      "Two — one before indicating, and another just before the vehicle moves",
      "One, before indicating",
      "One, immediately before moving",
      "Three",
    ],
    correctIndex: 0,
    explanation:
      "Time passes between the first check and actually moving, and a yard is full of people walking. The second check is what makes the first one still true.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_sim_move_phase_order",
    categoryId: "controls",
    prompt: "In the 'Move' phase, the parking brake is released:",
    options: [
      "After clutch control is established and the second observation is complete",
      "Before selecting a gear",
      "At the same moment you select the gear",
      "Only once the vehicle is already rolling",
    ],
    correctIndex: 0,
    explanation:
      "Keep a hand on the lever while you find clutch control, so the brake is still holding the car if the clutch bites early. Release it last and the vehicle can only move the way you intended.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_sim_clutch_control_purpose",
    categoryId: "controls",
    prompt: "In the yard sequence, establishing clutch control before releasing the parking brake prevents:",
    options: [
      "The vehicle rolling in the direction opposite to the one you intend",
      "The engine from stalling on a flat surface",
      "Excessive tyre wear",
      "The indicator from self-cancelling",
    ],
    correctIndex: 0,
    explanation:
      "Clutch control means the engine is already pulling gently against the brake. Release from there and the car moves the way you chose; release without it and gravity chooses instead — which on the incline is an instant failure.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },

  // ── Pre-trip inspection ─────────────────────────────────────
  {
    id: "qm_pretrip_anticlockwise",
    categoryId: "controls",
    prompt: "The exterior pre-trip inspection should be worked through:",
    options: [
      "Anti-clockwise around the vehicle, top to bottom",
      "Clockwise around the vehicle",
      "In whatever order you remember the items",
      "Front and rear only, skipping the sides",
    ],
    correctIndex: 0,
    explanation:
      "A fixed direction is a memory aid, not a rule of physics — but under test nerves it is what stops you missing a wheel. Walk it the same way every time you practise.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_pretrip_underneath_first",
    categoryId: "controls",
    prompt: "Before you touch anything, the pre-trip inspection begins by:",
    options: [
      "Looking underneath the vehicle for leaks or obstructions",
      "Starting the engine to warm it",
      "Checking the licence disc",
      "Adjusting the mirrors",
    ],
    correctIndex: 0,
    explanation:
      "Looking under the car is the only way to find a fluid leak — or a small child or an animal sheltering there. Once you have moved off it is too late to have looked.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_pretrip_unroadworthy_stops",
    categoryId: "controls",
    prompt:
      "If the vehicle is judged unroadworthy during the exterior inspection, what happens next?",
    options: [
      "You fail immediately and never proceed to the interior check",
      "You lose five points but continue",
      "The examiner allows a repair and restarts the clock",
      "The interior check continues and the decision is made at the end",
    ],
    correctIndex: 0,
    explanation:
      "The inspection is a gate, not a scored section. This is why the checks matter most on the vehicle you are taking to the test — do them at home, days before, while there is still time to fix something.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_pretrip_wiper_routine",
    categoryId: "controls",
    prompt: "The correct way to check a windscreen wiper blade during the pre-trip inspection is to:",
    options: [
      "Lift it, feel the blade, say aloud that it is not torn or perished, and leave it standing up",
      "Switch the wipers on and watch them sweep",
      "Look at it through the windscreen from the driver's seat",
      "Press it flat against the glass and release it",
    ],
    correctIndex: 0,
    explanation:
      "Feeling the rubber finds splits and hardening that looking cannot. Leaving the blade up is the signal to the examiner — and to you — that this one has already been done.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_pretrip_point_and_say",
    categoryId: "controls",
    prompt:
      "During the inspection you know an item must be checked but cannot recall its name. The accepted approach is to:",
    options: [
      "Point at it and say that you must check it",
      "Skip it and hope the examiner does not notice",
      "Guess a name — the examiner only counts the number of items",
      "Ask the examiner to name it for you",
    ],
    correctIndex: 0,
    explanation:
      "The examiner is testing whether you know what needs checking, not your vocabulary. Pointing and saying so scores; silence does not.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_pretrip_fluids_declaration",
    categoryId: "controls",
    prompt: "Under the bonnet, the pre-trip inspection expects you to account for:",
    options: [
      "Oil, water, brake fluid and the condition of the visible engine belts",
      "Only the oil level",
      "Battery terminals and spark plugs",
      "Nothing — the bonnet is not part of the check",
    ],
    correctIndex: 0,
    explanation:
      "Four fluids-and-belts items, and you may state that you have checked them rather than dismantling anything. A snapped belt strands you as surely as an empty tank.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_pretrip_interior_four",
    categoryId: "controls",
    prompt: "In the interior part of the inspection, the examiner asks you to operate:",
    options: [
      "The lights (bright and dim), the indicators, the wipers and the hooter",
      "Only the lights and indicators",
      "The radio, air conditioning and lights",
      "The handbrake and the gear lever only",
    ],
    correctIndex: 0,
    explanation:
      "Four systems, each checked front and rear where that applies. Any one of them failing is grounds to declare the vehicle unroadworthy on the spot.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_pretrip_declarations",
    categoryId: "controls",
    prompt:
      "Once the examiner is seated, you are expected to state aloud four things. They are that the doors are closed, the parking brake is engaged, the gear is in neutral, and:",
    options: [
      "There are no obstructions on the floor or blocking your view through the windows",
      "The fuel tank is full",
      "The licence disc is valid",
      "The mirrors have been adjusted",
    ],
    correctIndex: 0,
    explanation:
      "A bottle rolling under the pedals is a genuine hazard, and so is a rear window you cannot see through. Saying it aloud is how the examiner knows you looked rather than assumed.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_pretrip_clock_starts",
    categoryId: "controls",
    prompt: "The examiner starts timing the yard test:",
    options: [
      "At the beginning of the exterior inspection",
      "Only once you begin the first parking manoeuvre",
      "When you first start the engine",
      "When you arrive at the test centre",
    ],
    correctIndex: 0,
    explanation:
      "The inspection is inside the clock, not before it. A slow, hesitant walk-around eats the time you will want for a second attempt at a parking bay.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },

  // ── Alley docking ───────────────────────────────────────────
  {
    id: "qm_alley_two_attempts",
    categoryId: "controls",
    prompt: "How many attempts are you allowed at alley docking?",
    options: ["Two", "One", "Three", "As many as fit inside the time limit"],
    correctIndex: 0,
    explanation:
      "Two — provided the first attempt did not roll and did not touch a pole. Knowing you have a spare is worth a lot: it stops the panicky over-correction that causes pole contact in the first place.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_alley_half_metre",
    categoryId: "controls",
    prompt: "While manoeuvring around the poles in alley docking, you should aim to keep them:",
    options: [
      "About half a metre from the side of the vehicle",
      "Touching the tyres as a guide",
      "As far away as the bay allows",
      "Directly under the door mirrors",
    ],
    correctIndex: 0,
    explanation:
      "Half a metre is close enough to place the car accurately and wide enough to absorb a small steering error. Hugging the poles leaves you no margin at all.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_alley_pole_b_head",
    categoryId: "controls",
    prompt: "In alley docking, the reference for stopping at the end of the manoeuvre is:",
    options: [
      "Pole B in line with your head",
      "The front bumper touching the line",
      "Pole B visible in the rear-view mirror",
      "The rear wheels level with pole A",
    ],
    correctIndex: 0,
    explanation:
      "Your own head is the one reference that does not move when you shift in the seat or the car sits differently. Lining a pole up with it turns a judgement call into a fixed mark.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_alley_three_second_rule",
    categoryId: "controls",
    prompt:
      "You stop mid-manoeuvre during alley docking to think. Before moving again you must repeat the 360° check if you have been stationary for more than:",
    options: ["Three seconds", "Ten seconds", "Thirty seconds", "One minute"],
    correctIndex: 0,
    explanation:
      "Three seconds is long enough for someone to walk behind you. You may stop as often as you like — the check is simply the price of each pause.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_alley_pole_contact",
    categoryId: "controls",
    prompt: "Any part of the vehicle touching a pole while alley docking means:",
    options: [
      "Immediate disqualification — there is no second chance",
      "Four points and a second attempt",
      "One point per pole touched",
      "Nothing, provided the vehicle finishes inside the bay",
    ],
    correctIndex: 0,
    explanation:
      "The poles stand in for other people's cars and for pedestrians. Touching one is treated as the collision it represents, so it ends the test rather than costing points.",
    difficulty: 1,
    scope: "learners",
    source: MOTUS,
  },

  // ── Parallel parking ────────────────────────────────────────
  {
    id: "qm_parallel_three_movements",
    categoryId: "controls",
    prompt: "The parallel park in the yard test is designed to be completed in:",
    options: [
      "Three movements — reverse in, forward, then straight back",
      "Exactly one movement",
      "Five movements",
      "As many movements as you need",
    ],
    correctIndex: 0,
    explanation:
      "Three is the budget the manoeuvre is built around: reverse in, a correcting move forward, then straight back to settle. Fewer is fine; the count is a ceiling, not a target.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_parallel_one_movement_ok",
    categoryId: "controls",
    prompt: "You get the vehicle cleanly into the parallel bay in a single movement. This is:",
    options: [
      "Perfectly acceptable — the second and third movements are not compulsory",
      "A fault, because all three movements must be demonstrated",
      "Only acceptable in an automatic",
      "Grounds for the examiner to ask you to repeat it",
    ],
    correctIndex: 0,
    explanation:
      "The three movements are an allowance, not a routine to perform. If the car is in the bay and straight, the manoeuvre is done.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_parallel_white_dot",
    categoryId: "controls",
    prompt: "On the final reverse of the parallel park, you stop when the white dot on the ground is:",
    options: [
      "In line with your shoulder",
      "In line with the front bumper",
      "Visible in the left mirror",
      "Level with the rear wheels",
    ],
    correctIndex: 0,
    explanation:
      "Another body-part reference, for the same reason as pole B and your head — it stays true whoever is driving and whatever the car.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_parallel_start_position",
    categoryId: "controls",
    prompt: "The parallel park begins with the side of your vehicle roughly:",
    options: [
      "Half a metre from the first pole, with the rear well past the poles",
      "Touching the kerb, level with the first pole",
      "Two metres out, with the front level with the first pole",
      "Anywhere in the box — the starting position is not scored",
    ],
    correctIndex: 0,
    explanation:
      "Everything after this depends on the start. Too close and you cannot swing in without clipping a pole; too far and you finish a metre off the kerb.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_parallel_pass_standard",
    categoryId: "controls",
    prompt:
      "Your parallel park finishes inside the designated area but not perfectly parallel. This is:",
    options: [
      "A pass — anywhere inside the area between the poles counts",
      "A fail, because the vehicle must be exactly parallel",
      "A four-point penalty",
      "A pass only if you use a second movement to straighten",
    ],
    correctIndex: 0,
    explanation:
      "Parallel is what you aim for; inside the box is what is scored. Chasing perfection with extra shuffling costs more points than a slightly crooked finish.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_kerb_bump_vs_mount",
    categoryId: "controls",
    prompt: "In the yard test, bumping the kerb and mounting the kerb are scored:",
    options: [
      "Bumping costs four points; mounting it disqualifies you immediately",
      "Both cost four points",
      "Both are immediate disqualifications",
      "Bumping is free; only mounting is scored",
    ],
    correctIndex: 0,
    explanation:
      "The distinction is whether the wheel rides up onto the pavement. Touching a kerb is clumsy; climbing it is the moment a pedestrian standing there would have been hit.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_counter_steer_meaning",
    categoryId: "controls",
    prompt: "On the yard test sheet, 'counter steer' means:",
    options: [
      "Straightening the front wheels out again",
      "Turning the wheel the opposite way to the direction of travel",
      "Steering with one hand while reversing",
      "Correcting a skid",
    ],
    correctIndex: 0,
    explanation:
      "It is simply unwinding the lock you put on. Do it while the vehicle is still moving — steering a stationary car scrubs the tyres and is scored elsewhere.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },

  // ── Turn in the road ────────────────────────────────────────
  {
    id: "qm_turn_three_moves_max",
    categoryId: "controls",
    prompt: "You need a fourth movement to complete the turn in the road. The result is:",
    options: [
      "Immediate disqualification",
      "A one-point penalty for each extra movement",
      "Four points",
      "Nothing, provided you finish within the time limit",
    ],
    correctIndex: 0,
    explanation:
      "Three movements is the definition of the manoeuvre, not a guideline — which is why it is worth practising in a road narrow enough to be realistic rather than a wide-open yard.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_turn_first_move_stop_point",
    categoryId: "controls",
    prompt:
      "On the first forward movement of the turn in the road, you counter-steer and stop when the vehicle is:",
    options: [
      "About a metre from the far kerb, or roughly at 90° to it",
      "Touching the far kerb",
      "At 45° to the kerb",
      "Halfway across the road",
    ],
    correctIndex: 0,
    explanation:
      "Straightening the wheels before you stop is what buys you room on the reverse. Arrive at the kerb still on full lock and the second movement has nowhere to go.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_turn_reverse_angle",
    categoryId: "controls",
    prompt: "On the reverse movement of the turn in the road, you counter-steer once the vehicle reaches roughly:",
    options: [
      "45° — and you stop before touching the kerb",
      "90°, stopping against the kerb",
      "Parallel with the kerb",
      "Any angle, as long as you do not stall",
    ],
    correctIndex: 0,
    explanation:
      "Forty-five degrees, or the moment your steering position passes the road's centre line. Unwinding there leaves the front wheels pointing where you want to drive out.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_turn_final_position",
    categoryId: "controls",
    prompt: "The turn in the road finishes with:",
    options: [
      "The vehicle parallel to the opposite kerb, centre line in view from your window, parking brake on",
      "The vehicle at an angle, engine off",
      "The vehicle straddling the centre line",
      "The vehicle back where it started",
    ],
    correctIndex: 0,
    explanation:
      "The manoeuvre is not over when the car points the other way — it is over when it is parked properly facing that way, secured, and waiting for the examiner's next instruction.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_turn_checks_each_movement",
    categoryId: "controls",
    prompt: "During the turn in the road, the sequence checks are done:",
    options: [
      "Before every one of the three movements",
      "Once, before the first movement",
      "Only before reversing",
      "Once at the start and once at the end",
    ],
    correctIndex: 0,
    explanation:
      "Each movement points the car somewhere new and takes time. Three movements means three full sets of checks — this is where most of the observation points in the manoeuvre are won or lost.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },

  // ── Incline start ───────────────────────────────────────────
  {
    id: "qm_incline_neutral_purpose",
    categoryId: "controls",
    prompt:
      "On the incline start you are required to put the gear into neutral after stopping. The reason is to:",
    options: [
      "Prove that the parking brake alone holds the vehicle on the slope",
      "Let the engine idle down",
      "Save fuel while waiting",
      "Make the gear easier to select afterwards",
    ],
    correctIndex: 0,
    explanation:
      "In gear with the clutch down, you cannot tell whether the brake is holding the car or the transmission is. Neutral removes the doubt — which is the whole point of testing an incline start.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_incline_automatic_variant",
    categoryId: "controls",
    prompt: "Doing the incline start in an automatic, the sequence after stopping is:",
    options: [
      "Parking brake on, lever to neutral, then into Drive and pull off after the checks",
      "Leave it in Drive throughout",
      "Select Park, then Drive",
      "Select reverse, then Drive",
    ],
    correctIndex: 0,
    explanation:
      "Same logic as the manual: neutral first, so the parking brake is demonstrably doing the work, then Drive for the departure.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_incline_roll_fail",
    categoryId: "controls",
    prompt: "On the incline start, rolling backwards even slightly as you pull away:",
    options: [
      "Ends the test immediately",
      "Costs five points",
      "Costs one point",
      "Is acceptable if it is less than half a metre",
    ],
    correctIndex: 0,
    explanation:
      "There is no tolerance band. On a real hill the car behind is exactly where your roll would take you, which is why this one is absolute rather than scored.",
    difficulty: 1,
    scope: "learners",
    source: MOTUS,
  },

  // ── Controls technique from the manual ──────────────────────
  {
    id: "qm_steer_hand_positions",
    categoryId: "controls",
    prompt: "The hand positions taught for steering are:",
    options: [
      "'Ten to two' or 'quarter to three'",
      "'Twenty past eight', low on the wheel",
      "One hand at twelve o'clock",
      "Both hands together at the bottom of the wheel",
    ],
    correctIndex: 0,
    explanation:
      "Both give you a full turn of movement in either direction without crossing your arms, and both keep your hands clear of an airbag's path. The lower half of the wheel gives you neither.",
    difficulty: 1,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_steer_thumbs",
    categoryId: "controls",
    prompt: "When holding the steering wheel, your thumbs should be:",
    options: [
      "On the inside of the rim",
      "Hooked around the outside of the rim",
      "Hooked through the spokes",
      "Resting on the horn boss",
    ],
    correctIndex: 0,
    explanation:
      "Thumbs on the rim, not wrapped through it. A front wheel striking a pothole or kerb can spin the wheel hard enough to injure a thumb that is hooked into a spoke.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_neutral_position",
    categoryId: "controls",
    prompt: "On a typical manual gearbox, the neutral passage sits:",
    options: [
      "Between the 3rd and 4th gear positions",
      "Between 1st and 2nd",
      "To the far left, beyond 1st",
      "Behind 5th",
    ],
    correctIndex: 0,
    explanation:
      "The lever is spring-loaded to rest there, which is why 3rd and 4th are the easiest gears to find blind. First and reverse both need the lever moved across that passage first.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_biting_point_revs",
    categoryId: "controls",
    prompt:
      "Moving off in a manual with a rev counter, you set about 1 000 r/min and ease the clutch out. You have found the biting point when the revs:",
    options: [
      "Drop to around 750 r/min",
      "Rise to about 2 000 r/min",
      "Stay exactly at 1 000 r/min",
      "Fall to idle and the engine stalls",
    ],
    correctIndex: 0,
    explanation:
      "The drop is the engine taking up the car's weight. If your car has no rev counter, the same moment shows as the bonnet lifting slightly or the rear settling.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_seatbelt_reversing",
    categoryId: "controls",
    prompt: "The requirement to wear a seat belt:",
    options: [
      "Does not apply while you are reversing",
      "Applies at all times without exception",
      "Does not apply below 40 km/h",
      "Does not apply to the driver, only to passengers",
    ],
    correctIndex: 0,
    explanation:
      "The exemption exists so you can turn far enough to look properly out of the rear window. It ends the moment you select a forward gear.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_reverse_look_left",
    categoryId: "controls",
    prompt: "The taught way to look behind while reversing a car is to:",
    options: [
      "Turn to your left and look out through the rear window",
      "Turn to your right and look over your right shoulder",
      "Use the rear-view mirror alone",
      "Rely on the reversing camera",
    ],
    correctIndex: 0,
    explanation:
      "Turning left in a right-hand-drive car opens up far more of the rear window than twisting the other way. Mirrors alone leave blind areas exactly where a small child would be.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_reverse_right_hand",
    categoryId: "controls",
    prompt: "While reversing and looking out of the rear window, the wheel is best steered with:",
    options: [
      "The right hand, placed on top of the wheel",
      "Both hands at quarter to three",
      "The left hand only",
      "Whichever hand is free, changing as needed",
    ],
    correctIndex: 0,
    explanation:
      "One hand at the top gives you a single, intuitive reference while your body is twisted round — the car's rear follows the direction you move that hand.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_release_key_immediately",
    categoryId: "controls",
    prompt: "Once the engine fires, the ignition key must be released immediately because:",
    options: [
      "Holding it longer damages the starter motor",
      "It drains the battery",
      "The immobiliser will re-engage",
      "The engine will flood with fuel",
    ],
    correctIndex: 0,
    explanation:
      "The starter's gear is meant to disengage the moment the engine runs. Holding the key grinds it against a spinning flywheel — an expensive noise you only make once.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_str_eng_penalty",
    categoryId: "controls",
    prompt: "On the road test, failing to start the engine first time costs:",
    options: [
      "One point for every attempt after the first",
      "Nothing — you may try as often as you like",
      "Five points",
      "An immediate failure on the second attempt",
    ],
    correctIndex: 0,
    explanation:
      "Cheap individually, but it compounds, and repeated cranking usually means a step of the starting procedure was skipped rather than a fault with the car.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_brake_then_clutch",
    categoryId: "controls",
    prompt: "Slowing for a corner in a manual, the correct order of the two pedals is:",
    options: [
      "Brake first, then clutch",
      "Clutch first, then brake",
      "Both together, always",
      "Clutch only — the engine will slow the car",
    ],
    correctIndex: 0,
    explanation:
      "Brake while still in gear and the engine helps hold the car steady. Clutch first and you are coasting — which is both less stable and separately penalised.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_handbrake_before_neutral",
    categoryId: "controls",
    prompt: "When securing the vehicle at a stop, the parking brake is applied:",
    options: [
      "Before the gear lever goes into neutral",
      "After selecting neutral",
      "Only if the road is on a slope",
      "At the same time as the clutch is released",
    ],
    correctIndex: 0,
    explanation:
      "Neutral first leaves a moment where nothing is holding the car. Brake first, and there is no such moment — which is exactly what the examiner is watching the order for.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_handbrake_release_method",
    categoryId: "controls",
    prompt: "The correct way to release a fully engaged parking brake is to:",
    options: [
      "Lift the lever slightly, press the button fully in, lower it, and release the button last",
      "Press the button and pull the lever up hard",
      "Push the lever straight down without the button",
      "Release the button first, then lower the lever",
    ],
    correctIndex: 0,
    explanation:
      "Lifting first takes the load off the ratchet so the button can move. Releasing the button before the lever is down lets the teeth clatter back into place.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_automatic_licence_restriction",
    categoryId: "controls",
    prompt: "Passing your driving test in an automatic vehicle means your licence:",
    options: [
      "Restricts you to automatics; a manual test licenses you for both",
      "Covers both automatics and manuals",
      "Restricts you to automatics for the first year only",
      "Is issued with no restriction, but insurance may object",
    ],
    correctIndex: 0,
    explanation:
      "Worth deciding before you book. An automatic is easier to pass in, but it closes off every manual car until you re-test.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },

  // ── Road-test scoring ───────────────────────────────────────
  {
    id: "qm_mirror_5_8_seconds",
    categoryId: "controls",
    prompt: "During the road test, the examiner expects a mirror check roughly every:",
    options: ["5 to 8 seconds", "30 seconds", "2 minutes", "Only before a manoeuvre"],
    correctIndex: 0,
    explanation:
      "It is scored at five points every time you let it slip, which makes it the most expensive habit on the road-test sheet. Build it in practice until it stops being something you remember to do.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_eyes_on_lever",
    categoryId: "controls",
    prompt: "Glancing down at the gear lever while changing gear costs:",
    options: ["5 points", "1 point", "2 points", "Nothing, if the change is smooth"],
    correctIndex: 0,
    explanation:
      "Five points, and priced that way for a reason: at 60 km/h a one-second glance is nearly seventeen metres travelled blind. Practise changing by feel.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_gear_change_cornering",
    categoryId: "controls",
    prompt: "Changing gear while you are actually cornering costs:",
    options: ["4 points", "1 point", "Nothing", "An immediate failure"],
    correctIndex: 0,
    explanation:
      "It takes a hand off the wheel at the moment you most need both. Choose the gear before the corner and leave it alone until you are straight.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_gear_coasting",
    categoryId: "controls",
    prompt: "Selecting neutral before the vehicle has stopped ('gear coasting') costs:",
    options: ["3 points", "1 point", "Nothing", "An immediate failure"],
    correctIndex: 0,
    explanation:
      "In neutral the engine can no longer help slow or steady the car, and you cannot accelerate out of trouble. Stay in gear until the vehicle is stopped, then select neutral.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_wide_cut_penalty",
    categoryId: "controls",
    prompt: "On the road-test sheet, 'wide/cut' at 4 points covers:",
    options: [
      "Turning so wide you drift over the middle of the road, or cutting the corner",
      "Driving too far from the kerb on a straight road",
      "Overtaking without enough clearance",
      "Braking too late for a turn",
    ],
    correctIndex: 0,
    explanation:
      "Both errors put you in a lane that belongs to someone else, just at different points in the turn. Aim to leave a corner in the same lane position you entered it.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_waits_too_long",
    categoryId: "controls",
    prompt: "The 'waits too long' fault on the road test is scored when you:",
    options: [
      "Fail to take a safe gap, holding up traffic behind you",
      "Stop for longer than 30 seconds at a robot",
      "Take too long over the pre-trip inspection",
      "Idle at the kerb before moving off",
    ],
    correctIndex: 0,
    explanation:
      "Excessive caution is its own hazard — it frustrates the drivers behind and invites them to take risks around you. The examiner is testing judgement, not timidity.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_needless_stop",
    categoryId: "controls",
    prompt: "Stopping the vehicle when there is no reason to do so is:",
    options: [
      "A one-point fault ('needless')",
      "Never penalised — stopping is always safe",
      "A five-point fault",
      "An immediate failure",
    ],
    correctIndex: 0,
    explanation:
      "An unexpected stop is exactly what the driver behind has not planned for. Cheap on the sheet, but it signals hesitancy the examiner will then watch for elsewhere.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_roll_moving_off_road",
    categoryId: "controls",
    prompt: "Rolling backwards as you move off during the ROAD test results in:",
    options: [
      "Automatic failure — the examiner terminates the test",
      "A five-point penalty",
      "A two-point penalty",
      "A warning on the first occasion",
    ],
    correctIndex: 0,
    explanation:
      "Same standard as the yard, and for the same reason. Every hill start you do on a real road has a car somewhere behind you.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_emergency_stop_attempts",
    categoryId: "controls",
    prompt: "How many attempts are you allowed at the emergency stop?",
    options: [
      "Two — a second unsatisfactory attempt fails the test",
      "One only",
      "Three",
      "As many as the examiner thinks useful",
    ],
    correctIndex: 0,
    explanation:
      "If the first stop is too gentle, or the wheels lock and you do not release and re-apply, you get one more. There is no third.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_emergency_stop_straight",
    categoryId: "controls",
    prompt: "During the emergency stop, if the wheels lock you should:",
    options: [
      "Release the pedal pressure and brake again",
      "Press harder until the vehicle stops",
      "Pull the parking brake",
      "Steer sharply to break the skid",
    ],
    correctIndex: 0,
    explanation:
      "A locked wheel cannot steer and stops the car more slowly than one just short of locking. Release, re-apply — and keep both hands on the wheel until you are stationary.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_freeway_100m",
    categoryId: "controls",
    prompt: "The checks for entering or leaving a freeway should begin at least:",
    options: [
      "100 m, or about 12 seconds, before the entrance or exit",
      "20 m before",
      "At the entrance or exit itself",
      "500 m before",
    ],
    correctIndex: 0,
    explanation:
      "Freeway speeds close gaps fast, so the whole sequence has to be finished before you get there. Starting late means signalling into a lane you have not yet checked.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_freeway_50m_recheck",
    categoryId: "controls",
    prompt: "How close to a freeway entrance or exit must the blind spots be checked again?",
    options: ["50 m before it", "10 m before it", "Only at the ramp itself", "There is no second check"],
    correctIndex: 0,
    explanation:
      "Traffic will have moved since your first check a hundred metres back. The 50 m repeat is what catches a car that has slid into your blind spot in the meantime.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_freeway_ramp_blindspots",
    categoryId: "controls",
    prompt: "Driving past a freeway ON-ramp, which blind spot must you check?",
    options: [
      "The left one — vehicles will be joining from that side",
      "The right one",
      "Both, always",
      "Neither, if you are staying in your lane",
    ],
    correctIndex: 0,
    explanation:
      "Traffic joins from the left, so that is where the conflict is. Passing an OFF-ramp the answer changes — check both, because vehicles cross from the right to leave.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_hand_signal_distance",
    categoryId: "controls",
    prompt: "A hand signal must be given and completed before you brake, from at least:",
    options: ["100 m, or roughly 12 seconds, out", "20 m out", "The moment you begin to brake", "50 m out"],
    correctIndex: 0,
    explanation:
      "The arm has to come back in and onto the wheel before the braking starts, so the signal has to be finished well ahead. Anything later and you are braking one-handed.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_hand_signal_attempts",
    categoryId: "controls",
    prompt: "You give a hand signal unclearly and the examiner asks for it again. If the second attempt is also wrong:",
    options: [
      "You fail the test",
      "You lose three more points and continue",
      "You may try a third time",
      "The examiner scores it as unattempted",
    ],
    correctIndex: 0,
    explanation:
      "Two chances, then it is over. Hand signals are the fallback for a failed indicator, so being unable to give one clearly is treated as a real gap rather than untidiness.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_hand_signal_blindspot_first",
    categoryId: "controls",
    prompt: "Before putting your arm out of the window to give a hand signal, you must check:",
    options: [
      "The mirror and then the right-hand blind spot",
      "Nothing — the signal itself is the warning",
      "The left-hand blind spot only",
      "The rear-view mirror only",
    ],
    correctIndex: 0,
    explanation:
      "Your arm is about to occupy the space a passing cyclist or motorcyclist would be in. Missing the blind-spot check here costs five points on its own, separately from the signal.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_hand_signal_stop_shape",
    categoryId: "controls",
    prompt: "The hand signal for stopping is:",
    options: [
      "Arm out horizontally, forearm pointing straight up, palm open and facing forward",
      "Arm out horizontally, forearm pointing down at the ground",
      "Arm straight out, palm forward, fully horizontal",
      "Arm out, moved up and down",
    ],
    correctIndex: 0,
    explanation:
      "Forearm up for stop; forearm down and rotated anti-clockwise for a left turn; arm straight and horizontal for a right turn; forearm down and moved up and down for slowing.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_hand_signal_left_shape",
    categoryId: "controls",
    prompt: "The hand signal for turning left is given by:",
    options: [
      "Extending the right arm with the forearm pointing at the ground, rotated anti-clockwise",
      "Extending the left arm straight out of the passenger window",
      "Extending the right arm straight out, palm forward",
      "Raising the forearm vertically with the palm open",
    ],
    correctIndex: 0,
    explanation:
      "You cannot reach the left window, so a left turn is signalled with the right arm making a rotating motion — distinct at a glance from the straight arm that means right.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_indicator_100m_5s",
    categoryId: "controls",
    prompt: "Your indicator should normally go on before a turn at about:",
    options: [
      "100 m, or 5 seconds, ahead",
      "10 m ahead",
      "As you begin to turn the wheel",
      "300 m ahead",
    ],
    correctIndex: 0,
    explanation:
      "Far enough that others can adjust, close enough that it is unambiguous. The exception is where a vehicle is emerging from a side road between you and the turn — signalling then can invite them to pull out in front of you.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_dangerous_actions",
    categoryId: "controls",
    prompt: "Which of these is classed as an 'uncontrolled or dangerous action' that fails the road test outright?",
    options: [
      "Taking an unsafe gap in traffic",
      "Stalling at a robot",
      "Selecting the wrong gear",
      "Braking a little harshly",
    ],
    correctIndex: 0,
    explanation:
      "Three things sit in this category: manoeuvring dangerously around pedestrians, taking unsafe gaps, and turning corners uncontrollably fast. All three end the test on the spot.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_breakdown_deferred",
    categoryId: "controls",
    prompt: "The test vehicle breaks down mechanically part-way through the road test. The result is recorded as:",
    options: [
      "Deferred — a breakdown is not a failure",
      "A failure",
      "A pass, if you had lost no points",
      "A failure unless you can repair it",
    ],
    correctIndex: 0,
    explanation:
      "Deferred, because nothing about the breakdown tells the examiner whether you can drive. Causing an accident yourself is different — that is an immediate failure.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_accident_not_your_fault",
    categoryId: "controls",
    prompt: "Another driver causes a collision with your vehicle during the road test. You:",
    options: [
      "May be allowed to continue, at the examiner's discretion, if the vehicle is still roadworthy",
      "Fail automatically",
      "Must restart the test from the beginning",
      "Automatically pass",
    ],
    correctIndex: 0,
    explanation:
      "Fault decides it. An accident you cause is an immediate failure; one caused to you leaves the decision with the examiner and the condition of the car.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_wheels_straight_waiting",
    categoryId: "controls",
    prompt:
      "Waiting to turn right at an intersection, your front wheels should point straight ahead because:",
    options: [
      "Being shunted from behind would otherwise push you into oncoming traffic",
      "It reduces tyre wear while stationary",
      "It makes the turn easier to start",
      "It keeps the steering lock from engaging",
    ],
    correctIndex: 0,
    explanation:
      "A rear-end shunt turns your car into a projectile aimed wherever the wheels point. Straight ahead means you are pushed up the road you are already in. It is three points on the sheet and a great deal more than that in real life.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },

  // ── Parking / stopping restrictions ─────────────────────────
  {
    id: "qm_park_hydrant_distance",
    categoryId: "parking",
    prompt: "You may not park within how far of a fire hydrant?",
    options: ["1,5 m", "5 m", "9 m", "500 mm"],
    correctIndex: 0,
    explanation:
      "One and a half metres — enough for a crew to couple a hose without moving your car first. It is one of the few parking distances small enough to be easy to breach without noticing.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_park_rural_edge",
    categoryId: "parking",
    prompt:
      "Outside an urban area, and not in a marked bay, you may not park within how far of the edge of the road?",
    options: ["1 m", "450 mm", "5 m", "9 m"],
    correctIndex: 0,
    explanation:
      "One metre clear of the edge, so your car is genuinely off the travelled way. Rural roads carry higher speeds and often have no street lighting to show a parked car up.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_park_actuating_mechanism",
    categoryId: "parking",
    prompt: "Parking on the actuating mechanism of a traffic signal is:",
    options: [
      "Prohibited — it is the sensor that tells the signal a vehicle is waiting",
      "Permitted outside peak hours",
      "Permitted, since it cannot be damaged by a parked car",
      "Only prohibited for heavy vehicles",
    ],
    correctIndex: 0,
    explanation:
      "The loop buried in the road surface is how the intersection knows to give your direction a green. A car parked on it can leave a whole approach permanently skipped.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_stop_tunnel_bridge",
    categoryId: "parking",
    prompt: "You may not stop in a tunnel, subway or on a bridge — nor within:",
    options: ["6 m of one", "1,5 m of one", "9 m of one", "20 m of one"],
    correctIndex: 0,
    explanation:
      "Six metres either side, because these are the places with no shoulder and no room to pass. A stopped car there turns a lane into a bottleneck at exactly the point drivers cannot see far ahead.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_stop_narrowing",
    categoryId: "parking",
    prompt: "Where a roadway narrows, you may not stop on it or within:",
    options: ["6 m of the narrowing", "1 m of it", "9 m of it", "There is no restriction"],
    correctIndex: 0,
    explanation:
      "Same six metres, same reason as a bridge or tunnel: the road has already lost width, and a stopped vehicle takes what is left.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_stop_excavation",
    categoryId: "parking",
    prompt: "Stopping alongside an excavation in the road is:",
    options: [
      "Prohibited where it would obstruct the flow of traffic",
      "Always permitted if barriers are present",
      "Permitted during daylight hours",
      "Prohibited only if the excavation is unmarked",
    ],
    correctIndex: 0,
    explanation:
      "The excavation has already taken part of the road. Stopping opposite it can close the gap entirely — which is why the test is whether traffic can still flow, not how deep the hole is.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_stop_rail_reserve",
    categoryId: "parking",
    prompt: "Stopping within the rail reserve at a level crossing is:",
    options: [
      "Prohibited",
      "Permitted while the boom is up",
      "Permitted if you stay in the vehicle",
      "Permitted for up to two minutes",
    ],
    correctIndex: 0,
    explanation:
      "A train cannot swerve and cannot stop in the distance it can see you. Never enter a crossing at all unless the road beyond is clear enough for you to leave it.",
    difficulty: 1,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_park_sidewalk_hawker",
    categoryId: "parking",
    prompt: "The general ban on parking on the sidewalk has one recognised exception, for:",
    options: [
      "A vehicle being used by a street vendor or hawker",
      "Any vehicle displaying hazard lights",
      "Deliveries of under fifteen minutes",
      "Vehicles too wide for the roadway",
    ],
    correctIndex: 0,
    explanation:
      "A narrow exception, and not a general licence to mount the pavement. The sidewalk belongs to pedestrians — including wheelchair users and parents with prams, who have to enter the road to get around you.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_park_exemptions",
    categoryId: "parking",
    prompt: "The parking and stopping restrictions do not apply to:",
    options: [
      "Emergency vehicles, on-duty police and traffic officers, and road construction and maintenance vehicles",
      "Any vehicle displaying hazard lights",
      "Delivery vehicles during business hours",
      "Vehicles carrying a disabled person's permit",
    ],
    correctIndex: 0,
    explanation:
      "The exemption follows the job, not the vehicle. A disabled permit gives access to reserved bays; it does not allow parking on a hydrant or a pedestrian crossing.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_park_penalty",
    categoryId: "parking",
    prompt: "The consequence of breaching the parking restrictions is:",
    options: [
      "A fine, and possibly having your vehicle impounded",
      "A fine only",
      "Demerit points only",
      "A warning on the first occasion",
    ],
    correctIndex: 0,
    explanation:
      "Impoundment is the part people forget. A car left somewhere that blocks traffic or emergency access can be towed, and recovering it costs considerably more than the fine.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_ped_crossing_approach_side",
    categoryId: "parking",
    prompt:
      "The 9 m rule at a pedestrian crossing applies specifically to the approach side. The reason is:",
    options: [
      "A vehicle stopped there hides waiting pedestrians from drivers coming up behind",
      "Pedestrians always cross from that side",
      "It gives buses room to pull in",
      "It marks where the road markings begin",
    ],
    correctIndex: 0,
    explanation:
      "Everything about the crossing depends on the approaching driver seeing someone about to step out. Park in that nine metres and you have removed their only warning.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_park_9m_vs_9m",
    categoryId: "parking",
    prompt:
      "Two different rules use a 9 m measurement. They are the distance from a pedestrian crossing, and:",
    options: [
      "The minimum road width for stopping alongside or opposite another vehicle",
      "The distance from an intersection",
      "The distance from a fire hydrant",
      "The maximum length of a parking bay",
    ],
    correctIndex: 0,
    explanation:
      "Nine metres of road width is roughly two lanes plus a parked car. Below that, stopping opposite another vehicle squeezes moving traffic into a single gap.",
    difficulty: 3,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_park_right_side_facing",
    categoryId: "parking",
    prompt: "Stopping on the right-hand side of a two-way road, facing oncoming traffic, is:",
    options: [
      "Prohibited",
      "Permitted at night if your lights are on",
      "Permitted where there are no parking bays",
      "Permitted for up to five minutes",
    ],
    correctIndex: 0,
    explanation:
      "To get there you crossed into the oncoming lane, and to leave you must cross back. At night your reflectors face the wrong way, so you show up as an unlit obstacle.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
  {
    id: "qm_park_loading_zone_stop",
    categoryId: "parking",
    prompt: "The list of places you may not PARK begins by including:",
    options: [
      "Every place where you may not STOP",
      "Only places marked with a sign",
      "Only urban areas",
      "Only places where a kerb is present",
    ],
    correctIndex: 0,
    explanation:
      "Stopping is the briefer act, so its restrictions are the stricter core; everywhere you may not stop, you certainly may not park. The parking list then adds its own places on top.",
    difficulty: 2,
    scope: "learners",
    source: MOTUS,
  },
];

export const MOTUS_YARD_FLASHCARDS: Flashcard[] = [
  {
    id: "fm_yard_total",
    categoryId: "controls",
    front: "What is the yard test marked out of?",
    back: "50 points. Separately, a short list of faults — rolling, touching a pole, mounting the kerb, a fourth movement in the turn in the road — ends the test regardless of your score.",
    difficulty: 2,
  },
  {
    id: "fm_sim",
    categoryId: "controls",
    front: "What does 'SIM' stand for in the yard test?",
    back: "Stop, Indicate, Move — the sequence checks before every movement. Stop: parking brake, neutral, feet off the pedals. Indicate: 360° observation, then the indicator. Move: gear, clutch control, a second 360°, release the brake, go.",
    difficulty: 1,
  },
  {
    id: "fm_obs_cost",
    categoryId: "controls",
    front: "What does a missed 360° observation cost in the yard test?",
    back: "5 points — the most expensive single item, and it is scored on every movement.",
    difficulty: 2,
  },
  {
    id: "fm_black_box",
    categoryId: "controls",
    front: "What does a black box on the examiner's test sheet mean?",
    back: "That fault stops the test immediately. It is not a penalty to be totalled up — it ends the run where you sit.",
    difficulty: 2,
  },
  {
    id: "fm_second_attempt",
    categoryId: "controls",
    front: "When are you allowed a second attempt at a yard parking manoeuvre?",
    back: "When the first attempt neither rolled nor touched an obstacle. Both of those end the test, so there is nothing left to re-attempt.",
    difficulty: 3,
  },
  {
    id: "fm_ratchet",
    categoryId: "controls",
    front: "Why should the parking-brake ratchet not click as you apply it?",
    back: "The clicking means the thumb button was not pressed in. It costs one point, and the examiner can hear it without looking.",
    difficulty: 3,
  },
  {
    id: "fm_bump_vs_mount",
    categoryId: "controls",
    front: "Bumping the kerb versus mounting the kerb — how are they scored?",
    back: "Bumping it costs 4 points. Mounting it — the wheel lifting onto the pavement — is immediate disqualification.",
    difficulty: 3,
  },
  {
    id: "fm_counter_steer",
    categoryId: "controls",
    front: "What does 'counter steer' mean on the yard test sheet?",
    back: "Straightening the front wheels out again after a lock. Do it while the vehicle is still moving.",
    difficulty: 3,
  },
  {
    id: "fm_pretrip_direction",
    categoryId: "controls",
    front: "Which way round the vehicle does the exterior pre-trip inspection go?",
    back: "Anti-clockwise, top to bottom, starting by looking underneath for leaks — or for a child or animal sheltering there.",
    difficulty: 2,
  },
  {
    id: "fm_pretrip_gate",
    categoryId: "controls",
    front: "What happens if the vehicle is judged unroadworthy during the exterior inspection?",
    back: "Immediate failure — you never reach the interior check. The inspection is a gate, not a scored section.",
    difficulty: 2,
  },
  {
    id: "fm_pretrip_declarations",
    categoryId: "controls",
    front: "What four things do you say aloud once the examiner is seated?",
    back: "All doors closed · parking brake engaged · gear in neutral (or park) · no obstructions on the floor or blocking your view through the windows.",
    difficulty: 3,
  },
  {
    id: "fm_wiper_check",
    categoryId: "controls",
    front: "How is a wiper blade checked during the pre-trip inspection?",
    back: "Lift it, feel the rubber, say aloud that it is not torn or perished, and leave the blade standing up so you know it is done.",
    difficulty: 3,
  },
  {
    id: "fm_alley_key_numbers",
    categoryId: "controls",
    front: "Alley docking — the three numbers to remember.",
    back: "Two attempts · poles about half a metre from the side of the vehicle · a fresh 360° check if you have been stopped more than three seconds. Stop with pole B in line with your head.",
    difficulty: 3,
  },
  {
    id: "fm_parallel_movements",
    categoryId: "controls",
    front: "How many movements does the parallel park allow?",
    back: "Three — reverse in, forward, straight back until the white dot lines up with your shoulder. Getting in cleanly in one movement is equally acceptable.",
    difficulty: 2,
  },
  {
    id: "fm_turn_moves",
    categoryId: "controls",
    front: "How many movements are allowed for the turn in the road?",
    back: "Three. A fourth is immediate disqualification — and the sequence checks are repeated before every one of them.",
    difficulty: 2,
  },
  {
    id: "fm_incline_neutral",
    categoryId: "controls",
    front: "Why must the gear go into neutral on the incline start?",
    back: "To prove the parking brake alone is holding the vehicle. In gear with the clutch down you could not tell. Any rearward roll on pulling away is immediate failure.",
    difficulty: 3,
  },
  {
    id: "fm_mirror_cadence",
    categoryId: "controls",
    front: "How often must you check the mirror during the road test?",
    back: "Every 5 to 8 seconds — and it costs 5 points every time you let it slip.",
    difficulty: 3,
  },
  {
    id: "fm_gear_penalties",
    categoryId: "controls",
    front: "Three gear-related road-test penalties.",
    back: "Eyes down at the lever: 5 points. Changing gear while cornering: 4. Selecting neutral before you stop ('gear coasting'): 3.",
    difficulty: 3,
  },
  {
    id: "fm_biting_point_revs",
    categoryId: "controls",
    front: "What do the revs do at the biting point?",
    back: "Set about 1 000 r/min, ease the clutch out, and the revs drop to around 750 as the engine takes up the car's weight. Without a rev counter: the bonnet lifts slightly.",
    difficulty: 3,
  },
  {
    id: "fm_reversing_technique",
    categoryId: "controls",
    front: "How should you sit and steer while reversing?",
    back: "Turn to your left and look out through the rear window; steer with the right hand on top of the wheel. The seat-belt requirement does not apply while reversing.",
    difficulty: 2,
  },
  {
    id: "fm_hand_signals",
    categoryId: "controls",
    front: "The four hand signals.",
    back: "Right turn: arm straight out, palm forward. Left turn: forearm down, rotated anti-clockwise. Stop: forearm straight up, palm forward. Slowing: forearm down, moved up and down.",
    difficulty: 3,
  },
  {
    id: "fm_hand_signal_rules",
    categoryId: "controls",
    front: "The rules around giving a hand signal on test.",
    back: "Mirror and right blind spot first (5 points if missed) · complete it from at least 100 m or 12 seconds out, before braking · two attempts, then you fail.",
    difficulty: 3,
  },
  {
    id: "fm_freeway_checks",
    categoryId: "controls",
    front: "Freeway entry and exit — the two distances.",
    back: "Start the checks 100 m (about 12 seconds) out, then check the blind spots again 50 m before the ramp. Past an on-ramp check left; past an off-ramp check both.",
    difficulty: 3,
  },
  {
    id: "fm_instant_road_fails",
    categoryId: "controls",
    front: "What ends the road test immediately?",
    back: "Breaking any rule of the road · rolling at a stop · disobeying a road sign · causing an accident · and the 'uncontrolled/dangerous' three: dangerous manoeuvring around pedestrians, unsafe gaps, cornering uncontrollably fast.",
    difficulty: 2,
  },
  {
    id: "fm_breakdown",
    categoryId: "controls",
    front: "The test vehicle breaks down mid-test. Pass, fail or something else?",
    back: "Deferred — a mechanical failure says nothing about your driving. An accident you cause, by contrast, is an immediate failure.",
    difficulty: 3,
  },
  {
    id: "fm_steering_hands",
    categoryId: "controls",
    front: "Where do your hands and thumbs go on the wheel?",
    back: "'Ten to two' or 'quarter to three', never the lower half — with both thumbs resting on the inside of the rim, not hooked through the spokes.",
    difficulty: 1,
  },
  {
    id: "fm_handbrake_order",
    categoryId: "controls",
    front: "Parking brake or neutral first when you stop?",
    back: "Parking brake first, then neutral — so there is never a moment when nothing is holding the car. To release: lift slightly, press the button fully, lower, release the button last.",
    difficulty: 3,
  },
  {
    id: "fm_automatic_restriction",
    categoryId: "controls",
    front: "What does passing your test in an automatic mean for your licence?",
    back: "It restricts you to automatics. Passing in a manual licenses you for both.",
    difficulty: 2,
  },
  {
    id: "fm_park_small_distances",
    categoryId: "parking",
    front: "The two smallest parking distances.",
    back: "1,5 m from a fire hydrant, and no more than 450 mm between your left wheels and the pavement edge. Outside an urban area, keep 1 m clear of the road edge unless you are in a marked bay.",
    difficulty: 3,
  },
  {
    id: "fm_park_6m_rule",
    categoryId: "parking",
    front: "Where does the 6 m stopping rule apply?",
    back: "Within 6 m of a tunnel, subway or bridge, and within 6 m of a point where the roadway narrows — the places with no room to pass a stopped vehicle.",
    difficulty: 3,
  },
  {
    id: "fm_park_actuating",
    categoryId: "parking",
    front: "Why may you not park on a traffic signal's actuating mechanism?",
    back: "It is the sensor loop in the road that tells the signal a vehicle is waiting. Block it and your approach may never get a green.",
    difficulty: 3,
  },
  {
    id: "fm_park_nine_metres",
    categoryId: "parking",
    front: "Two different rules use 9 m. Which?",
    back: "Nine metres from a pedestrian crossing (on the approach side, where a parked car hides waiting pedestrians), and the minimum road width for stopping alongside or opposite another vehicle.",
    difficulty: 3,
  },
  {
    id: "fm_park_exemptions",
    categoryId: "parking",
    front: "Who is exempt from the parking and stopping restrictions?",
    back: "Emergency vehicles, on-duty police and traffic officers, and road construction and maintenance vehicles. A disabled permit is not an exemption — it gives access to reserved bays only.",
    difficulty: 3,
  },
  {
    id: "fm_park_consequence",
    categoryId: "parking",
    front: "What happens if you park where you may not?",
    back: "A fine, and possibly impoundment. Recovering a towed vehicle costs considerably more than the fine itself.",
    difficulty: 2,
  },
];
