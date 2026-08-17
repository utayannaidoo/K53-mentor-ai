import { formatCount, type Passport, type PassportTone } from "@/lib/share/passport";

/**
 * Painting the Driving Passport.
 *
 * Two decisions carry the whole design, and both were already argued elsewhere
 * in this repo:
 *
 * **Dark field, one bright accent.** `src/app/opengraph-image.tsx` settled this
 * for the og:image and the reasoning transfers exactly — WhatsApp is the SA
 * sharing channel, it crops a share into a small tile, and a dark card with one
 * green accent stays legible there where a cream one washes out. The card this
 * replaced was cream-on-landscape, which is the worst combination for the one
 * place it was ever going to be seen.
 *
 * **A credential, not a report.** The passport metaphor is the product's own
 * (docs/growth/engagement-research.md), and the Mastery Map gave up the
 * passport-card visual when its stamps moved onto the rings. This is where the
 * passport becomes an object: a rule under the wordmark, a licence code in the
 * header, an issue date in the footer, and a hand-pressed stamp the moment
 * there is something to stamp.
 *
 * The canvas can't read CSS variables, so the palette is inlined from the dark
 * tokens in globals.css — and it can't be trusted with `letterSpacing` either
 * (Safari only got it in 17.4), so tracked caps are drawn a glyph at a time.
 */

export type ShareFormat = "card" | "story";

export const CARD_W = 1080;
export const CARD_H = 1350;
export const STORY_W = 1080;
export const STORY_H = 1920;

export const FORMAT_SIZE: Record<ShareFormat, { w: number; h: number }> = {
  card: { w: CARD_W, h: CARD_H },
  story: { w: STORY_W, h: STORY_H },
};

/** Dark-mode tokens from globals.css, resolved to hex — see the note above. */
const C = {
  field: "#0F1412",
  fieldDeep: "#080B0A",
  panel: "rgba(255,255,255,0.035)",
  rim: "rgba(255,255,255,0.075)",
  hairline: "#2A3431",
  track: "#1E2725",
  cream: "#EBF0EC",
  muted: "#96A69E",
  faint: "#6B7A73",
  green: "#4CBF87",
  amber: "#F5A93D",
  gold: "#E3C168",
  blue: "#4A94F0",
};

const TONE: Record<PassportTone, string> = {
  success: C.green,
  warning: C.amber,
  gold: C.gold,
};

/**
 * The card's brand colour, which is not the hero's.
 *
 * The hero tone is amber whenever the lead figure is a streak or a readiness
 * under 70 — that is most learners for most of their prep. Letting it drive the
 * masthead, the top rule, the glow and the footer painted the entire card
 * amber, and the design system reserves amber for streaks and highlights
 * specifically (see the palette rule in the glass design system). It also meant
 * two learners' passports looked like two different products. Route green
 * always, except for the licence, which has earned its gold.
 */
function brandOf(tone: PassportTone): string {
  return tone === "gold" ? C.gold : C.green;
}

/** next/font hashes its family names, so the real ones are read off the document at draw time. */
export interface FontFamilies {
  display: string;
  body: string;
  mono: string;
}

export const FALLBACK_FONTS: FontFamilies = {
  display: "system-ui, sans-serif",
  body: "system-ui, sans-serif",
  mono: "ui-monospace, monospace",
};

type Ctx = CanvasRenderingContext2D;

function font(ctx: Ctx, weight: number, size: number, family: string) {
  ctx.font = `${weight} ${size}px ${family}`;
}

/**
 * The px size out of `ctx.font`.
 *
 * Not `parseFloat(ctx.font)`: the shorthand this file writes leads with the
 * weight ("600 29px Overpass"), so parseFloat returns 600 and every tracked
 * label came out spaced at 0.11em × 600px — one glyph every 66 pixels, the
 * whole card unreadable.
 */
function fontSize(ctx: Ctx): number {
  return Number(/(\d*\.?\d+)px/.exec(ctx.font)?.[1] ?? 16);
}

/** Width of `text` with `em` letter-spacing, matching what `tracked` will draw. */
function trackedWidth(ctx: Ctx, text: string, em: number): number {
  const gap = em * fontSize(ctx);
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width + gap;
  return Math.max(0, w - gap);
}

