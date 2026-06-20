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
];

export const DRIVER_MODULES_BY_ID: Record<string, DriverModule> = Object.fromEntries(
  DRIVER_MODULES.map((m) => [m.id, m]),
);
