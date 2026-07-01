/**
 * Labelled control diagrams for motorcycle and heavy-vehicle learners. These
 * are original on-brand illustrations (not copies of any manual's artwork) that
 * follow the standard labelled-callout layout: each control is named with a
 * short note and a leader line to its place on the vehicle. Colours use the
 * app's theme variables so they track light/dark.
 */

const FG = "hsl(var(--foreground))";
const FG_SOFT = "hsl(var(--foreground) / 0.7)";
const FG_DARK = "hsl(var(--foreground) / 0.85)";
const MUTED = "hsl(var(--muted))";
const MUTEDFG = "hsl(var(--muted-foreground))";
const BORDER = "hsl(var(--border))";
const CARD = "hsl(var(--card))";
const PRIMARY = "hsl(var(--primary))";
const WARNING = "hsl(var(--warning))";
const DANGER = "hsl(var(--danger))";

function Callout({
  toX,
  toY,
  x,
  y,
  anchor = "start",
  title,
  sub,
}: {
  toX: number;
  toY: number;
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
  title: string;
  sub: string;
}) {
  return (
    <g>
      <polyline
        points={`${toX},${toY} ${x},${toY} ${x},${y - 24}`}
        fill="none"
        stroke={BORDER}
        strokeWidth={1.5}
      />
      <circle cx={toX} cy={toY} r={3.5} fill={PRIMARY} />
      <text x={x} y={y - 8} textAnchor={anchor} fontSize={13} fontWeight={700} fill={FG} letterSpacing="0.04em">
        {title}
      </text>
      <text x={x} y={y + 9} textAnchor={anchor} fontSize={11.5} fill={MUTEDFG}>
        {sub}
      </text>
    </g>
  );
}

