import type { DriverModule } from "@/types";

/**
 * Driver's-licence yard-test (K53) manoeuvre modules.
 * Designed as step-by-step "cook mode" procedures the learner steps through
 * while physically practising.
 */
export const DRIVER_MODULES: DriverModule[] = [
  {
    id: "parallel_parking",
    name: "Parallel parking",
    summary: "Reverse neatly into a kerbside bay between two markers without touching them.",
    difficulty: 2,
    estMinutes: 12,
    steps: [
      { n: 1, title: "Set up", instruction: "Pull up roughly level with the front marker, about half a metre out, parallel to the kerb.", tip: "Your back bumper should line up with the front marker / lead vehicle." },
      { n: 2, title: "Observe", instruction: "Do a full 360° observation — mirrors and both blind spots — and select reverse.", tip: "Examiners watch closely for blind-spot checks before you move." },
      { n: 3, title: "Reverse straight, then steer", instruction: "Reverse slowly straight back; as your rear marker reaches the front pole, turn the steering fully toward the kerb.", tip: "Go slow with the clutch at biting point; speed is never rewarded here." },
      { n: 4, title: "Swing in", instruction: "When the car is at about 45°, straighten the wheels briefly, then steer away from the kerb to bring the front in.", tip: "Glance at the kerb-side mirror to judge your distance." },
      { n: 5, title: "Straighten & centre", instruction: "Straighten the wheels and adjust forward/back so the car sits centred and parallel within the bay.", tip: "Final position should be within ~30 cm of the kerb." },
      { n: 6, title: "Secure", instruction: "Handbrake on, gear to neutral (or first), and do a final observation before the next instruction.", tip: "Securing the vehicle is itself a marked item." },
    ],
    commonFaults: [
      "Rolling more than ~30 cm or touching a marker/kerb (immediate fail)",
      "Not checking blind spots before reversing",
      "Mounting or scraping the kerb",
    ],
  },
  {
    id: "alley_docking",
    name: "Alley docking",
    summary: "Reverse into a 90° bay (the 'garage') and then drive out, staying inside the lines.",
    difficulty: 3,
    estMinutes: 14,
    steps: [
      { n: 1, title: "Approach", instruction: "Drive forward past the bay, keeping a consistent distance from the poles on the docking side.", tip: "The wider and straighter your approach, the easier the swing-in." },
      { n: 2, title: "Reference point", instruction: "Stop when your shoulder / B-pillar is level with the first pole of the bay.", tip: "Pick a fixed body reference you can repeat every time." },
      { n: 3, title: "Observe & reverse", instruction: "360° observation, select reverse, and begin turning the wheel fully toward the bay.", tip: "Keep the vehicle barely creeping — control beats speed." },
      { n: 4, title: "Watch the inner pole", instruction: "As the car swings, watch the inner (pivot) pole in your mirror and keep clear of it.", tip: "If you are running wide, pause, pull forward and reset rather than forcing it." },
      { n: 5, title: "Straighten into the bay", instruction: "Once aligned with the bay, straighten the wheels and reverse straight until fully inside the lines.", tip: "Use both mirrors to stay centred." },
      { n: 6, title: "Secure, then exit", instruction: "Secure the vehicle. On instruction, observe, select first gear and drive straight out, steering only once your front clears the poles.", tip: "Don't turn the wheel until the front of the car is past the bay opening." },
    ],
    commonFaults: [
      "Touching a pole or crossing a line",
      "Excessive shunting (more corrections than allowed)",
      "Turning the wheel too early on exit and clipping a pole",
    ],
  },
  {
    id: "three_point_turn",
    name: "Three-point turn",
    summary: "Turn the vehicle to face the opposite direction in a narrow road using forward-reverse-forward.",
    difficulty: 2,
    estMinutes: 10,
    steps: [
      { n: 1, title: "Position & observe", instruction: "Stop on the left, indicate, and do a full observation including blind spots. The road must be clear both ways.", tip: "Never start the turn with traffic approaching." },
      { n: 2, title: "Point 1 — forward", instruction: "Move forward slowly while steering fully right, aiming for the opposite kerb.", tip: "Slow car, fast hands — turn the wheel quickly while barely moving." },
      { n: 3, title: "Stop & reset steering", instruction: "Just before the far kerb, stop and quickly steer fully the other way (left).", tip: "Steer while stationary only if you can't avoid it; otherwise steer as you move." },
      { n: 4, title: "Point 2 — reverse", instruction: "Observe, select reverse and back up slowly while steering left, swinging the rear toward the other kerb.", tip: "Look over your shoulder through the rear window while reversing." },
      { n: 5, title: "Point 3 — forward", instruction: "Stop, reset the steering toward the new direction, observe, and drive forward into your new lane.", tip: "End up correctly positioned on the left of the road, facing the opposite way." },
      { n: 6, title: "Resume", instruction: "Cancel the indicator, do a final mirror check and continue.", tip: "Smooth control throughout matters more than doing it in exactly three moves." },
    ],
    commonFaults: [
      "Touching either kerb",
      "Not observing before each direction change",
      "Stalling repeatedly mid-manoeuvre",
    ],
  },
  {
    id: "incline_start",
    name: "Hill / incline start",
    summary: "Pull away on an uphill slope without rolling back more than the allowed margin.",
    difficulty: 2,
    estMinutes: 8,
    steps: [
      { n: 1, title: "Stopped on the incline", instruction: "Vehicle stationary on the slope, handbrake firmly on, in neutral or with the clutch in.", tip: "The handbrake is what stops the roll-back — trust it." },
      { n: 2, title: "Prepare", instruction: "Select first gear and find the clutch biting point until you feel the front of the car lift slightly.", tip: "The bonnet rising and engine note dipping signal the bite." },
      { n: 3, title: "Add power", instruction: "Apply a little more accelerator than on the flat to hold the car against gravity.", tip: "Too little power = roll back or stall; build it smoothly." },
      { n: 4, title: "Release handbrake", instruction: "With the bite held and power on, release the handbrake smoothly.", tip: "If the nose dips, you released too early — re-apply and rebalance." },
      { n: 5, title: "Move off", instruction: "Ease the clutch out fully as you feed in power and pull away, then observe and merge.", tip: "Rolling back beyond ~25 cm is a fail, so err toward a touch more power." },
    ],
    commonFaults: [
      "Rolling back over the allowed margin (immediate fail)",
      "Stalling by releasing the clutch too fast",
      "Forgetting to observe before pulling off",
    ],
  },
  {
    id: "vehicle_inspection",
    name: "Pre-trip vehicle inspection",
    summary: "The K53 pre-drive checks you must point out before the test begins.",
    difficulty: 1,
    estMinutes: 7,
    steps: [
      { n: 1, title: "Walk-around", instruction: "Check tyres (tread & inflation), bodywork, that nothing leaks underneath, and the number plates are clean and legible.", tip: "Tread must be at least 1 mm; look for cuts and bulges." },
      { n: 2, title: "Lights & signals", instruction: "Confirm headlights, brake lights, indicators and hazards all work.", tip: "Walk around or use a reflection to verify rear lights." },
      { n: 3, title: "Inside checks", instruction: "Adjust seat, head restraint and all mirrors; check the windscreen is clean and undamaged.", tip: "You should reach all controls and pedals comfortably." },
      { n: 4, title: "Safety equipment", instruction: "Confirm seatbelts work, the handbrake holds, the hooter sounds and there's a warning triangle.", tip: "Fasten your seatbelt before starting — a marked item." },
      { n: 5, title: "Start-up routine", instruction: "Handbrake on, gear in neutral, clutch in, then start the engine and check the warning lights go out.", tip: "Note any dashboard light that stays on (oil, brakes, ABS)." },
    ],
    commonFaults: [
      "Skipping the seatbelt before starting",
      "Not noticing a defect you were meant to point out",
      "Starting in gear without the clutch in",
    ],
  },
  {
    id: "mirror_blindspot",
    name: "Mirror & blind-spot routine",
    summary: "The observation discipline examiners look for before every manoeuvre.",
    difficulty: 1,
    estMinutes: 6,
    steps: [
      { n: 1, title: "Set mirrors", instruction: "Before moving, adjust the interior and both side mirrors so you can see the road behind and the lanes beside you.", tip: "Set side mirrors so you can just see the side of your own car." },
      { n: 2, title: "Mirror–signal–manoeuvre", instruction: "Before any move, follow the sequence: check mirrors, signal your intention, then manoeuvre.", tip: "Signal early enough to give others time to react." },
      { n: 3, title: "The blind-spot check", instruction: "Before moving off, changing lanes or turning, glance over the relevant shoulder to cover the blind spot.", tip: "A quick glance — don't take your attention off the road ahead for long." },
      { n: 4, title: "360° before moving off", instruction: "When pulling away from a stop, do a full check all around, including both blind spots.", tip: "Examiners specifically watch for the blind-spot glance when moving off." },
      { n: 5, title: "Keep scanning", instruction: "While driving, keep cycling mirrors every few seconds so you always know what is around you.", tip: "Good observation is continuous, not a one-time check." },
    ],
    commonFaults: [
      "Moving off without a blind-spot check",
      "Signalling after starting the manoeuvre instead of before",
      "Staring at mirrors so long you drift in your lane",
    ],
  },

  // ── Road test ──────────────────────────────────────────────
  {
    id: "moving_off",
    name: "Moving off into traffic",
    summary: "Pull away safely from the kerb into the traffic stream, with full observation.",
    difficulty: 1,
    estMinutes: 6,
    steps: [
      { n: 1, title: "Prepare", instruction: "With the engine running and handbrake on, select first gear and find the clutch biting point.", tip: "Get the car ready to move before you look, so you can go as soon as it's clear." },
      { n: 2, title: "Observe 360°", instruction: "Check ahead, both mirrors and both blind spots for traffic, cyclists and pedestrians.", tip: "The right-hand blind-spot check is the one examiners watch for most when moving off." },
      { n: 3, title: "Signal", instruction: "If there is any traffic to benefit from it, signal right to show you are pulling off.", tip: "Signal only when it helps — needless signalling is also marked." },
      { n: 4, title: "Move off", instruction: "Release the handbrake, ease out the clutch with a little accelerator, and pull away smoothly into the lane.", tip: "Don't roll back or lurch — smooth, coordinated control scores best." },
      { n: 5, title: "Settle & cancel", instruction: "Take up your road position, build to a safe speed and cancel the signal.", tip: "Check the mirror again once you're moving to confirm the picture behind." },
    ],
    commonFaults: [
      "Pulling off without the blind-spot check",
      "Rolling backwards as you release the clutch",
      "Cutting in front of traffic you should have yielded to",
    ],
  },
  {
    id: "lane_change",
    name: "Lane change",
    summary: "Move one lane across cleanly using the mirror–signal–blind-spot–manoeuvre routine.",
    difficulty: 2,
    estMinutes: 6,
    steps: [
      { n: 1, title: "Mirror, blind spot, signal", instruction: "Check your mirrors, then the blind spot on the side you're moving to, then signal.", tip: "Never change lanes inside an intersection." },
      { n: 2, title: "Re-check the blind spot", instruction: "Glance at that blind spot once more, because the picture can change in a second.", tip: "Keep your wheels straight while you glance." },
      { n: 3, title: "Steer across", instruction: "When it is clearly safe, steer smoothly into the next lane — no sudden swerve.", tip: "For crossing two lanes, check the blind spot again before each lane." },
      { n: 4, title: "Position & cancel", instruction: "Centre the car in the new lane and cancel the signal.", tip: "A signal left flashing confuses others and is penalised." },
    ],
    commonFaults: [
      "Relying on mirrors only and missing the blind spot",
      "Signalling after you've already started moving across",
      "Forgetting to cancel the indicator",
    ],
  },
  {
    id: "turn_left",
    name: "Turning left at an intersection",
    summary: "The K53 sequence for a controlled left turn, keeping close to the left.",
    difficulty: 2,
    estMinutes: 7,
    steps: [
      { n: 1, title: "Mirror, blind spot, signal left", instruction: "In good time, check mirrors, check the left blind spot and signal left.", tip: "Early signalling lets cyclists and pedestrians read your intention." },
      { n: 2, title: "Position left", instruction: "Move to the left of your lane, keeping as close as is safe to the left edge.", tip: "A tight, correct position discourages cyclists from sneaking up your inside." },
      { n: 3, title: "Slow & select gear", instruction: "Decelerate or brake as needed and select a lower gear to match the turn speed.", tip: "Do your braking before the corner, not while steering through it." },
      { n: 4, title: "Yield & observe", instruction: "Yield to pedestrians crossing the road you are entering, then observe 360° and re-check the left blind spot.", tip: "Pedestrians on the side road have right of way as you turn in." },
      { n: 5, title: "Complete the turn", instruction: "With wheels straightened just before turning, steer smoothly into the correct lane of the new road.", tip: "End up on the left side of the road you enter, then cancel the signal." },
    ],
    commonFaults: [
      "Swinging wide to the right before turning left",
      "Not yielding to pedestrians on the side road",
      "Turning with the front wheels still on lock from the previous manoeuvre",
    ],
  },
  {
    id: "turn_right",
    name: "Turning right at an intersection",
    summary: "Position, yield and complete a right turn into the correct side of the new road.",
    difficulty: 3,
    estMinutes: 8,
    steps: [
      { n: 1, title: "Mirror, blind spot, signal right", instruction: "In good time check mirrors, check the right blind spot and signal right.", tip: "Plan the turn early so you aren't rushed at the line." },
      { n: 2, title: "Position to the centre", instruction: "Move to just left of the centre line, as close as possible to the centre of the intersection.", tip: "Correct positioning lets following traffic pass on your left." },
      { n: 3, title: "Yield to oncoming", instruction: "Give way to oncoming traffic going straight or turning left, and to pedestrians; stop if there is no safe gap.", tip: "Keep your wheels straight while waiting, so a knock from behind won't push you into oncoming traffic." },
      { n: 4, title: "Observe & go", instruction: "When a safe gap appears, observe 360°, re-check the blind spot and move.", tip: "Cross so you turn into the left side of the road you are entering." },
      { n: 5, title: "Complete & cancel", instruction: "Steer into the appropriate lane, straighten up and cancel the signal.", tip: "Confirm the indicator has cancelled after the turn." },
    ],
    commonFaults: [
      "Turning across a gap that was too small",
      "Cutting the corner into the wrong side of the new road",
      "Waiting with the wheels already turned right",
    ],
  },
  {
    id: "controlled_stop",
    name: "Stopping & securing the vehicle",
    summary: "Bring the car to a smooth, safe stop at the side of the road and secure it.",
    difficulty: 2,
    estMinutes: 6,
    steps: [
      { n: 1, title: "Mirror, blind spot, signal", instruction: "Check mirrors, check the left blind spot and signal left to show you are pulling over.", tip: "Pick a legal, safe place — not on a no-stopping zone, crossing or bend." },
      { n: 2, title: "Slow down", instruction: "Decelerate and brake timeously, smoothly and progressively without locking the wheels, both hands on the wheel.", tip: "Brake on a straight course where you can." },
      { n: 3, title: "Steer in & declutch", instruction: "Steer to the side of the road, and disengage the clutch just before stopping so you don't stall.", tip: "Keep a clear space — about 4–5 m behind any vehicle ahead." },
      { n: 4, title: "Stop & secure", instruction: "Stop, apply the parking brake (using the ratchet), and select neutral.", tip: "Securing the vehicle is itself a marked item." },
      { n: 5, title: "Before opening the door", instruction: "Cancel the signal, engage a gear to prevent rolling, and check mirrors and blind spots before opening the door.", tip: "Opening a door into a passing cyclist is a serious, avoidable fault." },
    ],
    commonFaults: [
      "Stopping in a no-stopping place or too far from the kerb",
      "Stalling by releasing the clutch too late or too early",
      "Opening the door without checking behind",
    ],
  },
  {
    id: "freeway",
    name: "Entering & leaving a freeway",
    summary: "Match speed and merge safely from an on-ramp, and exit calmly via the off-ramp.",
    difficulty: 3,
    estMinutes: 9,
    steps: [
      { n: 1, title: "Set up on the on-ramp", instruction: "Select the correct lane of the on-ramp and build speed to match the freeway traffic.", tip: "The aim is to join at traffic speed, not to stop and crawl on." },
      { n: 2, title: "Mirror, blind spot, signal", instruction: "Check mirrors, check the right blind spot and signal your intention to merge.", tip: "Find your gap early while you still have ramp left." },
      { n: 3, title: "Merge", instruction: "Accelerate into a safe gap, observe 360°, re-check the blind spot and steer smoothly into the lane.", tip: "Yield to traffic already on the freeway — they have right of way." },
      { n: 4, title: "Settle & keep left", instruction: "Cancel the signal, keep left and hold a safe following distance (at least 2–3 seconds).", tip: "Use the right lanes only to overtake, then return left." },
      { n: 5, title: "Leaving", instruction: "Well before your exit, check mirrors, signal left, move into the deceleration lane and only slow once you're off the through lane.", tip: "Don't brake on the freeway itself — slow down on the off-ramp." },
    ],
    commonFaults: [
      "Merging too slowly and forcing freeway traffic to brake",
      "Crossing into the exit lane and braking on the main carriageway",
      "Sitting in the right lane instead of keeping left",
    ],
  },
  {
    id: "emergency_stop",
    name: "Emergency (controlled) stop",
    summary: "Stop the vehicle as quickly and safely as possible in a straight line, under full control.",
    difficulty: 3,
    estMinutes: 5,
    steps: [
      { n: 1, title: "React", instruction: "On the signal, brake firmly and progressively with the right foot — quick but not a panic stamp.", tip: "Keep both hands on the wheel and the car straight." },
      { n: 2, title: "Brake & declutch", instruction: "Apply maximum safe braking; just before stopping, press the clutch to prevent stalling.", tip: "With ABS, keep firm pressure on the pedal and steer — don't pump it." },
      { n: 3, title: "Hold it straight", instruction: "Don't lock the wheels or swerve; keep the vehicle straight and under control to a complete stop.", tip: "Locked wheels lengthen the stop and cost you steering." },
      { n: 4, title: "Secure & move off", instruction: "Apply the parking brake, then before moving off again do a full 360° observation, including blind spots.", tip: "Other traffic won't expect your sudden stop — check carefully before pulling away." },
    ],
    commonFaults: [
      "Stamping so hard the wheels lock and the car skids",
      "Forgetting the clutch and stalling",
      "Pulling off afterward without observing",
    ],
  },
];

export const DRIVER_MODULES_BY_ID: Record<string, DriverModule> = Object.fromEntries(
  DRIVER_MODULES.map((m) => [m.id, m]),
);
