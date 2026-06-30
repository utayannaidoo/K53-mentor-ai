import type { DriverModule } from "@/types";

/**
 * Yard-test (K53) modules for motorcycle (A1/A) and heavy (10/14) learners.
 * Original wording derived from official SA practical-test material. Procedural
 * figures (distances, speed bands) should be confirmed against the current
 * printed K53 manual before being treated as exam-certain.
 */
export const MOTORCYCLE_MODULES: DriverModule[] = [
  {
    id: "moto_inspection",
    name: "Pre-ride inspection",
    summary: "The checks to point out before the motorcycle test begins.",
    difficulty: 1,
    estMinutes: 6,
    group: "motorcycle",
    steps: [
      { n: 1, title: "Tyres & wheels", instruction: "Check both tyres for tread, pressure, cuts and bulges, and that the wheels and spokes look sound.", tip: "Two small contact patches carry everything — tyre condition matters even more than on a car." },
      { n: 2, title: "Brakes", instruction: "Squeeze the front lever and press the rear pedal to confirm both brakes feel firm and the bike is held.", tip: "Spongy or loose brakes are an immediate concern — both must work independently." },
      { n: 3, title: "Chain & controls", instruction: "Check chain tension/lubrication, and that the throttle snaps back, the clutch and levers move freely, and the steering is not stiff.", tip: "A sticky throttle that doesn't return to idle is dangerous." },
      { n: 4, title: "Lights & signals", instruction: "Confirm the headlight (dipped/main), brake light, indicators and hooter all work.", tip: "Use a wall or window reflection to verify the rear light and brake light." },
      { n: 5, title: "Gear & fluids", instruction: "Check oil/fuel levels and that the mirrors are set; confirm the engine cut-off switch is in the run position.", tip: "Riders often forget the kill switch is off after a previous demo." },
    ],
    commonFaults: [
      "Missing a defect you were meant to point out",
      "Not checking both brakes independently",
      "Overlooking the throttle returning to idle on its own",
    ],
  },
  {
    id: "moto_moving_off",
    name: "Moving off & balance",
    summary: "Pull away smoothly and under full control, with the correct observation.",
    difficulty: 1,
    estMinutes: 6,
    group: "motorcycle",
    steps: [
      { n: 1, title: "Prepare", instruction: "With the engine running, pull in the clutch, select first gear and keep both feet ready.", tip: "Cover the rear brake so you can steady the bike at walking pace." },
      { n: 2, title: "Observe", instruction: "Check mirrors and take a 'lifesaver' glance over your shoulder to cover the blind spot before moving.", tip: "On a motorcycle the shoulder glance is essential — mirrors alone leave a big blind spot." },
      { n: 3, title: "Feed the clutch", instruction: "Ease the clutch out to the friction point while gently opening the throttle to move off without stalling.", tip: "Find the bite gradually — snapping the clutch will jerk or stall the bike." },
      { n: 4, title: "Balance & feet up", instruction: "As the bike gathers pace, bring both feet onto the pegs and keep your eyes up and well ahead.", tip: "Looking far ahead steadies your balance; looking down makes you wobble." },
      { n: 5, title: "Settle", instruction: "Take up your road position toward the left, hold a steady speed and keep scanning.", tip: "Smooth, controlled balance at low speed is exactly what examiners reward." },
    ],
    commonFaults: [
      "Moving off without the shoulder (lifesaver) glance",
      "Stalling by releasing the clutch too quickly",
      "Looking down at the controls instead of ahead",
    ],
  },
  {
    id: "moto_slow_ride",
    name: "Slow ride & figure-of-eight",
    summary: "Hold a steady speed band through a slow, curved course without touching the lines or putting a foot down.",
    difficulty: 3,
    estMinutes: 12,
    group: "motorcycle",
    steps: [
      { n: 1, title: "Set the controls", instruction: "Ride at low speed using clutch slip, a steady throttle and a trailing rear brake to keep the bike stable.", tip: "The clutch–throttle–rear-brake balance is what keeps a bike upright at crawling speed." },
      { n: 2, title: "Look through the curve", instruction: "Turn your head and look to where you want to go — to the exit of the curve — not at the front wheel.", tip: "The bike follows your eyes; fixing on the line you fear makes you ride onto it." },
      { n: 3, title: "Stay in the speed band", instruction: "Keep within the marked minimum and maximum speed — neither so slow you wobble nor so fast you run wide.", tip: "Too slow loses balance; too fast touches the outer line. Both are penalised." },
      { n: 4, title: "Figure-of-eight", instruction: "Flow smoothly from one circle into the other, shifting your balance and gaze as the direction changes.", tip: "Keep the bike moving — pausing or dabbing a foot down costs marks." },
      { n: 5, title: "Finish controlled", instruction: "Complete the course inside the boundaries and bring the bike to a steady, balanced stop where directed.", tip: "Never put a foot down mid-course unless you're about to fall." },
    ],
    commonFaults: [
      "Touching or crossing a boundary line",
      "Putting a foot down to balance",
      "Riding faster than the speed band to stay upright",
    ],
  },
  {
    id: "moto_incline_start",
    name: "Incline start (no roll-back)",
    summary: "Stop on a slope and move off without the motorcycle rolling backward.",
    difficulty: 3,
    estMinutes: 8,
    group: "motorcycle",
    steps: [
      { n: 1, title: "Hold on the slope", instruction: "Stop on the incline holding the bike stationary with the rear brake (pedal), clutch in and first gear selected.", tip: "The rear brake holds the bike while your hands manage clutch and throttle." },
      { n: 2, title: "Build drive", instruction: "Open the throttle a little more than on the flat and bring the clutch to the friction point.", tip: "You need extra drive to overcome the slope — find the bite before releasing the brake." },
      { n: 3, title: "Release the brake", instruction: "Once you feel drive taking up, smoothly release the rear brake so the bike moves forward, not back.", tip: "If the bike dips back, you released too early — re-apply the rear brake and rebalance." },
      { n: 4, title: "Move off", instruction: "Ease the clutch fully out as you feed in throttle, bring your feet up and ride away under control.", tip: "Any backward roll is penalised, so err toward a touch more drive." },
    ],
    commonFaults: [
      "Rolling backward as you release the brake",
      "Stalling by letting the clutch out too fast",
      "Using only the front brake to hold on the slope",
    ],
  },
  {
    id: "moto_emergency_stop",
    name: "Emergency stop",
    summary: "Stop as quickly and safely as possible, in a straight line, using both brakes.",
    difficulty: 3,
    estMinutes: 6,
    group: "motorcycle",
    steps: [
      { n: 1, title: "Approach", instruction: "Ride in at the set speed, upright and straight, with the bike balanced and your eyes up.", tip: "The stop must be straight-line — don't be leaning or turning when you brake." },
      { n: 2, title: "Both brakes together", instruction: "On the signal, apply the front brake firmly and progressively while also using the rear, squeezing — not grabbing.", tip: "The front brake does most of the work, but grabbing it can lock the front and drop the bike." },
      { n: 3, title: "Pull the clutch", instruction: "As you slow, pull in the clutch to prevent stalling and keep the bike stable to a complete stop.", tip: "Keep the wheels rolling — a locked wheel lengthens the stop and risks a slide." },
      { n: 4, title: "Stabilise", instruction: "Come to a full stop within the marked distance, put a foot (or feet) down and hold the bike steady.", tip: "A skid, a wobble or stopping past the line all cost you here." },
    ],
    commonFaults: [
      "Grabbing the front brake and locking the front wheel",
      "Using only one brake",
      "Skidding or stopping outside the marked distance",
    ],
  },
  {
    id: "moto_swerve",
    name: "Emergency swerve",
    summary: "Steer around a sudden obstacle at speed, then bring the bike to a controlled stop.",
    difficulty: 3,
    estMinutes: 7,
    group: "motorcycle",
    steps: [
      { n: 1, title: "Approach steady", instruction: "Ride in at the set approach speed, upright, relaxed and looking well ahead — not at the obstacle.", tip: "Tension on the bars makes the bike harder to steer; stay loose." },
      { n: 2, title: "Counter-steer around", instruction: "Press the handlebar on the side you want to go to, swerving smoothly around the obstacle.", tip: "Look at the gap you're aiming for, not the thing you're avoiding (target fixation)." },
      { n: 3, title: "Don't brake in the swerve", instruction: "Steer first; avoid braking while the bike is leaned over in the swerve, which can wash out the tyres.", tip: "Braking and hard steering at the same time overloads the available grip." },
      { n: 4, title: "Straighten & stop", instruction: "Once clear and upright again, apply both brakes progressively and bring the bike to a controlled stop.", tip: "Separate the actions: swerve, get upright, then brake." },
    ],
    commonFaults: [
      "Braking mid-swerve and losing grip",
      "Fixating on the obstacle instead of the escape path",
      "Stiffening up and steering too late",
    ],
  },
];