/**
 * Letter-spaced text, drawn glyph by glyph.
 *
 * The uppercase micro-label at 0.2em is this design system's signature
 * (`tracking-[0.22em]` all over the app), and `ctx.letterSpacing` is too young
 * to rely on — an iOS 16 phone would silently render every label of the card
 * cramped and wrong. `align` is handled here rather than through
 * `ctx.textAlign`, which measures without the tracking.
 */
function tracked(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  em: number,
  align: "left" | "right" | "center" = "left",
): number {
  const width = trackedWidth(ctx, text, em);
  const gap = em * fontSize(ctx);
  let cursor = align === "left" ? x : align === "right" ? x - width : x - width / 2;
  const previous = ctx.textAlign;
  ctx.textAlign = "left";
  for (const ch of text) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + gap;
  }
  ctx.textAlign = previous;
  return width;
}

/** Largest size at or below `size` that fits `max`. Names vary; the layout can't. */
function fitted(ctx: Ctx, text: string, max: number, weight: number, size: number, family: string) {
  let s = size;
  font(ctx, weight, s, family);
  while (ctx.measureText(text).width > max && s > 24) {
    s -= 2;
    font(ctx, weight, s, family);
  }
  return s;
}

function wrap(ctx: Ctx, text: string, max: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > max && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) return lines;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function hairline(ctx: Ctx, x1: number, x2: number, y: number, colour = C.hairline) {
  ctx.fillStyle = colour;
  ctx.fillRect(x1, y, x2 - x1, 1);
}

/**
 * The field: ink, two accent glows, and a printed dot grid.
 *
 * The dots are `.bg-app`'s texture from globals.css at the same weight. On a
 * flat dark rectangle they are the difference between a slide and a document,
 * and a document is what a credential has to look like.
 */
function paintField(ctx: Ctx, w: number, h: number, accent: string, base: string) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  const top = ctx.createRadialGradient(w * 0.14, 0, 0, w * 0.14, 0, w * 0.95);
  top.addColorStop(0, `${accent}2E`);
  top.addColorStop(1, "transparent");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, w, h);

  const bottom = ctx.createRadialGradient(w * 0.92, h, 0, w * 0.92, h, w * 0.8);
  bottom.addColorStop(0, "rgba(44,95,79,0.34)");
  bottom.addColorStop(1, "transparent");
  ctx.fillStyle = bottom;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(235,240,236,0.045)";
  for (let y = 12; y < h; y += 26) {
    for (let x = 12; x < w; x += 26) ctx.fillRect(x, y, 2, 2);
  }
}

/** The ring. Track, sweep, and the number that lives inside it. */
function paintRing(ctx: Ctx, cx: number, cy: number, p: Passport, f: FontFamilies) {
  const radius = 112;
  const stroke = 20;
  const accent = TONE[p.hero.tone];

  ctx.lineWidth = stroke;
  ctx.lineCap = "round";
  // Translucent rather than the solid `track` ink: a fixed dark green reads
  // distinctly blue next to an amber sweep, and the track must never look like
  // a third colour on a card that is allowed exactly two.
  ctx.strokeStyle = "rgba(235,240,236,0.09)";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  if (p.hero.pct > 0) {
    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + (p.hero.pct / 100) * Math.PI * 2);
    ctx.stroke();
  }

  const size = p.hero.value.length > 2 ? 72 : 86;
  font(ctx, 700, size, f.display);
  const valueWidth = ctx.measureText(p.hero.value).width;
  font(ctx, 600, 36, f.display);
  const unitWidth = p.hero.unit ? ctx.measureText(p.hero.unit).width + 4 : 0;
  const startX = cx - (valueWidth + unitWidth) / 2;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = C.cream;
  font(ctx, 700, size, f.display);
  ctx.fillText(p.hero.value, startX, cy + size * 0.34);
  if (p.hero.unit) {
    ctx.fillStyle = accent;
    font(ctx, 600, 36, f.display);
    ctx.fillText(p.hero.unit, startX + valueWidth + 4, cy + size * 0.34);
  }

  ctx.fillStyle = C.muted;
  font(ctx, 600, 19, f.display);
  tracked(ctx, p.hero.label, cx, cy + radius + 46, 0.2, "center");
}

/**
 * The stamp. Tilted, because a stamp is pressed by hand — the same reasoning
 * the mastery stamps use in `mastery-map.tsx`, and the reason this is the
 * detail people screenshot.
 */
