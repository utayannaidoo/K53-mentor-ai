import type { Scenario } from "@/types";

/**
 * Vehicle-control scenarios. Facts trace to docs/content/facts/controls-yard.md.
 *
 * Code 08 had no controls scenario at all and code A had one, which is why
 * `controls` was the one core category the scenario balance test could not
 * assert on. These are universal, so every code gains them and the exclusion
 * can be lifted.
 *
 * Controls is the section most easily reduced to "which pedal does what". These
 * deliberately pick the moments where knowing the control is not the hard part —
 * a warning light far from help, a stall with traffic behind, a hill start with
 * someone on your bumper. The pressure is what makes the decision hard.
 */
export const CONTROLS_SCENARIOS: Scenario[] = [
  {
    id: "sc_ctrl_stall_intersection",
    categoryId: "controls",
    title: "Stalled at the lights",
    situation:
      "You stall pulling away from a green light. Cars behind you begin hooting, and the light will not stay green much longer.",
    prompt: "What do you do?",
    choices: [
      {
        id: "a",
        text: "Restart in gear and pull away quickly to clear the intersection",
        correct: false,
        consequence:
          "Turning the key in gear lurches the car forward — into whatever is in front of you. Hurrying under pressure is exactly how a stall becomes a collision.",
      },
      {
        id: "b",
        text: "Handbrake on, gear to neutral, restart, then move off with the full procedure",
        correct: true,
        consequence:
          "Correct. It takes a few seconds and it is the same procedure every time, which is why it works under pressure. The hooting is not an emergency; the intersection is.",
      },
      {
        id: "c",
        text: "Wave the traffic behind you past while you sort the car out",
        correct: false,
        consequence:
          "Directing other traffic is not yours to do, and inviting cars past a stalled vehicle in an intersection creates a second hazard on top of the first.",
      },
    ],
    debrief:
      "The stall recovery is fixed: handbrake, neutral, restart, then the normal moving-off sequence including observation. Being hooted at is uncomfortable, not dangerous — restarting in gear is dangerous.",
  },
  {
    id: "sc_ctrl_oil_light_remote",
    categoryId: "controls",
    title: "Red light, long way from town",
    situation:
      "The oil-pressure warning light comes on and stays on. You are an hour from the nearest town on a quiet road, and the engine still sounds normal.",
    prompt: "What is the right call?",
    choices: [
      {
        id: "a",
        text: "Keep going to the next town — the engine sounds fine and stopping here leaves you stranded",
        correct: false,
        consequence:
          "By the time an oil-pressure problem is audible, the damage is usually done. Driving on trades a tow for a destroyed engine.",
      },
      {
        id: "b",
        text: "Stop as soon as it is safe, switch off, and check the oil before deciding anything else",
        correct: true,
        consequence:
          "Correct. Oil pressure is the one warning that justifies stopping immediately — the engine can seize within minutes. Being stranded is the cheaper outcome by a wide margin.",
      },
      {
        id: "c",
        text: "Carry on but drive slowly and gently to reduce the load on the engine",
        correct: false,
        consequence:
          "Low oil pressure starves the bearings whether you drive gently or not. Reducing speed delays the failure; it does not prevent it.",
      },
    ],
    debrief:
      "Oil pressure and engine temperature are the two warnings that mean stop now rather than get it looked at. Both can destroy an engine in minutes, and neither gives much audible warning first.",
  },
  {
    id: "sc_ctrl_hill_start_close",
    categoryId: "controls",
    title: "Hill start with company",
    situation:
      "You are stopped on a steep uphill at a robot. The car behind has pulled up very close to your rear bumper, and the light is about to change.",
    prompt: "How do you move off?",
    choices: [
      {
        id: "a",
        text: "Hold on the handbrake, find the biting point, then release as the car takes up the load",
        correct: true,
        consequence:
          "Correct. The handbrake holds the car while the clutch takes the weight, so there is no roll-back at all. This is exactly the situation the technique exists for.",
      },
      {
        id: "b",
        text: "Move your foot quickly from brake to accelerator and pull away before it rolls",
        correct: false,
        consequence:
          "There is always a gap between the pedals, and on a steep hill the car rolls during it. With a bumper that close, a few centimetres is all it takes.",
      },
      {
        id: "c",
        text: "Rev high and drop the clutch quickly so the car cannot roll back",
        correct: false,
        consequence:
          "That lurches forward, wears the clutch and can stall it outright — leaving you rolling back anyway, but now with no engine.",
      },
    ],
    debrief:
      "The handbrake hill start exists so the vehicle is never unheld. Rolling back on an incline is an immediate failure in the yard test, and on a real hill it is the car behind that pays for it.",
  },
  {
    id: "sc_ctrl_steering_heavy",
    categoryId: "controls",
    title: "The wheel goes heavy",
    situation:
      "Mid-corner on a suburban road, the steering suddenly becomes very heavy. The engine is still running normally and the car is still going where you point it, but it takes real effort.",
    prompt: "What do you do?",
    choices: [
      {
        id: "a",
        text: "Grip firmly with both hands, slow down gradually, and stop somewhere safe to investigate",
        correct: true,
        consequence:
          "Correct. The car still steers — it just needs muscle. Two hands and less speed keep you in control while you get off the road.",
      },
      {
        id: "b",
        text: "Brake hard immediately to stop before you lose steering altogether",
        correct: false,
        consequence:
          "Hard braking mid-corner while the steering is already compromised is how you end up off the road. The steering has not failed; it has just lost its assistance.",
      },
      {
        id: "c",
        text: "Let go briefly to see whether the wheel self-centres",
        correct: false,
        consequence:
          "Letting go of the wheel in a corner surrenders the one thing still working. Whatever the diagnosis, it is not worth finding out that way.",
      },
    ],
    debrief:
      "Heavy steering with the engine running points at a power-steering failure. The steering still functions without assistance — hold on with both hands, shed speed gradually, and stop where it is safe.",
  },
  {
    id: "sc_ctrl_mirror_knocked",
    categoryId: "controls",
    title: "Mirror out of position",
    situation:
      "Pulling out of a tight parking area you clip the door mirror against a pillar. It is still attached, but now points at the sky. You are about to join a busy road.",
    prompt: "What do you do?",
    choices: [
      {
        id: "a",
        text: "Adjust it as you drive — it only takes a second and you need to keep moving",
        correct: false,
        consequence:
          "Adjusting a mirror while joining busy traffic takes a hand off the wheel and your attention off the road at the moment you most need both.",
      },
      {
        id: "b",
        text: "Stop somewhere safe before joining the road and reset it properly",
        correct: true,
        consequence:
          "Correct. A mirror is part of the cockpit setup, and setting up is done stationary. Thirty seconds now buys you the view for the rest of the journey.",
      },
      {
        id: "c",
        text: "Carry on and rely on shoulder checks instead until you reach your destination",
        correct: false,
        consequence:
          "Shoulder checks supplement mirrors; they do not replace them. Driving a busy road with one blind side means every lane change is a guess.",
      },
    ],
    debrief:
      "Seat, head restraint and mirrors are set before the vehicle moves — and reset stationary if anything disturbs them. Nothing about the cockpit drill is a task for while you are driving.",
  },
  {
    id: "sc_ctrl_auto_long_red",
    categoryId: "controls",
    title: "Long red in an automatic",
    situation:
      "You are first at a red light in an automatic, and it is a long phase. You are holding the car on the footbrake in Drive.",
    prompt: "What is the sensible thing to do?",
    choices: [
      {
        id: "a",
        text: "Keep the footbrake applied, or apply the handbrake if the wait is long — the car creeps in Drive",
        correct: true,
        consequence:
          "Correct. In Drive the car wants to move the moment your foot lifts. Keeping the brake on — or adding the handbrake for a long wait — is what stops it nudging into the car ahead.",
      },
      {
        id: "b",
        text: "Select Park so you can rest your foot completely",
        correct: false,
        consequence:
          "Park at every stop is hard on the transmission and slow to get moving from. It is for parking, not for a red light.",
      },
      {
        id: "c",
        text: "Shift into Neutral and coast forward when the light changes",
        correct: false,
        consequence:
          "Neutral is unnecessary here and coasting into an intersection means you have no drive available if you need to move quickly.",
      },
    ],
    debrief:
      "An automatic in Drive creeps at idle, so something must always be holding it at a stop. The footbrake is enough for a short wait; add the handbrake for a long one, and keep Park for actually parking.",
  },
];