export function MotorcycleDiagram() {
  return (
    <svg
      viewBox="0 0 680 440"
      className="mx-auto w-full max-w-2xl"
      role="img"
      aria-label="Labelled diagram of a motorcycle's controls: clutch, mirror, front brake, handlebars, accelerator, indicator, gear lever and brake pedal"
    >
      {/* ── Motorcycle (front view) ─────────────────────────────── */}
      {/* Engine / body block */}
      <rect x="305" y="226" width="70" height="74" rx="14" fill={MUTED} stroke={BORDER} strokeWidth={2} />
      {/* Fork legs */}
      <line x1="322" y1="296" x2="318" y2="216" stroke={FG_SOFT} strokeWidth={8} strokeLinecap="round" />
      <line x1="358" y1="296" x2="362" y2="216" stroke={FG_SOFT} strokeWidth={8} strokeLinecap="round" />
      {/* Front wheel */}
      <ellipse cx="340" cy="346" rx="54" ry="62" fill={FG_DARK} />
      <ellipse cx="340" cy="346" rx="34" ry="40" fill={MUTED} stroke={BORDER} strokeWidth={2} />
      <circle cx="340" cy="346" r="8" fill={FG_SOFT} />
      {/* Front mudguard */}
      <path d="M292 312 Q340 256 388 312" fill="none" stroke={FG_SOFT} strokeWidth={11} strokeLinecap="round" />

      {/* Cowl / fairing */}
      <rect x="286" y="150" width="108" height="74" rx="26" fill={MUTED} stroke={BORDER} strokeWidth={2} />
      {/* Windscreen */}
      <path d="M300 152 Q340 110 380 152 Z" fill={CARD} stroke={BORDER} strokeWidth={2} />
      {/* Headlight */}
      <ellipse cx="340" cy="184" rx="38" ry="32" fill={CARD} stroke={BORDER} strokeWidth={2} />
      <ellipse cx="340" cy="184" rx="24" ry="20" fill={MUTED} />
      <ellipse cx="331" cy="176" rx="8" ry="6" fill={CARD} />
      {/* Indicators (amber) */}
      <ellipse cx="298" cy="214" rx="9" ry="6" fill={WARNING} stroke={BORDER} />
      <ellipse cx="382" cy="214" rx="9" ry="6" fill={WARNING} stroke={BORDER} />

      {/* Handlebar */}
      <path d="M165 162 Q260 140 340 152 Q420 140 515 162" fill="none" stroke={FG_SOFT} strokeWidth={9} strokeLinecap="round" />
      {/* Grips */}
      <rect x="150" y="150" width="44" height="22" rx="11" fill={FG_SOFT} />
      <rect x="486" y="150" width="44" height="22" rx="11" fill={FG_SOFT} />
      {/* Levers */}
      <path d="M156 152 Q132 140 116 134" fill="none" stroke={FG_SOFT} strokeWidth={6} strokeLinecap="round" />
      <path d="M524 152 Q548 140 564 134" fill="none" stroke={FG_SOFT} strokeWidth={6} strokeLinecap="round" />
      {/* Mirrors */}
      <line x1="168" y1="150" x2="154" y2="112" stroke={BORDER} strokeWidth={4} />
      <ellipse cx="152" cy="104" rx="18" ry="11" fill={MUTED} stroke={BORDER} strokeWidth={2} />
      <line x1="512" y1="150" x2="526" y2="112" stroke={BORDER} strokeWidth={4} />
      <ellipse cx="528" cy="104" rx="18" ry="11" fill={MUTED} stroke={BORDER} strokeWidth={2} />

      {/* Foot pegs + controls */}
      <rect x="262" y="298" width="22" height="8" rx="4" fill={FG_SOFT} />
      <path d="M268 304 Q250 312 240 322" fill="none" stroke={FG_SOFT} strokeWidth={5} strokeLinecap="round" />
      <rect x="396" y="298" width="22" height="8" rx="4" fill={FG_SOFT} />
      <path d="M412 304 Q430 312 440 322" fill="none" stroke={FG_SOFT} strokeWidth={5} strokeLinecap="round" />

      {/* ── Callouts ────────────────────────────────────────────── */}
      <Callout toX={116} toY={134} x={26} y={72} title="CLUTCH" sub="Disengage to change gear" />
      <Callout toX={205} toY={150} x={26} y={186} title="HANDLEBARS" sub="Steer the bike" />
      <Callout toX={298} toY={214} x={26} y={300} title="INDICATOR" sub="Signal your turns" />
      <Callout toX={240} toY={322} x={26} y={392} title="GEAR LEVER" sub="Select gears (foot)" />
      <Callout toX={528} toY={104} x={420} y={56} title="MIRROR" sub="See behind" />
      <Callout toX={564} toY={134} x={654} y={72} anchor="end" title="FRONT BRAKE" sub="Slow & stop" />
      <Callout toX={515} toY={158} x={654} y={186} anchor="end" title="ACCELERATOR" sub="Twist to speed up / slow" />
      <Callout toX={440} toY={322} x={654} y={392} anchor="end" title="BRAKE PEDAL" sub="Rear brake (foot)" />
    </svg>
  );
}