function paintStamp(ctx: Ctx, cx: number, cy: number, p: Passport, f: FontFamilies) {
  if (!p.stamp) return;
  const accent = TONE[p.stamp.tone];
  const w = 300;
  const h = 120;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-11 * Math.PI) / 180);
  ctx.globalAlpha = 0.85;

  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;
  roundRect(ctx, -w / 2, -h / 2, w, h, 14);
  ctx.stroke();
  ctx.lineWidth = 2;
  roundRect(ctx, -w / 2 + 11, -h / 2 + 11, w - 22, h - 22, 7);
  ctx.stroke();

  ctx.fillStyle = accent;
  font(ctx, 700, 46, f.display);
  tracked(ctx, p.stamp.title, 0, 6, 0.1, "center");
  font(ctx, 600, 18, f.display);
  tracked(ctx, p.stamp.detail, 0, 38, 0.18, "center");
  ctx.restore();
  ctx.globalAlpha = 1;
}

/**
 * The skyline — seven bars, same axes for everybody, a different silhouette for
 * every learner. This is the card's route map: the part that makes one person's
 * passport recognisably not another's, and the only part that still reads once
 * WhatsApp has shrunk the image to a thumbnail.
 *
 * Each bar carries the mark its exam section actually has to clear, for the
 * reason `dashboard/mastery.ts` gives: signs needs 82% and rules 79%, so a bar
 * with no mark on it cannot say whether it is passing.
 */
function paintSkyline(ctx: Ctx, x: number, y: number, w: number, h: number, p: Passport, f: FontFamilies) {
  const count = p.bars.length;
  const barW = 86;
  const gap = (w - count * barW) / (count - 1);

  p.bars.forEach((bar, i) => {
    const bx = x + i * (barW + gap);
    const filled = Math.max(6, Math.round((bar.value / 100) * h));
    const accent = bar.clearing ? C.green : C.amber;

    ctx.fillStyle = C.track;
    roundRect(ctx, bx, y, barW, h, 10);
    ctx.fill();

    ctx.fillStyle = accent;
    roundRect(ctx, bx, y + h - filled, barW, filled, 10);
    ctx.fill();

    // The section's own pass mark, drawn over the bar so it reads as a
    // threshold rather than as part of the fill.
    const markY = Math.round(y + h - (bar.required / 100) * h);
    ctx.fillStyle = "rgba(235,240,236,0.5)";
    ctx.fillRect(bx, markY, barW, 2);

    ctx.textAlign = "center";
    ctx.fillStyle = C.cream;
    font(ctx, 600, 24, f.mono);
    ctx.fillText(String(bar.value), bx + barW / 2, y - 14);

    ctx.fillStyle = C.faint;
    font(ctx, 600, 17, f.display);
    tracked(ctx, bar.code, bx + barW / 2, y + h + 32, 0.14, "center");
    ctx.textAlign = "left";
  });
}

