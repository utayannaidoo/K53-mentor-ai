import type { Scenario } from "@/types";

/**
 * Following-distance scenarios. Facts trace to
 * docs/content/facts/hazard-parking-following.md.
 *
 * The category had three scenarios, one of them code-gated, against 44
 * questions — so the rule was tested constantly in quiz form and almost never
 * as a judgement call. That gap matters here more than elsewhere: knowing "two
 * seconds, four in the wet" is easy, and holding the gap when a queue is
 * building behind you or someone keeps filling it is the part learners
 * actually fail at.
 *
 * All universal (no `codes`). Deliberately avoids re-treading the two existing
 * universal scenarios (heavy rain on the freeway, and the long mountain pass),
 * and stays off specific distances in metres — the second-based rule and its
 * numbers are already covered in the question packs.
 */
export const FOLLOWING_SCENARIOS: Scenario[] = [
  {
    id: "sc_fd_tailgated_queue",
    categoryId: "following_distance",
    title: "Pressured from behind",
    situation:
      "You are at the limit on a single-lane road. A driver has closed right up behind you, sitting a car length off your bumper, and a short queue has formed behind them.",
    prompt: "What do you do?",
    choices: [
      {
        id: "a",
        text: "Speed up to open a gap and take the pressure off",
        correct: false,
        consequence:
          "You would be driving at someone else's chosen speed, above your own judgement and possibly above the limit — and a tailgater usually just closes up again at the new speed.",
      },
      {
        id: "b",
        text: "Increase your own following distance to the car ahead, and pull over to let them past when it is safe",
        correct: true,
        consequence:
          "Correct. You cannot control the gap behind you, only the one in front. Lengthening it means that if you must brake, you can do it gently rather than sharply — and letting them past removes the problem entirely.",
      },
      {
        id: "c",
        text: "Tap your brakes to warn them to drop back",
        correct: false,
        consequence:
          "Brake-checking a tailgater invites the collision you are trying to avoid, and puts you at fault. It escalates a situation you can defuse by simply letting them go.",
      },
    ],
    debrief:
      "Being tailgated is the one case where your gap to the vehicle ahead should grow rather than shrink: it is the buffer that lets you brake gradually instead of suddenly. Never brake-check, and let the driver past at the first safe opportunity.",
  },
  {
    id: "sc_fd_gap_filled",
    categoryId: "following_distance",
    title: "The gap that keeps disappearing",
    situation:
      "Freeway, heavy but moving traffic. Three times now you have opened a safe gap and three times a car has moved into it, leaving you close behind again.",
    prompt: "How do you handle it?",
    choices: [
      {
        id: "a",
        text: "Stop bothering — traffic this dense makes a proper gap impossible",
        correct: false,
        consequence:
          "This is how drivers end up with no space at all in the exact conditions where a chain-reaction collision is most likely. Dense traffic is the reason for the gap, not a reason to give it up.",
      },
      {
        id: "b",
        text: "Ease off gently and rebuild the gap each time, accepting that it costs you a little time",
        correct: true,
        consequence:
          "Correct. Rebuilding it costs seconds over a whole journey. Refusing to, so nobody 'takes' your space, means driving the entire trip with no room to stop.",
      },
      {
        id: "c",
        text: "Close right up so there is no gap for anyone to move into",
        correct: false,
        consequence:
          "Now you have deliberately removed your own stopping room to stop other drivers doing something that costs you almost nothing. It is the worst possible trade.",
      },
    ],
    debrief:
      "A gap being filled is not a gap wasted — it is doing its job of absorbing traffic. Rebuild it every time. The few seconds you lose are the price of having anywhere to go when the car in front stops hard.",
  },
  {
    id: "sc_fd_cant_see_past_truck",
    categoryId: "following_distance",
    title: "A wall of truck",
    situation:
      "You have been following a large truck on a rural road for several kilometres. Its trailer fills your windscreen and you cannot see any of the road beyond it.",
    prompt: "What is the best response?",
    choices: [
      {
        id: "a",
        text: "Move closer so you can see down the side of the trailer",
        correct: false,
        consequence:
          "Closer gives you a narrower view, not a wider one, and puts you inside the truck's blind spot — where the driver cannot see you at all.",
      },
      {
        id: "b",
        text: "Drop well back, which widens what you can see past it and gives the truck driver sight of you",
        correct: true,
        consequence:
          "Correct. View past a large vehicle improves with distance, not proximity. Falling back also puts you where the truck's mirrors can find you, and buys room for whatever the truck is hiding.",
      },
      {
        id: "c",
        text: "Hold your position and rely on the truck's brake lights to warn you",
        correct: false,
        consequence:
          "Brake lights tell you the truck is stopping, not why. Following blind means you learn about the hazard at the same moment you have to react to it.",
      },
    ],
    debrief:
      "Behind anything large, distance buys vision. Sitting close leaves you with no view, no reaction time, and no presence in the other driver's mirrors — three problems that one extra gap solves at once.",
  },
  {
    id: "sc_fd_night_unlit",
    categoryId: "following_distance",
    title: "Beyond the headlights",
    situation:
      "An unlit rural road at night. Your dipped headlights show maybe fifty metres of road, and you are travelling at the open-road limit with nothing ahead of you.",
    prompt: "What should you do about your speed?",
    choices: [
      {
        id: "a",
        text: "Maintain the limit — it is the legal speed for this road",
        correct: false,
        consequence:
          "The limit assumes conditions that let you see far enough to stop. At night on dipped beams you can be travelling faster than your lit distance allows, which means anything stationary appears too late.",
      },
      {
        id: "b",
        text: "Slow to a speed at which you could stop within the distance your lights actually show",
        correct: true,
        consequence:
          "Correct. The rule at night is to drive within your lit distance. A broken-down vehicle, an animal or a pedestrian in dark clothing does not become visible until it is inside that range.",
      },
      {
        id: "c",
        text: "Keep the limit but switch to main beam permanently so you can see further",
        correct: false,
        consequence:
          "Main beam helps, but you still have to dip for oncoming traffic — and the moment you do, you are back to out-driving your lights at full speed.",
      },
    ],
    debrief:
      "A speed limit is a maximum for ideal conditions. At night the binding constraint is how far your lights reach: you must be able to stop inside the distance you can actually see, which is usually well under the posted limit on an unlit road.",
  },
  {
    id: "sc_fd_queue_over_crest",
    categoryId: "following_distance",
    title: "Brake lights over the rise",
    situation:
      "Cresting a rise on the freeway at speed, you find stationary traffic backed up just beyond it. You brake in good time and come to a stop behind the last car.",
    prompt: "Once stopped, what matters most?",
    choices: [
      {
        id: "a",
        text: "Close right up to the car ahead so the queue takes less space",
        correct: false,
        consequence:
          "Closing up removes your escape route. If a vehicle comes over the crest without slowing, you have nowhere to move and get pushed into the car in front.",
      },
      {
        id: "b",
        text: "Stop a little short of the car ahead, watch your mirrors, and be ready to move if traffic behind is not slowing",
        correct: true,
        consequence:
          "Correct. The danger at the back of a queue comes from behind. A gap ahead and eyes on the mirror give you somewhere to go and the warning to use it.",
      },
      {
        id: "c",
        text: "Switch the engine off and wait — nothing more you can do",
        correct: false,
        consequence:
          "Being stopped is not being safe here. With an engine off you cannot move out of the way, and you have stopped watching the direction the risk is coming from.",
      },
    ],
    debrief:
      "The last vehicle in a queue after a blind crest is the most exposed on the road. Leave room ahead, watch the mirror, and switch your hazard lights on to warn traffic still approaching the rise.",
  },
  {
    id: "sc_fd_gravel_dust",
    categoryId: "following_distance",
    title: "Dust on the gravel road",
    situation:
      "On a dry gravel road, the bakkie ahead is throwing up a thick dust trail and the occasional stone. You can only see its tail lights.",
    prompt: "What is the sensible approach?",
    choices: [
      {
        id: "a",
        text: "Drop well back until the dust settles enough to see the road, even if that means going much slower",
        correct: true,
        consequence:
          "Correct. Dust hides the surface, the corners and anything oncoming, and stones thrown from the wheels ahead reach you at closing speed. Distance solves all three.",
      },
      {
        id: "b",
        text: "Move slightly to one side to see past the dust while keeping pace",
        correct: false,
        consequence:
          "Edging out on gravel puts you toward the loose material at the road's edge, where grip is worst, and into the path of anything coming the other way that you still cannot see.",
      },
      {
        id: "c",
        text: "Overtake through the dust to get out of it",
        correct: false,
        consequence:
          "Overtaking into a dust cloud means committing to the oncoming lane with no view of it at all. This is one of the most common causes of serious head-on crashes on rural roads.",
      },
    ],
    debrief:
      "On gravel, following distance covers three hazards at once: reduced grip, flying stones, and a dust cloud that hides everything ahead. Never overtake into dust — wait for a stretch where you can see the road you are moving into.",
  },
  {
    id: "sc_fd_towing_trailer",
    categoryId: "following_distance",
    title: "First trip with the trailer",
    situation:
      "You are towing a loaded trailer for the first time, on the open road, keeping the same gap you would normally leave in the car alone.",
    prompt: "Is that gap still appropriate?",
    choices: [
      {
        id: "a",
        text: "Yes — the trailer has its own brakes, so stopping distance is unchanged",
        correct: false,
        consequence:
          "Even a braked trailer adds mass and pushes from behind under braking. Assuming nothing has changed is how drivers discover the difference at the worst moment.",
      },
      {
        id: "b",
        text: "No — the extra mass lengthens your stopping distance, so the gap needs to grow",
        correct: true,
        consequence:
          "Correct. More mass means more energy to shed, so the same brakes need more road. A trailer also makes hard braking less stable, which is another reason to brake earlier and more gently.",
      },
      {
        id: "c",
        text: "No — but only on downhills, where the trailer pushes hardest",
        correct: false,
        consequence:
          "Downhill is worse, but the extra stopping distance applies everywhere. Treating it as a hills-only problem leaves you short on the flat.",
      },
    ],
    debrief:
      "Anything that adds mass — a trailer, a full load of passengers, a loaded roof rack — lengthens your stopping distance and makes hard braking less stable. Increase the gap and brake earlier and more gradually than you would unladen.",
  },
];