export const HEAVY_MODULES: DriverModule[] = [
  {
    id: "hv_inspection",
    name: "Pre-trip inspection",
    summary: "The heavy-vehicle walk-around and cab checks before driving.",
    difficulty: 2,
    estMinutes: 9,
    group: "heavy",
    steps: [
      { n: 1, title: "Walk-around", instruction: "Check tyres (including inners on twin axles), wheel nuts, bodywork, lights and that nothing is leaking underneath.", tip: "On multi-axle vehicles, don't forget the inner tyres you can't see at a glance." },
      { n: 2, title: "Drain the air tanks", instruction: "Drain any water/moisture from the air tanks and check there are no obvious air leaks.", tip: "Water left in the tanks can corrode the system or freeze valves in the cold." },
      { n: 3, title: "Build & test air pressure", instruction: "Start the engine and let air pressure build into the safe operating range before doing anything else.", tip: "The vehicle must not be moved until the gauges read in range and the low-pressure warning clears." },
      { n: 4, title: "Brake & light checks", instruction: "Test the service brake and parking (spring) brake, and confirm all lights, indicators and the hooter work.", tip: "The spring brake should hold the vehicle firmly on its own." },
      { n: 5, title: "Cab & coupling", instruction: "Confirm the tilt-cab is locked, mirrors are set, and (if articulated) the coupling and trailer connections are secure.", tip: "An unlocked tilt-cab or coupling is a serious defect to catch here." },
    ],
    commonFaults: [
      "Moving off before air pressure is in range",
      "Skipping the air-tank water drain",
      "Missing inner tyres or a loose wheel nut",
    ],
  },
  {
    id: "hv_air_brake_check",
    name: "Air-brake system check",
    summary: "Confirm the air-brake system builds, holds and warns correctly before driving.",
    difficulty: 3,
    estMinutes: 8,
    group: "heavy",
    steps: [
      { n: 1, title: "Build pressure", instruction: "With the engine running, let the compressor build air pressure up into the manufacturer's safe range.", tip: "Note roughly how long it takes — very slow build-up can indicate a fault." },
      { n: 2, title: "Low-pressure warning", instruction: "With the engine off, tap the brake pedal repeatedly to bleed pressure and confirm the low-pressure warning light/buzzer activates.", tip: "The warning must come on well before the spring brakes apply." },
      { n: 3, title: "Spring-brake apply", instruction: "Continue bleeding pressure and confirm the spring (parking) brakes apply automatically as pressure drops.", tip: "This fail-safe is exactly why a heavy vehicle must never be driven on low air." },
      { n: 4, title: "Re-build & release", instruction: "Restart, build pressure back into range and confirm the parking brake releases normally.", tip: "If it won't release, you do not have enough air — wait and recheck." },
    ],
    commonFaults: [
      "Not knowing where the safe pressure range is",
      "Driving off while the warning is still active",
      "Failing to confirm the spring-brake fail-safe",
    ],
  },
  {
    id: "hv_coupling",
    name: "Coupling a trailer",
    summary: "Connect a semi-trailer to the truck-tractor and confirm it's safe before moving.",
    difficulty: 3,
    estMinutes: 12,
    group: "heavy",
    steps: [
      { n: 1, title: "Line up & reverse", instruction: "Line the fifth wheel up squarely under the trailer kingpin and reverse slowly until the jaws engage with a clear lock.", tip: "Approach straight and slow — a crooked approach can damage the coupling or miss the lock." },
      { n: 2, title: "Visual lock check", instruction: "Get out and confirm the locking jaws have closed fully around the kingpin and the safety lock-pin is engaged.", tip: "A 'clunk' is not proof — you must see the jaws closed and the lock-pin in." },
      { n: 3, title: "Connect lines", instruction: "Connect the air lines (red emergency/supply and yellow service) and the electrical plug, checking for leaks and that all lights work.", tip: "Red = emergency/supply, yellow = service — a swapped or leaking line is dangerous." },
      { n: 4, title: "Raise the landing gear", instruction: "Wind the landing gear (support legs) fully up and stow the handle.", tip: "Legs left down can drag, catch the road, or be torn off." },
      { n: 5, title: "Tug test", instruction: "With the trailer brakes applied, gently drive the tractor forward against them to confirm the coupling holds.", tip: "If the tractor pulls away from the trailer, it is NOT locked — stop and re-couple." },
    ],
    commonFaults: [
      "Relying on the sound of the lock instead of a visual check",
      "Forgetting the tug test",
      "Leaving the landing gear partly down",
    ],
  },
  {
    id: "hv_uncoupling",
    name: "Uncoupling a trailer",
    summary: "Separate the trailer from the tractor safely, leaving it stable and secure.",
    difficulty: 2,
    estMinutes: 9,
    group: "heavy",
    steps: [
      { n: 1, title: "Park & secure", instruction: "Stop on firm, level ground, apply the trailer parking brake and chock the trailer wheels if needed.", tip: "Soft or sloping ground can let the trailer sink or roll once the tractor is gone." },
      { n: 2, title: "Lower the landing gear", instruction: "Wind the landing gear down until it just takes the trailer's weight off the fifth wheel.", tip: "Don't over-raise the trailer — it should sit level, taking its own weight." },
      { n: 3, title: "Disconnect lines", instruction: "Disconnect and stow the electrical plug and the air lines, capping or hanging them clear of the road.", tip: "Stow lines so they can't be crushed or dragged when you pull away." },
      { n: 4, title: "Release the coupling", instruction: "Pull the fifth-wheel release handle to free the locking jaws from the kingpin.", tip: "Make sure nothing (and no one) is between the units before you release." },
      { n: 5, title: "Pull away gently", instruction: "Ease the tractor forward slowly and smoothly out from under the trailer, watching your mirrors.", tip: "A sudden pull can damage the trailer or topple it if the landing gear isn't set." },
    ],
    commonFaults: [
      "Uncoupling on soft or sloping ground",
      "Pulling away with a line still connected",
      "Setting the landing gear too high or too low",
    ],
  },
  {
    id: "hv_incline_start",
    name: "Incline start (heavy vehicle)",
    summary: "Move a heavy vehicle off uphill without rolling back, using the parking brake.",
    difficulty: 3,
    estMinutes: 8,
    group: "heavy",
    steps: [
      { n: 1, title: "Held on the slope", instruction: "Stop on the incline with the parking (spring) brake applied and an appropriate low gear selected.", tip: "The spring brake — not the foot brake — is what holds a heavy vehicle on a slope." },
      { n: 2, title: "Build drive", instruction: "Raise the engine revs and bring the clutch to the biting point so you can feel the drive loading up.", tip: "A loaded heavy vehicle needs noticeably more drive than a car to hold against gravity." },
      { n: 3, title: "Release the parking brake", instruction: "Once drive is taking effect, release the parking brake smoothly so the vehicle moves forward, not back.", tip: "Releasing before the drive is loaded will let a heavy load roll back quickly." },
      { n: 4, title: "Move off", instruction: "Feed in throttle and ease the clutch fully out, pulling away under control and observing as you go.", tip: "Be patient and progressive — heavy vehicles reward smoothness, not speed." },
    ],
    commonFaults: [
      "Releasing the parking brake before the drive is loaded",
      "Rolling back into the space behind you",
      "Choosing too high a gear and stalling",
    ],
  },
];

export const VEHICLE_DRIVER_MODULES: DriverModule[] = [...MOTORCYCLE_MODULES, ...HEAVY_MODULES];
