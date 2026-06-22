# K53 Mentor AI — Liquid Glass Design Direction (Execution Prompt)

> A visual/interaction/motion refinement brief. **Functionality, data, business logic,
> routes, flows, content, and navigation are locked.** Only styling, motion, spacing,
> hierarchy, and polish may change. No features added or removed.

## 0. How to use this prompt
Work in **small, centralized, verifiable passes** against the existing design system — do
not rewrite pages. After each pass: `npm run build` must stay green, then screenshot the
affected surface in **light and dark** and confirm no console errors before moving on.

## 1. Baseline already in place (build on this, don't redo)
- 3-tier glass system in `globals.css`: `.glass-subtle` (insets), `.glass` (cards),
  `.glass-2`/`glassFloat` (floating), plus `.glass-panel` (nav chrome). Atmosphere via
  `.bg-app` / `.bg-aurora`. Edge lighting via `.glass-edge` (top specular line + perimeter
  rim + sheen, painted behind content with `isolation`/`z-index:-1`).
- Tokens: cool palette (`--primary` blue, amber accent), `--radius: 1rem`, shadows
  `shadow-soft/glass/float/elevate`, easings `ease-glass`/`ease-soft`, `Reveal`
  scroll-in, animated `ScoreRing` with tinted halo, gradient progress/mastery bars.
- Guards: `prefers-reduced-motion`, `.data-saver` (drops blur + decorative bg + loops).

**Gap to close:** make it feel *physical and alive* (spring motion, press/hover/focus
feedback, modal/page transitions), tighten hierarchy/spacing to Apple/Cluely level, and
push the glass from "applied" to "intentional material" so depth reads on every surface —
not just the dashboard hero.

## 2. Reference → decision mapping
| Reference | Take this | Apply to |
|---|---|---|
| Legal dashboard (light, frosted panels, layered sidebar rail) | Soft light glass, panels floating over a tinted gradient, a secondary rail peeking behind for depth | Dashboard, app shell |
| Dark flight widget (color light refracting through glass, bright edge) | True material translucency where the background's color/light bleeds through; crisp top-edge highlight | Dark mode, hero/product cards, tutor |
| Nike product page (frosted + red gradient pill buttons, floating chips) | Tactile pill buttons with subtle gloss + depth; floating chip groups | Buttons, chips, mobile CTAs |
| Tourera floating glass navbar over photo | A single rounded floating nav pill with frosted blur + solid primary CTA | Marketing nav, command/search surfaces |
| **k1.mp4 / k22.mp4 (motion)** | **Authoritative for timing/feel** — not yet decoded this session | All motion (springs, transitions, shimmer). *Provide 1-line description of each to lock exact params.* |

## 3. Unified Liquid Glass spec (concrete)
- **Material tiers (depth must be legible):** background → `glass-subtle` insets → `glass`
  cards → `glassFloat` hero/floating → `glass-panel` chrome. Adjacent components must sit
  at *different* tiers so edges separate. Translucency only reads with atmosphere behind —
  keep `bg-app`/`bg-aurora` present on every full-screen surface (dashboard, onboarding,
  diagnostic, auth).
- **Edges:** every glass surface keeps `.glass-edge` (bright 1px top specular, faint
  full rim, top sheen). Chrome (`.glass-panel`) stays edge-free.
