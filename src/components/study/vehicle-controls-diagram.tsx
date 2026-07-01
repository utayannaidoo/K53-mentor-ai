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

/**
 * Motorcycle diagram — pixel-faithful port of the approved "Motorcycle
 * controls" design (front 3/4 illustration with realistic metal/lamp/tyre
 * gradients, leader lines and labels). Fixed manual-style palette, not the
 * app's theme variables — same treatment as the car diagram's static image.
 */
export function MotorcycleDiagram() {
  return (
    <svg
      viewBox="0 0 560 270"
      className="mx-auto w-full max-w-2xl"
      role="img"
      aria-label="Labelled diagram of a motorcycle's controls: clutch, mirror, front brake, handlebars, accelerator, indicator, brake pedal and gear lever"
    >
      <defs>
        <linearGradient id="mc-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2f4f7" />
          <stop offset="0.5" stopColor="#c3c9d2" />
          <stop offset="1" stopColor="#8f97a3" />
        </linearGradient>
        <linearGradient id="mc-metalV" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef1f5" />
          <stop offset="1" stopColor="#9aa2ad" />
        </linearGradient>
        <radialGradient id="mc-lamp" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#fbfcfe" />
          <stop offset="0.7" stopColor="#c7ccd4" />
          <stop offset="1" stopColor="#8b929c" />
        </radialGradient>
        <radialGradient id="mc-tyre" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#5c6169" />
          <stop offset="1" stopColor="#1f2226" />
        </radialGradient>
      </defs>

      {/* ===== illustration (front 3/4 view) ===== */}
      <g>
        {/* rear body / seat receding */}
        <path d="M243,120 C246,92 250,72 258,58 C264,50 274,50 279,60 C285,74 285,98 280,122 Z" fill="url(#mc-metalV)" stroke="#6f7783" strokeWidth={1} />
        {/* fuel tank */}
        <path d="M222,132 C224,110 236,98 255,98 C274,98 285,110 288,132 C288,150 274,158 255,158 C236,158 220,150 222,132 Z" fill="url(#mc-metal)" stroke="#6f7783" strokeWidth={1} />
        {/* front wheel */}
        <ellipse cx="252" cy="212" rx="30" ry="34" fill="url(#mc-tyre)" />
        <ellipse cx="252" cy="212" rx="17" ry="20" fill="#b8bec7" stroke="#7d8590" strokeWidth={1} />
        <ellipse cx="252" cy="212" rx="6" ry="7" fill="#8b929c" />
        {/* front mudguard */}
        <path d="M225,196 C230,168 240,150 252,150 C264,150 275,168 280,196 C272,182 262,176 252,176 C242,176 234,182 225,196 Z" fill="url(#mc-metal)" stroke="#6f7783" strokeWidth={1} />
        {/* forks */}
        <path d="M243,158 L237,192 M262,158 L268,192" stroke="#9aa2ad" strokeWidth={5} strokeLinecap="round" />
        {/* headlight */}
        <ellipse cx="252" cy="150" rx="20" ry="24" fill="url(#mc-lamp)" stroke="#6f7783" strokeWidth={1} />
        <ellipse cx="252" cy="150" rx="12" ry="15" fill="#eef2f7" opacity={0.85} />
        {/* instrument cluster */}
        <ellipse cx="252" cy="118" rx="9" ry="8" fill="#3a3f47" stroke="#6f7783" strokeWidth={1} />
        {/* handlebar */}
        <path d="M252,128 C230,118 214,116 198,120 M252,128 C274,118 290,116 306,120" fill="none" stroke="#7f8791" strokeWidth={5} strokeLinecap="round" />
        {/* grips */}
        <rect x="182" y="115" width="20" height="9" rx="4" fill="#2f333a" transform="rotate(-8 192 119)" />
        <rect x="302" y="115" width="20" height="9" rx="4" fill="#2f333a" transform="rotate(8 312 119)" />
        {/* levers */}
        <path d="M200,116 C210,110 220,110 228,114" fill="none" stroke="#8b929c" strokeWidth={2.5} strokeLinecap="round" />
        <path d="M304,116 C294,110 284,110 276,114" fill="none" stroke="#8b929c" strokeWidth={2.5} strokeLinecap="round" />
        {/* mirror stalks + heads */}
        <path d="M196,118 C190,96 186,78 190,66" fill="none" stroke="#8b929c" strokeWidth={3} strokeLinecap="round" />
        <path d="M308,118 C314,96 318,78 314,66" fill="none" stroke="#8b929c" strokeWidth={3} strokeLinecap="round" />
        <ellipse cx="188" cy="60" rx="12" ry="9" fill="url(#mc-metalV)" stroke="#6f7783" strokeWidth={1} />
        <ellipse cx="316" cy="60" rx="12" ry="9" fill="url(#mc-metalV)" stroke="#6f7783" strokeWidth={1} />
        {/* indicator stalk (front) */}
        <line x1="285" y1="126" x2="298" y2="150" stroke="#8b929c" strokeWidth={2.5} strokeLinecap="round" />
        <ellipse cx="300" cy="153" rx="4.5" ry="4" fill="#e8a33d" stroke="#b07c26" strokeWidth={0.8} />
        {/* gear lever (left foot) */}
        <path d="M232,158 C224,178 216,196 210,206" fill="none" stroke="#8b929c" strokeWidth={3} strokeLinecap="round" />
        <rect x="204" y="204" width="12" height="6" rx="3" fill="#2f333a" transform="rotate(-18 210 207)" />
        {/* brake pedal (right foot) */}
        <path d="M280,160 C290,180 298,196 304,206" fill="none" stroke="#8b929c" strokeWidth={3} strokeLinecap="round" />
        <rect x="300" y="203" width="14" height="6" rx="3" fill="#3a3f47" transform="rotate(18 307 206)" />
      </g>

      {/* ===== leader lines ===== */}
      <g stroke="#333" strokeWidth={1} fill="none">
        <line x1="120" y1="60" x2="196" y2="118" />
        <line x1="255" y1="34" x2="200" y2="60" />
        <line x1="440" y1="52" x2="308" y2="112" />
        <line x1="150" y1="128" x2="205" y2="122" />
        <line x1="415" y1="150" x2="322" y2="120" />
        <line x1="245" y1="238" x2="300" y2="156" />
        <line x1="420" y1="222" x2="310" y2="207" />
        <line x1="135" y1="238" x2="208" y2="205" />
      </g>
      <g fill="#222">
        <circle cx="196" cy="118" r="1.6" />
        <circle cx="200" cy="60" r="1.6" />
        <circle cx="308" cy="112" r="1.6" />
        <circle cx="205" cy="122" r="1.6" />
        <circle cx="322" cy="120" r="1.6" />
        <circle cx="300" cy="156" r="1.6" />
        <circle cx="310" cy="207" r="1.6" />
        <circle cx="208" cy="205" r="1.6" />
      </g>

      {/* ===== labels ===== */}
      <g fontFamily="Arial, Helvetica, sans-serif" fill="#111">
        <text x="118" y="42" textAnchor="end" fontSize={11} fontWeight={700}>CLUTCH</text>
        <text x="118" y="54" textAnchor="end" fontSize={9.5}>To disengage</text>
        <text x="118" y="65" textAnchor="end" fontSize={9.5}>the engine for</text>
        <text x="118" y="76" textAnchor="end" fontSize={9.5}>gear change</text>

        <text x="255" y="28" textAnchor="middle" fontSize={11} fontWeight={700}>MIRROR</text>

        <text x="452" y="42" fontSize={11} fontWeight={700}>FRONT BRAKE</text>
        <text x="452" y="54" fontSize={9.5}>To control speed</text>
        <text x="452" y="65" fontSize={9.5}>and stop</text>

        <text x="118" y="108" textAnchor="end" fontSize={11} fontWeight={700}>HANDLEBARS</text>
        <text x="118" y="120" textAnchor="end" fontSize={9.5}>To steer in a particular</text>
        <text x="118" y="131" textAnchor="end" fontSize={9.5}>direction. Keep both hands</text>
        <text x="118" y="142" textAnchor="end" fontSize={9.5}>on the handlebars except</text>
        <text x="118" y="153" textAnchor="end" fontSize={9.5}>to give a hand signal</text>

        <text x="430" y="140" fontSize={11} fontWeight={700}>ACCELERATOR</text>
        <text x="430" y="152" fontSize={9.5}>To increase or</text>
        <text x="430" y="163" fontSize={9.5}>decrease speed</text>

        <text x="205" y="228" textAnchor="middle" fontSize={11} fontWeight={700}>INDICATOR</text>
        <text x="205" y="240" textAnchor="middle" fontSize={9.5}>To signal your</text>
        <text x="205" y="251" textAnchor="middle" fontSize={9.5}>intention to turn</text>

        <text x="430" y="212" fontSize={11} fontWeight={700}>BRAKE PEDAL</text>
        <text x="430" y="224" fontSize={9.5}>To control speed</text>

        <text x="132" y="228" textAnchor="end" fontSize={11} fontWeight={700}>GEAR LEVER</text>
        <text x="132" y="240" textAnchor="end" fontSize={9.5}>To select gears</text>
      </g>
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