/** The whole card, at logical 1080×1350 with the origin at its top-left. */
function paintCard(ctx: Ctx, p: Passport, f: FontFamilies) {
  const accent = TONE[p.hero.tone];
  const brand = brandOf(p.hero.tone);
  const PAD = 72;
  const RIGHT = CARD_W - PAD;

  paintField(ctx, CARD_W, CARD_H, brand, C.field);

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  // ── Masthead ──────────────────────────────────────────────
  ctx.fillStyle = brand;
  ctx.fillRect(0, 0, CARD_W, 9);

  ctx.beginPath();
  ctx.arc(PAD + 9, 78, 9, 0, Math.PI * 2);
  ctx.fillStyle = brand;
  ctx.fill();
  font(ctx, 700, 29, f.display);
  tracked(ctx, "K53 MENTOR AI", PAD + 32, 88, 0.11);

  ctx.fillStyle = C.muted;
  font(ctx, 600, 21, f.display);
  tracked(ctx, `DRIVING PASSPORT · CODE ${p.code}`, RIGHT, 86, 0.18, "right");
  hairline(ctx, PAD, RIGHT, 128);

  // ── Identity ──────────────────────────────────────────────
  const nameMax = p.stamp ? 560 : 900;
  const nameSize = fitted(ctx, p.name, nameMax, 700, 92, f.display);
  ctx.fillStyle = C.cream;
  font(ctx, 700, nameSize, f.display);
  ctx.fillText(p.name, PAD, 232);

  font(ctx, 700, 25, f.display);
  const rankW = trackedWidth(ctx, p.rank, 0.12);
  const pillW = rankW + 52;
  ctx.fillStyle = `${brand}22`;
  roundRect(ctx, PAD, 262, pillW, 52, 26);
  ctx.fill();
  ctx.strokeStyle = `${brand}55`;
  ctx.lineWidth = 1.5;
  roundRect(ctx, PAD, 262, pillW, 52, 26);
  ctx.stroke();
  ctx.fillStyle = brand;
  tracked(ctx, p.rank, PAD + 26, 296, 0.12);

  if (p.streak >= 2) {
    const sx = PAD + pillW + 26;
    ctx.fillStyle = C.amber;
    ctx.beginPath();
    ctx.arc(sx + 5, 289, 5, 0, Math.PI * 2);
    ctx.fill();
    font(ctx, 600, 22, f.display);
    tracked(ctx, `${p.streak}-DAY STREAK`, sx + 20, 296, 0.16);
  }

  paintStamp(ctx, 860, 250, p, f);

  // ── The verdict ───────────────────────────────────────────
  const panelY = 356;
  const panelH = 352;
  ctx.fillStyle = C.panel;
  roundRect(ctx, PAD, panelY, CARD_W - PAD * 2, panelH, 28);
  ctx.fill();
  ctx.strokeStyle = C.rim;
  ctx.lineWidth = 1.5;
  roundRect(ctx, PAD, panelY, CARD_W - PAD * 2, panelH, 28);
  ctx.stroke();

  const ringCx = PAD + 44 + 112;
  paintRing(ctx, ringCx, panelY + 152, p, f);

  const colX = ringCx + 112 + 56;
  const colW = RIGHT - 44 - colX;

  font(ctx, 600, 40, f.display);
  const headlineLines = wrap(ctx, p.headline, colW, 3);
  font(ctx, 500, 25, f.body);
  const qualifierLines = wrap(ctx, p.qualifier, colW, 2);

  const blockH = 30 + headlineLines.length * 50 + 20 + qualifierLines.length * 36;
  let cursorY = panelY + (panelH - blockH) / 2 + 20;

  ctx.fillStyle = C.muted;
  font(ctx, 600, 19, f.display);
  tracked(ctx, "THE VERDICT", colX, cursorY, 0.2);
  cursorY += 46;

  ctx.fillStyle = C.cream;
  font(ctx, 600, 40, f.display);
  for (const line of headlineLines) {
    ctx.fillText(line, colX, cursorY);
    cursorY += 50;
  }

  cursorY += 14;
  ctx.fillStyle = C.muted;
  font(ctx, 500, 25, f.body);
  for (const line of qualifierLines) {
    ctx.fillText(line, colX, cursorY);
    cursorY += 36;
  }

  // ── The receipts ──────────────────────────────────────────
  ctx.fillStyle = C.muted;
  font(ctx, 600, 19, f.display);
  tracked(ctx, "THE WORK BEHIND IT", PAD, 774, 0.2);

  const cells: [string, string][] = [
    [formatCount(p.work.cards), "FLASHCARDS"],
    [formatCount(p.work.questions), "QUESTIONS"],
    [formatCount(p.work.mocks), p.work.mocks === 1 ? "MOCK EXAM" : "MOCK EXAMS"],
    [formatCount(p.work.days), p.work.days === 1 ? "STUDY DAY" : "STUDY DAYS"],
  ];
  const cellW = (CARD_W - PAD * 2) / cells.length;
  cells.forEach(([value, label], i) => {
    const cx = PAD + cellW * i + cellW / 2;
    if (i > 0) {
      ctx.fillStyle = C.hairline;
      ctx.fillRect(PAD + cellW * i, 800, 1, 92);
    }
    ctx.textAlign = "center";
    ctx.fillStyle = C.cream;
    font(ctx, 700, 54, f.mono);
    ctx.fillText(value, cx, 858);
    ctx.fillStyle = C.muted;
    font(ctx, 600, 18, f.display);
    tracked(ctx, label, cx, 890, 0.16, "center");
    ctx.textAlign = "left";
  });

  hairline(ctx, PAD, RIGHT, 926);

  // ── The skyline ───────────────────────────────────────────
  ctx.fillStyle = C.muted;
  font(ctx, 600, 19, f.display);
  tracked(ctx, "EVERY CATEGORY, AGAINST ITS PASS MARK", PAD, 972, 0.2);

  paintSkyline(ctx, PAD, 1006, CARD_W - PAD * 2, 140, p, f);

  if (p.strongest && p.weakest && p.strongest.id !== p.weakest.id) {
    ctx.font = `500 23px ${f.body}`;
    ctx.fillStyle = C.faint;
    const strongLabel = `Strongest: ${p.strongest.name} ${p.strongest.value}%`;
    ctx.fillText(strongLabel, PAD, 1224);
    ctx.textAlign = "right";
    ctx.fillText(`Working on: ${p.weakest.name} ${p.weakest.value}%`, RIGHT, 1224);
    ctx.textAlign = "left";
  }

  // ── Footer ────────────────────────────────────────────────
  hairline(ctx, PAD, RIGHT, 1256);

  ctx.fillStyle = brand;
  font(ctx, 700, 33, f.display);
  ctx.fillText(p.link, PAD, 1306);
  ctx.fillStyle = C.muted;
  font(ctx, 500, 22, f.body);
  ctx.fillText("Free K53 practice — come pass with me.", PAD, 1338);

  ctx.fillStyle = C.faint;
  font(ctx, 600, 17, f.display);
  tracked(ctx, p.referralCode ? "INVITE CODE" : "ISSUED", RIGHT, 1298, 0.2, "right");
  ctx.fillStyle = C.cream;
  font(ctx, 600, p.referralCode ? 30 : 24, f.mono);
  ctx.textAlign = "right";
  ctx.fillText(p.referralCode ?? p.issued, RIGHT, 1334);
  ctx.textAlign = "left";
}

