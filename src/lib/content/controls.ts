/**
 * "Know your car" reference content for the Car-controls study section.
 * The labelled diagram (manual p5) covers the primary driving controls; the
 * groups below add the everyday controls the manual doesn't (hazards, demister,
 * climate, warning lights…), plus a pre-drive checklist and a manual-vs-auto note.
 */

export interface CarControl {
  name: string;
  /** What it is / where to find it. */
  what: string;
  /** What it does / how to use it. */
  use: string;
  /** Part of the K53 "controls of the vehicle" test. */
  inTest?: boolean;
  /** lucide-react icon name representing the control's function. */
  icon?: string;
}

export interface ControlGroup {
  id: string;
  title: string;
  blurb: string;
  icon: string; // lucide-react icon name
  controls: CarControl[];
}

export const CONTROL_GROUPS: ControlGroup[] = [
  {
    id: "lights",
    title: "Lights & signals",
    blurb: "How you tell other road users what you're doing — and see and be seen.",
    icon: "Lightbulb",
    controls: [
      {
        name: "Indicators (turn signals)",
        icon: "ArrowLeftRight",
        what: "A stalk behind the steering wheel; flick up or down.",
        use: "Tell others you intend to turn or change lane. Signal in good time, and check the indicator cancels itself afterwards.",
        inTest: true,
      },
      {
        name: "Headlights — dipped & main beam",
        icon: "Sun",
        what: "Switched on a stalk or a dial near the wheel.",
        use: "Use dipped beams for normal night driving. Switch to main (bright) beam on dark open roads, but dip them for oncoming traffic and when following another vehicle so you don't dazzle the driver.",
        inTest: true,
      },
      {
        name: "Hooter (horn)",
        icon: "Volume2",
        what: "Usually the centre pad of the steering wheel.",
        use: "A short warning to make others aware of you. It's a safety tool, not a way to vent frustration.",
        inTest: true,
      },
      {
        name: "Hazard lights",
        icon: "TriangleAlert",
        what: "A button with a red triangle, usually in the centre of the dash.",
        use: "Flashes all four indicators together. Use it when you're broken down, stopped somewhere risky, or warning traffic behind of a sudden hazard ahead.",
      },
      {
        name: "Fog lights",
        icon: "CloudFog",
        what: "Extra-bright front and/or rear lights, switched near the headlight control.",
        use: "Only for thick fog, mist, dust or heavy rain when you genuinely can't see far. Switch them off once visibility returns — they dazzle others.",
      },
      {
        name: "Windscreen wipers & washers",
        icon: "Droplets",
        what: "A stalk (often the right one); pull or twist it for the washers.",
        use: "Clear rain and dirt from the windscreen. The washers squirt fluid to help shift grime — keep the bottle topped up.",
        inTest: true,
      },
    ],
  },
  {
    id: "visibility",
    title: "Visibility & comfort",
    blurb: "Set these up before you drive so you can see clearly and reach everything comfortably.",
    icon: "Eye",
    controls: [
      {
        name: "Rear-view mirror",
        icon: "RectangleHorizontal",
        what: "The interior mirror in the middle of the windscreen.",
        use: "Shows the road directly behind you. Glance at it regularly and before slowing, turning or changing lane.",
        inTest: true,
      },
      {
        name: "Side (exterior) mirrors",
        icon: "Columns2",
        what: "The mirrors on each front door.",
        use: "Show the lanes beside and behind you. Adjust them so you can just see the side of your own car — but they still leave a blind spot, so do a shoulder check too.",
        inTest: true,
      },
      {
        name: "Seat & head-restraint adjustment",
        icon: "Armchair",
        what: "Levers or buttons on the side/front of the seat.",
        use: "Set the seat so you can fully press the pedals and reach the wheel comfortably, with the head restraint behind your head (not your neck) for whiplash protection.",
        inTest: true,
      },
      {
        name: "Demister / defogger",
        icon: "Wind",
        what: "Buttons showing a curved screen with arrows (front) and a rectangle with lines (rear).",
        use: "Clears a misted-up windscreen or rear window. The front uses warm air (and air-con), the rear uses a heating element in the glass.",
      },
      {
        name: "Climate control (heater & air-con)",
        icon: "Snowflake",
        what: "Dials or a screen for temperature, fan speed and airflow.",
        use: "Keeps the cabin comfortable. Air-con also dries the air, so it's the fastest way to clear a fogged-up windscreen.",
      },
      {
        name: "Sun visor",
        icon: "SunDim",
        what: "The padded flap above the windscreen.",
        use: "Flip it down to block low, blinding sun. Combine it with reducing speed and increasing your following distance in glare.",
      },
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard & warning lights",
    blurb: "The instruments tell you how fast you're going and warn you when something needs attention.",
    icon: "CircleGauge",
    controls: [
      {
        name: "Speedometer",
        icon: "Gauge",
        what: "The main dial (or digital number) in front of you.",
        use: "Shows your current speed — check it often and keep within the limit for the road.",
        inTest: true,
      },
      {
        name: "Temperature gauge",
        icon: "Thermometer",
        what: "A dial (or blue/red light) showing engine coolant temperature.",
        use: "Normally sits in the middle. If it climbs into the red the engine is overheating — stop as soon as it's safe and switch off to let it cool. Never open a hot radiator cap.",
        inTest: true,
      },
      {
        name: "Fuel gauge & low-fuel light",
        icon: "Fuel",
        what: "A gauge from E (empty) to F (full), with a warning light.",
        use: "Shows how much fuel is left. Refuel when the light comes on — running dry can strand you somewhere dangerous.",
      },
      {
        name: "Oil, battery & engine lights",
        icon: "CircleAlert",
        what: "Small symbols that glow if something is wrong.",
        use: "A red light (oil can, battery, temperature) means stop and check soon. An amber engine light means get it looked at — but it's usually safe to drive on gently.",
      },
      {
        name: "ABS warning light",
        icon: "Disc",
        what: "The letters 'ABS' in a circle.",
        use: "If it stays on while driving, the anti-lock braking system may be faulty. Normal braking usually still works, but have it checked promptly.",
        inTest: true,
      },
      {
        name: "Seatbelt reminder",
        icon: "ShieldCheck",
        what: "A person-with-belt symbol, often with a chime.",
        use: "Reminds you (and passengers) to buckle up. As the driver you're responsible for everyone being restrained.",
      },
    ],
  },
];

export interface DriveStep {
  n: number;
  title: string;
  detail: string;
}

/** How to pull away in a manual car, from stationary. */
export const DRIVE_OFF_MANUAL: DriveStep[] = [
  { n: 1, title: "Get set", detail: "Adjust your seat and mirrors, fasten your seatbelt and start the engine with the handbrake on and the gearstick in neutral." },
  { n: 2, title: "Clutch in, select first", detail: "Press the clutch all the way down and move the gear lever into first gear." },
  { n: 3, title: "Find the biting point", detail: "Lift the clutch slowly until the engine note dips and the car feels like it wants to move — hold it right there." },
  { n: 4, title: "Observe", detail: "Check your mirrors and your right blind spot for traffic, cyclists and pedestrians. Signal if it would help anyone." },
  { n: 5, title: "Release the handbrake", detail: "With the biting point held and a little accelerator, release the handbrake fully." },
  { n: 6, title: "Pull away smoothly", detail: "Gradually let the clutch out as you feed in more accelerator. The car moves off smoothly — no stall, no lurch." },
  { n: 7, title: "Build up & settle", detail: "Once rolling, take up your road position, ease the clutch fully out and change up through the gears as your speed increases." },
];

/** The short version for an automatic car. */
export const DRIVE_OFF_AUTO =
  "In an automatic there's no clutch. With your foot on the brake, move the selector to D (Drive), release the handbrake, then ease off the brake and gently onto the accelerator. Use P (Park) only once you've stopped completely.";

/** The pre-drive "cockpit drill" — set the car up before you move off. */
export const COCKPIT_DRILL: { n: number; title: string; detail: string }[] = [
  { n: 1, title: "Doors", detail: "Check that all the doors are properly closed before you move off." },
  { n: 2, title: "Seat", detail: "Adjust the seat so you can fully press the pedals and reach the wheel comfortably, with the head restraint behind your head." },
  { n: 3, title: "Steering & seatbelt", detail: "Settle a relaxed grip on the wheel, then fasten your seatbelt and make sure your passengers are buckled up too." },
  { n: 4, title: "Mirrors", detail: "Set the rear-view and both side mirrors so you can see clearly behind and beside the car." },
  { n: 5, title: "Start up", detail: "Handbrake on, gearstick in neutral, then start the engine and check that no warning lights stay on." },
];

export interface TransmissionInfo {
  type: string;
  icon: string; // lucide-react icon name
  summary: string;
  points: string[];
}

/** How a manual gearbox differs from an automatic. */
export const TRANSMISSIONS: TransmissionInfo[] = [
  {
    type: "Manual",
    icon: "Cog",
    summary: "You change the gears yourself, using the clutch and the gear lever.",
    points: [
      "Three pedals: clutch (left), brake (middle), accelerator (right).",
      "Press the clutch to change gear, or to stop without stalling.",
      "Find the clutch 'biting point' to pull away smoothly.",
      "More to coordinate, but more control — especially on hills.",
    ],
  },
  {
    type: "Automatic",
    icon: "CircleDot",
    summary: "The car selects the gears for you — there is no clutch pedal.",
    points: [
      "Two pedals: brake and accelerator — both worked with your right foot.",
      "A selector with P (Park), R (Reverse), N (Neutral) and D (Drive).",
      "Select D, release the handbrake, and ease off the brake to creep forward.",
      "Simpler to drive, especially in stop-start traffic.",
    ],
  },
];