- **Blur/translucency budget:** cards `blur(18–22px)` @ ~50–60% fill; floating
  `blur(30–34px)` @ ~66–70%; chrome `blur(24–28px)`. Never exceed ~36px (perf + "cheap
  glassmorphism" smell). Always pair `-webkit-backdrop-filter`.
- **Radii:** keep large/Apple-soft — cards `--radius` (16px), floating/product `~22px`,
  buttons/pills as today; pills (`rounded-full`) for nav + primary mobile CTAs.
- **Shadows:** layered + cool (`shadow-glass`/`float`) with inset top highlight; avoid hard
  single-drop shadows.
- **Color:** restrained. Blue primary as accent only; amber reserved for streak/highlights;
  semantic green/amber/red for status. No neon, no rainbow gradients. A single subtle
  blue→indigo gradient is allowed on one hero accent + primary fills.
- **Typography:** confident hierarchy carries the design — large tight display
  (`-0.02em`), few weights (400/500/600), generous line-height, more whitespace. Numerics
  tabular/mono.
- **Spacing:** increase breathing room and grouping; remove visual noise; lean on negative
  space. Editorial section rhythm on marketing.

## 4. Motion spec (fluid, physical, subtle)
Principle: the UI should feel like it's **responding to touch**, not toggling states.
- **Easing:** standard transitions on `ease-glass`/`ease-soft`. Where a *spring* feel is
  wanted (press release, modal/sheet, drag), use a CSS spring-ish curve
  (`linear()` spring or a tuned cubic-bezier overshoot). Only introduce a tiny spring lib
  if CSS can't express it — default to CSS; keep bundle lean. **No bouncy/playful loops.**
- **Press:** all interactive glass scales to ~0.97 on `:active` (`.press` exists) with a
  brief brightness lift; pointer-down feels tactile.
- **Hover:** soft elevation (`hover-elevate`) + a faint sheen/brightness shift on glass; no
  abrupt color jumps.
- **Focus:** animated 4px soft ring (`ring-ring/20`) that fades in; keyboard-visible.
- **Reveal:** keep `Reveal` for section entrances (opacity + 6px rise + slight blur-in);
  stagger groups by ~80–120ms. Above-the-fold renders immediately.
- **Modals/sheets:** scale-in + backdrop blur-in; spring on enter, quick ease on exit.
- **Page/route transitions:** subtle cross-fade/slide-up on `app` route changes (App Router
  template) — fast (~250ms), never blocking.
- **Glass shimmer:** a *very* slow, low-amplitude highlight drift on hero/featured glass
  only; off under reduced-motion/data-saver.
- **Number/score:** keep animated count-up + ring fill; ensure 60fps (transform/opacity
  only, no layout thrash).

## 5. Component checklist (treatment per element — keep APIs identical)
- **Buttons** — glass-edge on filled/outline/secondary/ai/danger; press+hover+focus motion;
  pill option for primary CTAs; ghost/link stay flat.
- **Cards / containers / dashboard widgets** — tier-appropriate glass + edge; hover-elevate
  for interactive ones; consistent internal padding scale.
- **Sidebar / header / mobile nav** — `glass-panel`; active item = glass pill w/ inset ring;
  consider the layered "rail peeking" depth from the reference.
- **Search / command** — floating frosted pill (Tourera-style) with soft inner shadow.
- **Inputs / dropdowns / settings panels** — translucent fill, animated focus ring, soft
  inner shadow; selects/menus as floating `glass-2` popovers with scale-in.
- **Modals / dialogs** — `glass` sheet, blur-in backdrop, spring enter.
- **Tables** — quieter rows, hairline dividers, row hover tint, sticky header on glass;
  status as soft pills.
- **Tooltips / notifications / toasts** — small `glass-2` floaters, scale+fade, auto-dismiss
  motion.
- **Tabs / chips / badges** — frosted chips; selected = primary-tinted glass.
- **Empty states** — centered, generous whitespace, soft icon-in-glass, one clear CTA.
- **Loading states** — calm shimmer/skeleton on glass (not spinners where avoidable);
  pulse, not bounce.
- **Charts / progress / score rings** — single-hue or subtle-gradient fills; ring halo as a
  soft circular glow (no box clipping); calm reveal.

## 6. Guardrails (non-negotiable)
- **Legibility first:** maintain WCAG AA text contrast *over glass*; never sacrifice
  readability for translucency. Sheen/edge stays behind content.
- **Performance:** cap blur radius; avoid `backdrop-filter` on huge/scrolling lists; prefer
  transform/opacity animation; respect `.data-saver` (drop blur + loops).
- **Accessibility:** honor `prefers-reduced-motion`; visible keyboard focus; color never the
  only signal (icon/text too).
- **Light + dark parity:** every change verified in both; dark is where Liquid Glass shines,
  light must stay clean and high-contrast.
- **Restraint:** glass as a *material*, not a gimmick — no fake gloss, no over-blur, no
  decoration competing with content.

## 7. Execution plan (phased)
1. **Motion foundation** — spring/easing tokens, global press/hover/focus, route-transition
   template, modal/toast motion. (Highest "alive" payoff.)
2. **Inputs & overlays** — inputs, dropdowns/selects, tooltips, toasts, settings panels to
   glass + motion (currently the least-polished surfaces).
3. **Tables & lists** — case list, tasks, communication, country/breakdown to refined glass
   rows + status pills.
4. **Depth tuning** — ensure every page sits components on distinct tiers over atmosphere;
   add the layered sidebar-rail depth cue.
5. **Empty/loading states** — unify to calm glass skeletons + elegant empties.
6. **Marketing polish** — nav pill, hero rhythm, section reveals, product-shot framing.

## 8. Definition of Done (per pass)
- `npm run build` green; no new console errors; no TS/API/route/content changes.
- Screenshots in light + dark confirm: clear depth tiers, legible text, tactile motion,
  no boxy/clipped glow, reduced-motion + data-saver respected.
- Diff touches only `className`/CSS/tokens/motion + non-functional wrappers (e.g. `Reveal`,
  transition templates).

## 9. Anti-patterns to avoid
Cheap uniform glassmorphism on everything · over-blur · fake glossy buttons · neon/rainbow
gradients · bouncy playful motion · animation for its own sake · translucency that hurts
contrast · decorative shadows with no elevation logic.

---
*Open item:* decode `k1.mp4` / `k22.mp4` (or a 1-line description of each) to lock exact
spring timing and any signature transition before Phase 1.
