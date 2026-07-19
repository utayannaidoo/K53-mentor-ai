import type { Question } from "@/types";

/**
 * Vehicle controls — operation, cockpit routine and yard-test technique.
 * Facts trace to docs/content/facts/controls-yard.md.
 *
 * Written to lift the controls pool for *every* licence code: the mock draws 8
 * controls questions per paper, and code 08 had only 45 to draw on, which capped
 * distinct papers at 5.6 regardless of how deep the signs and rules pools got.
 * Nothing here is code-gated, so all three codes gain the full batch.
 *
 * Deliberately confined to how the controls work and the K53 technique taught
 * for them — the stable, universally taught material. Items turning on a
 * regulated threshold (tread depth, equipment that must legally be carried)
 * are left out; those belong with the rules pack, against a cited regulation.
 */
export const CONTROLS_EXTRA_QUESTIONS: Question[] = [
  // ── Cockpit drill & driving position ────────────────────────
  {
    id: "qx_ctrl_seat_distance",
    categoryId: "controls",
    prompt: "Your seat is correctly positioned when you can:",
    options: [
      "Fully depress the clutch with a slight bend still left in your knee",
      "Sit as far back as possible for a better view of the road",
      "Sit close enough that your chest almost touches the steering wheel",
      "Reach the pedals only by stretching your leg straight",
    ],
    correctIndex: 0,
    explanation:
      "You must be able to press any pedal to the floor without locking your leg straight — a slight bend left at full clutch travel. Too far back and you lose control of the pedals; too close and the wheel and airbag become a hazard.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qx_ctrl_interior_mirror_aim",
    categoryId: "controls",
    prompt: "The interior (rear-view) mirror is correctly adjusted when it:",
    options: [
      "Frames the whole rear window with as little of the car's interior as possible",
      "Shows mostly the back seat so you can watch passengers",
      "Points at the road surface just behind the rear bumper",
      "Shows the same view as the left side mirror",
    ],
    correctIndex: 0,
    explanation:
      "Aim the interior mirror to fill it with the rear window. Anything else — seats, roof lining, your own head — is view you have given away.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qx_ctrl_side_mirror_aim",
    categoryId: "controls",
    prompt: "Your side (door) mirrors are best set so that you see:",
    options: [
      "Mostly the lane beside you, with just a sliver of your own vehicle at the inner edge",
      "As much of your own vehicle's side as possible",
      "Only the sky and the horizon behind you",
      "The same image as the interior mirror",
    ],
    correctIndex: 0,
    explanation:
      "A thin strip of your own car gives you a reference point; the rest of the glass should be doing useful work showing the lane next to you. Filling the mirror with your own bodywork widens your blind spot.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qx_ctrl_blind_spot_meaning",
    categoryId: "controls",
    prompt: "The 'blind spot' is:",
    options: [
      "The area around your vehicle that your mirrors do not show you",
      "The area directly in front of the bonnet",
      "Any part of the road hidden by rain or fog",
      "The gap between your headlights' beams at night",
    ],
    correctIndex: 0,
    explanation:
      "Mirrors cannot cover everything — a vehicle alongside and slightly behind can sit completely unseen. That is why K53 asks for a physical head check, not just a mirror glance, before you change direction.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qx_ctrl_doors_closed",
    categoryId: "controls",
    prompt: "During the cockpit drill, the doors must be:",
    options: [
      "Closed and secure before the vehicle moves",
      "Left slightly ajar so you can hear traffic",
      "Unlocked and open until you have adjusted the mirrors",
      "Locked only after you have moved off",
    ],
    correctIndex: 0,
    explanation:
      "All doors closed and secure is part of the pre-drive routine — an unlatched door can swing open in a turn and is a scored item on test.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qx_ctrl_seatbelt_before_start",
    categoryId: "controls",
    prompt: "In the cockpit routine, your seatbelt should be fastened:",
    options: [
      "After the seat, head restraint and mirrors are set, and before you move off",
      "Only once you have already pulled away and are up to speed",
      "Before adjusting the seat, so the seat cannot move",
      "Only when driving outside built-up areas",
    ],
    correctIndex: 0,
    explanation:
      "Set the seat first — the belt only sits correctly once you are in your final driving position. Then belt up, and only then move off.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Instruments & warning lights ────────────────────────────
  {
    id: "qx_ctrl_brake_warning_light",
    categoryId: "controls",
    prompt: "You release the handbrake but the brake-system warning light stays on. You should:",
    options: [
      "Not drive, and have the braking system checked",
      "Keep driving — it always clears once the brakes warm up",
      "Pump the brake pedal a few times and carry on",
      "Ignore it unless the pedal also feels soft",
    ],
    correctIndex: 0,
    explanation:
      "With the handbrake fully released, that light points at the braking system itself — low fluid or a fault. Brakes are not something to diagnose at speed, so don't drive on it.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qx_ctrl_engine_light",
    categoryId: "controls",
    prompt: "The engine-management warning light comes on and stays on while you drive. It means:",
    options: [
      "The engine's control system has detected a fault that needs checking",
      "The engine has reached its normal operating temperature",
      "You are due for a licence renewal",
      "The fuel in the tank is of poor quality",
    ],
    correctIndex: 0,
    explanation:
      "It reports a fault the engine's control system has picked up. A steady light usually means drive on gently and get it read; a flashing one means stop as soon as it is safe.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qx_ctrl_speedometer",
    categoryId: "controls",
    prompt: "The speedometer's role while you drive is to:",
    options: [
      "Tell you your road speed so you can match it to the limit and conditions",
      "Show how many kilometres the vehicle has travelled in total",
      "Show how hard the engine is working",
      "Indicate how much fuel remains",
    ],
    correctIndex: 0,
    explanation:
      "Speed is judged on the instrument, not on feel — you acclimatise to speed quickly, which is exactly why you must glance at the speedometer rather than trust your senses.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qx_ctrl_abs_pedal_feel",
    categoryId: "controls",
    prompt: "Braking hard in a car with ABS, the pedal shudders and buzzes under your foot. You should:",
    options: [
      "Keep firm pressure on the pedal and steer where you need to go",
      "Release the pedal at once — the brakes are failing",
      "Pump the pedal on and off rapidly yourself",
      "Pull the handbrake up to help stop",
    ],
    correctIndex: 0,
    explanation:
      "That pulsing is ABS doing its job, releasing and reapplying far faster than any foot could. Stay on the pedal — ABS is what lets you keep steering while braking hard.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Clutch, gears & moving off ──────────────────────────────
  {
    id: "qx_ctrl_clutch_before_stop",
    categoryId: "controls",
    prompt: "As you brake to a complete stop in a manual car, you must press the clutch down:",
    options: [
      "Before the engine speed drops far enough to stall",
      "Only after the vehicle has come to a complete stop",
      "At the same moment you first touch the brake, every time",
      "Never — the clutch plays no part in stopping",
    ],
    correctIndex: 0,
    explanation:
      "The wheels and engine are still connected while the clutch is up, so as road speed falls the engine is dragged down with it. Clutch in before that point and you stop smoothly instead of stalling.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qx_ctrl_eyes_on_road_gear",
    categoryId: "controls",
    prompt: "While changing gear, your eyes should stay:",
    options: [
      "On the road ahead — the gear lever is found by feel",
      "On the gear lever, to be certain of the gear",
      "On the rev counter until the change is complete",
      "On the mirrors for the whole gear change",
    ],
    correctIndex: 0,
    explanation:
      "A glance down is a car-length or more travelled blind. Gear changes are learnt by feel precisely so your eyes never leave the road.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qx_ctrl_coasting_neutral",
    categoryId: "controls",
    prompt: "Rolling down a long hill in neutral (or with the clutch held down) is dangerous because:",
    options: [
      "You lose engine braking and much of your control over the vehicle",
      "It uses considerably more fuel than staying in gear",
      "The gearbox will be damaged by the wheels turning",
      "The brake lights stop working in neutral",
    ],
    correctIndex: 0,
    explanation:
      "Coasting hands the whole job of slowing to your brakes, which fade as they heat, and leaves you with no drive to accelerate out of trouble. Stay in a gear suited to the descent.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qx_ctrl_moveoff_sequence",
    categoryId: "controls",
    prompt: "Moving off from the kerb in a manual car, the correct order is:",
    options: [
      "Clutch in and select first, signal, full observation, release handbrake, pull away at the biting point",
      "Release the handbrake, pull away, then signal and check your mirrors",
      "Signal, release the handbrake, then select a gear while already rolling",
      "Full observation, pull away, then select first gear",
    ],
    correctIndex: 0,
    explanation:
      "Prepare the car, tell others what you intend, then look — and only move once the look says it is safe. Releasing the handbrake before the observation is the classic test fail.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qx_ctrl_handbrake_at_stop",
    categoryId: "controls",
    prompt: "Waiting at a red robot for more than a moment, the better habit is to:",
    options: [
      "Apply the handbrake and select neutral rather than hold the clutch down",
      "Hold the clutch down in first gear for the whole wait",
      "Leave the car in gear with only the footbrake holding it",
      "Switch the engine off and restart when the light changes",
    ],
    correctIndex: 0,
    explanation:
      "Handbrake and neutral saves the clutch release bearing, rests your leg, and means a knock from behind cannot shunt you into the intersection.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qx_ctrl_reverse_speed",
    categoryId: "controls",
    prompt: "Speed while reversing is best controlled by:",
    options: [
      "Slipping the clutch around the biting point, at little more than walking pace",
      "Accelerating briskly to get the manoeuvre over with",
      "Holding the clutch fully down and steering only",
      "Using the handbrake to check your speed repeatedly",
    ],
    correctIndex: 0,
    explanation:
      "Reversing is a precision job with a compromised view. Working the clutch around the biting point gives crawling pace and the time to keep looking around you.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Steering & manoeuvres ───────────────────────────────────
  {
    id: "qx_ctrl_no_crossing_arms",
    categoryId: "controls",
    prompt: "The K53 steering method asks you not to cross your arms over the wheel because:",
    options: [
      "Crossed arms limit how far you can steer next and sit in the airbag's path",
      "It is more tiring than feeding the wheel",
      "It wears the steering wheel cover unevenly",
      "It makes the power steering work harder",
    ],
    correctIndex: 0,
    explanation:
      "Feeding the wheel pull-push keeps a hand free to keep turning and keeps your arms clear of a deploying airbag. Crossed arms leave you tangled at the moment you most need another turn of lock.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qx_ctrl_turn_in_road_purpose",
    categoryId: "controls",
    prompt: "The 'turn in the road' (three-point turn) manoeuvre tests your ability to:",
    options: [
      "Reverse the vehicle's direction in a confined space under full control and observation",
      "Complete a U-turn in as few movements as possible, whatever the space",
      "Turn the vehicle around without ever using reverse gear",
      "Park the vehicle facing oncoming traffic",
    ],
    correctIndex: 0,
    explanation:
      "It is about control and observation in a tight space, not speed or a fixed number of movements — you keep looking throughout, and use as many shunts as the road width honestly needs.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qx_ctrl_parallel_finish",
    categoryId: "controls",
    prompt: "A parallel parking attempt in the yard test is completed correctly when the vehicle:",
    options: [
      "Ends up fully inside the marked bay without having touched a pole or line",
      "Is inside the bay, with light contact on the poles being acceptable",
      "Is roughly in the bay, provided it took only one movement",
      "Is parked in the bay at any angle, as long as it fits",
    ],
    correctIndex: 0,
    explanation:
      "Finish inside the demarcated bay with nothing touched. Contact with a pole or line is a fail item — the bay stands in for the real cars you would otherwise be hitting.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qx_ctrl_yard_time_limit",
    categoryId: "controls",
    prompt: "The K53 yard test (pre-trip inspection and manoeuvres) must be completed within:",
    options: [
      "About 21 minutes",
      "About 5 minutes",
      "About 45 minutes",
      "There is no time limit on the yard test",
    ],
    correctIndex: 0,
    explanation:
      "The yard test is timed at 20 minutes 59 seconds for the inspection and manoeuvres together. It is generous if you work methodically, but it does rule out starting over repeatedly.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qx_ctrl_observation_before_reverse",
    categoryId: "controls",
    prompt: "Before you begin reversing in the yard test, your observation must include:",
    options: [
      "A look all around, finishing with a look through the rear window in the direction you will travel",
      "A glance in the interior mirror only",
      "A check of the reversing camera screen alone",
      "A look over your right shoulder only",
    ],
    correctIndex: 0,
    explanation:
      "All round first, because a child or cyclist can be anywhere, then eyes where the vehicle is actually going. Mirrors and cameras supplement that look — they don't replace it.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Lights, signals & visibility ────────────────────────────
  {
    id: "qx_ctrl_signal_timing",
    categoryId: "controls",
    prompt: "Your indicator should be switched on:",
    options: [
      "In good time before the manoeuvre, so others can act on it",
      "At the exact moment you begin to turn the wheel",
      "Only once you have already started changing lane",
      "After the manoeuvre, to confirm what you did",
    ],
    correctIndex: 0,
    explanation:
      "A signal is a warning of intent, so it has to arrive before the action. Signal too late and it reports what you are already doing, which helps nobody.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qx_ctrl_signal_no_permission",
    categoryId: "controls",
    prompt: "Signalling your intention to pull out means that:",
    options: [
      "You have told others what you intend — you must still check it is safe before moving",
      "Other traffic is now obliged to make room for you",
      "You have right of way over vehicles already in the lane",
      "You no longer need to check your blind spot",
    ],
    correctIndex: 0,
    explanation:
      "An indicator asks; it does not take. The observation still decides whether you go, which is why the look comes after the signal and immediately before the move.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qx_ctrl_brake_light_check",
    categoryId: "controls",
    prompt: "During a pre-trip walk-around, brake lights are best checked by:",
    options: [
      "Having someone press the brake pedal while you look, or using a reflective surface behind you",
      "Pressing the pedal yourself and listening for a click",
      "Assuming they work if the dashboard shows no warning",
      "Checking them only when the vehicle goes for a service",
    ],
    correctIndex: 0,
    explanation:
      "Brake lights only light while the pedal is down, so they cannot be checked from the driver's seat alone. A helper, or the reflection in a window or wall behind you, is how you actually confirm them.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qx_ctrl_misting_demister",
    categoryId: "controls",
    prompt: "The windscreen mists up on the inside while you are driving. The most effective response is to:",
    options: [
      "Use the demister and air conditioning to clear it, wiping only as a stopgap",
      "Wipe it continuously with your hand and drive on",
      "Switch the windscreen wipers to their fastest setting",
      "Open all the windows fully and keep your speed up",
    ],
    correctIndex: 0,
    explanation:
      "Misting is warm damp air meeting cold glass; the demister and air conditioning dry the air and fix the cause. Wiping by hand smears the glass and takes a hand off the wheel.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qx_ctrl_washer_wiper_pretrip",
    categoryId: "controls",
    prompt: "A pre-trip check of the windscreen wipers should include:",
    options: [
      "That the blades clear the glass without smearing and that there is washer fluid",
      "Only that the wipers move when switched on",
      "Nothing — wipers are checked at the annual service",
      "That the blades are dry to the touch before driving",
    ],
    correctIndex: 0,
    explanation:
      "A wiper that only moves is not a wiper that works. Perished blades smear and can leave you effectively blind in the first hard rain, and washers are useless without fluid.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Leaving the vehicle & parking discipline ────────────────
  {
    id: "qx_ctrl_securing_on_leaving",
    categoryId: "controls",
    prompt: "Before you leave a parked vehicle, you should:",
    options: [
      "Apply the handbrake firmly, switch off the engine and take the key with you",
      "Leave it in neutral with the engine running if you will only be a moment",
      "Leave the handbrake off so the vehicle can be pushed if needed",
      "Switch off the engine but leave the key in the ignition",
    ],
    correctIndex: 0,
    explanation:
      "Handbrake on, engine off, key with you. A vehicle left running and unattended can be driven off by anyone, and one left without a handbrake can roll on a slope you did not notice.",
    difficulty: 1,
    scope: "learners",
  },
  {
    id: "qx_ctrl_handbrake_hard_park",
    categoryId: "controls",
    prompt: "When parking on a steep slope, the handbrake should be:",
    options: [
      "Applied firmly, with a gear (or Park) selected as well",
      "Applied only lightly, to avoid straining the cable",
      "Left off, with the vehicle in neutral",
      "Replaced by leaving the footbrake pressed",
    ],
    correctIndex: 0,
    explanation:
      "On a slope the handbrake alone carries the whole load. Leaving a gear engaged — or Park in an automatic — gives a second line of defence if the cable slips.",
    difficulty: 2,
    scope: "learners",
  },

  // ── Automatics ──────────────────────────────────────────────
  {
    id: "qx_ctrl_auto_selector_stationary",
    categoryId: "controls",
    prompt: "In an automatic vehicle, you should select Park or Reverse only when the vehicle is:",
    options: [
      "Completely stationary, with the footbrake applied",
      "Rolling slowly, to make the change smoother",
      "In motion at any speed below walking pace",
      "Being held on the handbrake while still moving",
    ],
    correctIndex: 0,
    explanation:
      "Selecting Park or Reverse against a moving vehicle loads the transmission hard and can damage it. Stop completely on the footbrake first.",
    difficulty: 2,
    scope: "learners",
  },
  {
    id: "qx_ctrl_auto_creep",
    categoryId: "controls",
    prompt: "An automatic car in Drive tends to 'creep' forward at idle. This means you should:",
    options: [
      "Keep the footbrake applied while stopped in Drive",
      "Select Park at every stop, however brief",
      "Rest your left foot on the accelerator to hold it",
      "Switch the engine off whenever you stop",
    ],
    correctIndex: 0,
    explanation:
      "In Drive the car wants to move the moment your foot leaves the brake. Keep the brake on while stopped — that creep is exactly what nudges cars into the one in front.",
    difficulty: 1,
    scope: "learners",
  },

  // ── Hazard response & control faults ────────────────────────
  {
    id: "qx_ctrl_tyre_blowout",
    categoryId: "controls",
    prompt: "A front tyre bursts at speed. You should:",
    options: [
      "Hold the wheel firmly, ease off the accelerator and slow gradually before pulling off",
      "Brake as hard as you can immediately",
      "Steer sharply onto the shoulder straight away",
      "Pull the handbrake up to stop as quickly as possible",
    ],
    correctIndex: 0,
    explanation:
      "A burst front tyre drags the car toward that side, and hard braking or sharp steering on top of that can spin it. Grip the wheel, lift off, and let the speed fall away before you leave the road.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qx_ctrl_brake_fade",
    categoryId: "controls",
    prompt: "Riding the brakes continuously down a long descent is unwise mainly because:",
    options: [
      "The brakes overheat and become less effective — brake fade",
      "It wears the tyres out faster than the brakes",
      "The brake lights will burn out from constant use",
      "It uses more fuel than engine braking",
    ],
    correctIndex: 0,
    explanation:
      "Brakes shed speed by turning it into heat, and hot brakes stop working as well just as you need them most. Let a lower gear hold the speed and use the brakes in firm, brief applications.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qx_ctrl_stuck_accelerator",
    categoryId: "controls",
    prompt: "The accelerator sticks open while you are driving. Your first actions should be to:",
    options: [
      "Press the clutch in (or select neutral) and brake, steering to a safe stop",
      "Switch the ignition off immediately at speed",
      "Pull the handbrake up hard while still in gear",
      "Accelerate briefly to free the pedal",
    ],
    correctIndex: 0,
    explanation:
      "Break the link between engine and wheels first — clutch in or neutral — then brake normally and steer off the road. Killing the ignition at speed costs you the power steering and brake assist you still need.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qx_ctrl_wet_brake_dry",
    categoryId: "controls",
    prompt: "After driving through deep standing water, your brakes may feel weak. The recommended response is to:",
    options: [
      "Dry them by driving slowly while applying light brake pressure",
      "Brake hard once at speed to clear the water",
      "Stop and wait for them to dry on their own",
      "Pump the handbrake repeatedly while driving",
    ],
    correctIndex: 0,
    explanation:
      "Water between pad and disc kills friction. Gentle, sustained pressure at low speed heats and wipes them dry — and you should test them before you need them in anger.",
    difficulty: 3,
    scope: "learners",
  },
  {
    id: "qx_ctrl_power_steering_heavy",
    categoryId: "controls",
    prompt: "The steering suddenly becomes very heavy while driving, though the engine is still running. You should:",
    options: [
      "Keep a firm two-handed grip, slow down and stop somewhere safe to investigate",
      "Let go of the wheel briefly to see if it self-centres",
      "Speed up, since power steering works better at speed",
      "Carry on to your destination — heavy steering is normal when warm",
    ],
    correctIndex: 0,
    explanation:
      "Heavy steering with the engine running points at a power-steering failure. The car still steers, but it needs real effort — hold on with both hands, shed speed, and get off the road.",
    difficulty: 3,
    scope: "learners",
  },
];