/**
 * Draw the passport into `canvas` at the requested format.
 *
 * Story is the same composition scaled and set on a deeper field, rather than a
 * second layout: WhatsApp Status is the highest-reach surface in this market
 * and a 4:5 card posted there is letterboxed to nothing, but two hand-tuned
 * layouts is two things to keep in step. Scaling by transform (not by blitting
 * a rasterised card) keeps every glyph vector-crisp at 0.9×.
 */
export function drawPassport(
  canvas: HTMLCanvasElement,
  p: Passport,
  format: ShareFormat,
  fonts: FontFamilies = FALLBACK_FONTS,
) {
  const { w, h } = FORMAT_SIZE[format];
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);

  if (format === "card") {
    paintCard(ctx, p, fonts);
    return;
  }

  const brand = brandOf(p.hero.tone);
  paintField(ctx, w, h, brand, C.fieldDeep);

  const scale = 0.9;
  const cardW = CARD_W * scale;
  const cardH = CARD_H * scale;
  const x = (w - cardW) / 2;
  const y = 306;

  ctx.save();
  roundRect(ctx, x, y, cardW, cardH, 40);
  ctx.clip();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  paintCard(ctx, p, fonts);
  ctx.restore();

  ctx.strokeStyle = "rgba(235,240,236,0.14)";
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, cardW, cardH, 40);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = brand;
  font(ctx, 700, 26, fonts.display);
  tracked(ctx, "MY DRIVING PASSPORT", w / 2, 216, 0.26, "center");

  ctx.fillStyle = C.cream;
  font(ctx, 700, 44, fonts.display);
  ctx.fillText(p.link, w / 2, y + cardH + 118);
  ctx.fillStyle = C.muted;
  font(ctx, 500, 28, fonts.body);
  ctx.fillText("Free K53 practice tests — come pass with me.", w / 2, y + cardH + 166);
  ctx.textAlign = "left";
}

/**
 * The families next/font actually generated, read off the document.
 *
 * `--font-display` resolves to a hashed family name like `__Overpass_a1b2c3`,
 * which is the only string that will select the loaded face. Falling back to
 * system-ui rather than failing keeps the card drawable during the first paint
 * and in any environment where the variables aren't set.
 */
export function documentFonts(): FontFamilies {
  if (typeof window === "undefined") return FALLBACK_FONTS;
  const styles = window.getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => {
    const value = styles.getPropertyValue(name).trim();
    return value ? `${value}, ${fallback}` : fallback;
  };
  return {
    display: read("--font-display", FALLBACK_FONTS.display),
    body: read("--font-inter", FALLBACK_FONTS.body),
    mono: read("--font-mono", FALLBACK_FONTS.mono),
  };
}
