import type { Question } from "@/types";

/**
 * Vehicle controls — cockpit detail, roadside maintenance safety and load.
 * Facts trace to docs/content/facts/controls-yard.md.
 *
 * Sized to release code 08. The rules sprint took the rules group past 12.9
 * papers, at which point controls (96 questions, 8 per paper) became the cap at
 * exactly 12.00 — so without this batch the rules work would have stopped
 * short for the car licence. Universal, so every code gains it.
 *
 * Ground the earlier controls packs leave: how the controls are *set*, the
 * checks that are done with the engine off, and how load changes the way the
 * vehicle behaves. No item turns on a regulated numeric threshold.
 */
export const CONTROLS_SPRINT_QUESTIONS: Question[] = [
  // ── Cockpit detail ──────────────────────────────────────────
  {
    id: "qc4_mirror_night_setting",
    categoryId: "controls",
    prompt: "Most interior mirrors have a night (anti-dazzle) setting. Its purpose is to:",
    options: [
      "Dim the reflection of headlights behind you while still showing the traffic there",
      "Widen the field of view after dark",
      "Switch the mirror off so it cannot distract you",
      "Brighten the image in poor light",
    ],
    correctIndex: 0,
    explanation:
      "It tilts to a dimmer reflective surface, so you keep the information without the glare. Folding the mirror away instead would leave you with no rear view at all.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc4_seatbelt_lap_position",
    categoryId: "controls",
    prompt: "The lap portion of a seatbelt should sit:",
    options: [
      "Low across the hips, against the pelvis — not across the soft part of the stomach",
      "Across the middle of the stomach for comfort",
      "As high as possible, just under the ribs",
      "Anywhere, provided the buckle clicks home",
    ],
    correctIndex: 0,
    explanation:
      "The pelvis is bone and can take the load; the abdomen cannot. A belt worn too high causes serious internal injury in the crash it was meant to protect you from.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc4_seat_belt_twisted",
    categoryId: "controls",
    prompt: "A seatbelt that is twisted along its length:",
    options: [
      "Concentrates the crash load onto a narrow strip instead of spreading it — untwist it before driving",
      "Works exactly as well, since the webbing is the same",
      "Will not lock in a crash",
      "Is only a problem for rear passengers",
    ],
    correctIndex: 0,
    explanation:
      "The belt is wide because spreading the force is the whole design. Twisted, it becomes a strap that cuts rather than restrains.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc4_auto_lower_range_descent",
    categoryId: "controls",
    prompt: "Descending a long, steep hill in an automatic, selecting a lower range or gear:",
    options: [
      "Lets the engine hold the vehicle back, so the brakes are not asked to do all of it",
      "Is unnecessary — an automatic manages the descent itself",
      "Damages the transmission and should be avoided",
      "Only helps if the vehicle is towing",
    ],
    correctIndex: 0,
    explanation:
      "Riding the brakes down a pass overheats them and they fade. Most automatics offer a lower range or manual mode for exactly this, and using it is not hard on the box.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Checks done with the engine off ─────────────────────────
  {
    id: "qc4_hot_coolant_cap",
    categoryId: "controls",
    prompt: "The engine has overheated. You should never:",
    options: [
      "Open the radiator or coolant cap while it is still hot — the system is pressurised and will spray scalding coolant",
      "Switch the engine off",
      "Open the bonnet at all",
      "Let the engine idle to cool down",
    ],
    correctIndex: 0,
    explanation:
      "A hot cooling system is well above boiling point and held there by pressure. Releasing the cap drops the pressure and the coolant flashes to steam, straight at whoever is standing over it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc4_oil_check_method",
    categoryId: "controls",
    prompt: "To read the engine oil level accurately, the vehicle should be:",
    options: [
      "On level ground with the engine off and the oil settled for a few minutes",
      "On any surface, with the engine running",
      "Parked on a slope so the oil gathers at the dipstick",
      "Warm and idling, immediately after a long drive",
    ],
    correctIndex: 0,
    explanation:
      "Oil needs to drain back to the sump and sit flat before the dipstick means anything. Checked running, on a slope, or straight after driving, the reading is wrong in either direction.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc4_jack_safety",
    categoryId: "controls",
    prompt: "Changing a wheel at the roadside, you should:",
    options: [
      "Chock a wheel, jack on firm level ground, and never put any part of yourself under a jacked-up vehicle",
      "Jack the vehicle first and then loosen the nuts",
      "Leave the vehicle in neutral so it can be moved easily",
      "Work from the traffic side so you can watch approaching cars",
    ],
    correctIndex: 0,
    explanation:
      "A jack holds a vehicle up; it does not hold it safely. Loosen the nuts while the wheel is still on the ground, and stay out from underneath entirely.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qc4_space_saver_spare",
    categoryId: "controls",
    prompt: "A narrow 'space-saver' spare wheel is intended:",
    options: [
      "To get you to a place of repair at reduced speed — it is not a substitute for a full-size tyre",
      "To be used normally until the next service",
      "Only for the rear wheels",
      "As a permanent replacement once fitted",
    ],
    correctIndex: 0,
    explanation:
      "It is narrower and differently constructed, so grip, braking and handling are all compromised. It is a get-home device with a speed restriction printed on it.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Load and how the vehicle behaves ────────────────────────
  {
    id: "qc4_roof_load_handling",
    categoryId: "controls",
    prompt: "Carrying a heavy load on a roof rack affects the vehicle by:",
    options: [
      "Raising its centre of gravity, making it lean more in corners and less stable in a swerve",
      "Improving stability by adding weight",
      "Having no effect provided the load is strapped down",
      "Affecting only fuel consumption",
    ],
    correctIndex: 0,
    explanation:
      "Weight up high is the worst place for it. The car rolls further in a corner and recovers less willingly from a sudden avoidance — and its overall height has changed too.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qc4_boot_load_placement",
    categoryId: "controls",
    prompt: "Loading heavy items into a boot, they are best placed:",
    options: [
      "Low down and as far forward as possible, so the weight sits between the axles",
      "High up, so they do not shift",
      "Right at the back, over the rear bumper",
      "Wherever there is room — placement makes no difference",
    ],
    correctIndex: 0,
    explanation:
      "Weight hung out behind the rear axle levers the front wheels light and makes the tail want to swing. Low and forward keeps the car behaving the way it was designed to.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qc4_loose_items_cabin",
    categoryId: "controls",
    prompt: "Loose heavy items on the back seat or parcel shelf are a hazard because:",
    options: [
      "In a hard stop or a crash they fly forward with enormous force",
      "They unbalance the vehicle in corners",
      "They interfere with the seatbelt sensors",
      "They are only a problem if they block the rear window",
    ],
    correctIndex: 0,
    explanation:
      "Anything not secured keeps travelling at the speed the car was doing. A toolbox on the parcel shelf becomes a projectile aimed at the heads in front of it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qc4_towing_mirror_view",
    categoryId: "controls",
    prompt: "Towing a caravan wider than your car, the usual reason for fitting extension mirrors is that:",
    options: [
      "The standard mirrors show only the caravan, leaving you blind to traffic alongside and behind",
      "The law requires four mirrors on any combination",
      "They reduce buffeting from passing trucks",
      "They make the caravan easier to reverse",
    ],
    correctIndex: 0,
    explanation:
      "A wide load fills the mirror with its own flank. Without extensions you cannot see the lane you are about to move into, which is the manoeuvre that most often goes wrong when towing.",
    difficulty: 2,
    scope: "learners",
  },
];