export function HeavyDiagram() {
  return (
    <svg
      viewBox="0 0 680 440"
      className="mx-auto w-full max-w-2xl"
      role="img"
      aria-label="Labelled diagram of a heavy vehicle's dashboard: air-pressure gauges, parking and trailer brake valves, diff-lock, retarder, gear lever and the treadle foot-brake"
    >
      {/* ── Cab dashboard ───────────────────────────────────────── */}
      {/* Windscreen */}
      <path d="M70 70 L610 70 L590 150 L90 150 Z" fill={CARD} stroke={BORDER} strokeWidth={2} />
      <line x1="340" y1="70" x2="340" y2="150" stroke={BORDER} strokeWidth={1.5} />
      {/* Dash fascia */}
      <path d="M70 150 L610 150 Q624 150 624 168 L624 300 Q624 314 610 314 L70 314 Q56 314 56 300 L56 168 Q56 150 70 150 Z" fill={MUTED} stroke={BORDER} strokeWidth={2} />

      {/* Steering wheel (right-hand drive) */}
      <circle cx="486" cy="236" r="66" fill="none" stroke={FG_SOFT} strokeWidth={10} />
      <circle cx="486" cy="236" r="16" fill={MUTED} stroke={BORDER} strokeWidth={2} />
      <line x1="486" y1="236" x2="486" y2="174" stroke={FG_SOFT} strokeWidth={8} strokeLinecap="round" />
      <line x1="486" y1="236" x2="434" y2="268" stroke={FG_SOFT} strokeWidth={8} strokeLinecap="round" />
      <line x1="486" y1="236" x2="538" y2="268" stroke={FG_SOFT} strokeWidth={8} strokeLinecap="round" />

      {/* Instrument cluster behind the wheel: speedo + air gauges */}
      <circle cx="440" cy="196" r="22" fill={CARD} stroke={BORDER} strokeWidth={2} />
      <line x1="440" y1="196" x2="426" y2="186" stroke={FG} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx="492" cy="186" r="20" fill={CARD} stroke={BORDER} strokeWidth={2} />
      <line x1="492" y1="186" x2="505" y2="177" stroke={DANGER} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx="536" cy="196" r="20" fill={CARD} stroke={BORDER} strokeWidth={2} />
      <line x1="536" y1="196" x2="549" y2="188" stroke={FG} strokeWidth={2.5} strokeLinecap="round" />

      {/* Centre switch panel */}
      <rect x="150" y="176" width="150" height="92" rx="10" fill={CARD} stroke={BORDER} strokeWidth={2} />
      {/* Brake valves (push-pull knobs) */}
      <circle cx="186" cy="206" r="15" fill={WARNING} stroke={BORDER} strokeWidth={2} />
      <circle cx="236" cy="206" r="15" fill={DANGER} stroke={BORDER} strokeWidth={2} />
      {/* Switches */}
      <rect x="170" y="234" width="34" height="16" rx="4" fill={MUTED} stroke={BORDER} strokeWidth={1.5} />
      <rect x="218" y="234" width="34" height="16" rx="4" fill={MUTED} stroke={BORDER} strokeWidth={1.5} />

      {/* Gear lever + splitter */}
      <line x1="356" y1="312" x2="356" y2="244" stroke={FG_SOFT} strokeWidth={8} strokeLinecap="round" />
      <circle cx="356" cy="236" r="14" fill={MUTED} stroke={BORDER} strokeWidth={2} />
      <rect x="349" y="222" width="14" height="10" rx="2" fill={PRIMARY} />

      {/* Treadle foot brake */}
      <rect x="300" y="356" width="80" height="18" rx="4" fill={MUTED} stroke={BORDER} strokeWidth={2} />

      {/* ── Callouts ────────────────────────────────────────────── */}
      <Callout toX={492} toY={166} x={420} y={44} title="AIR-PRESSURE GAUGES" sub="Brake air supply" />
      <Callout toX={186} toY={191} x={26} y={120} title="PARKING BRAKE" sub="Yellow push-pull knob" />
      <Callout toX={236} toY={191} x={26} y={170} title="TRAILER BRAKE" sub="Red knob" />
      <Callout toX={187} toY={250} x={26} y={300} title="DIFF-LOCK" sub="Traction on loose ground" />
      <Callout toX={235} toY={250} x={26} y={350} title="RETARDER" sub="Engine braking on descents" />
      <Callout toX={356} toY={222} x={356} y={406} title="GEAR LEVER + SPLITTER" sub="Select / split gears" />
      <Callout toX={552} toY={236} x={654} y={150} anchor="end" title="STEERING WHEEL" sub="Right-hand drive" />
      <Callout toX={380} toY={365} x={654} y={360} anchor="end" title="FOOT BRAKE (TREADLE)" sub="Air service brake" />
    </svg>
  );
}
