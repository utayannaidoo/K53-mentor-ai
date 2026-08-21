---
name: glass-design-system
description: The K53 Mentor liquid-glass design system — depth tiers, motion tokens, palette, component rules, and guardrails. Use for ANY UI work (new components, pages, styling, motion) so it stays on-system.
---

# Liquid Glass Design System

The app's visual language is settled (see `DESIGN_DIRECTION.md`, `SESSION_LOG.md`). **Do not re-theme.** Build new UI from these primitives; never hand-roll glass, shadows, or motion.

## Depth tiers — adjacent surfaces MUST sit on different tiers
| Tier | Class | Blur | Usage |
|---|---|---|---|
| Atmosphere | `bg-app` / `bg-aurora` | — | Page backdrop (required behind any glass) |
| Chrome | `glass-panel` | 26px | Sidebar, topbar, mobile nav (edge-free) |
| Recessed | `glass-subtle` / `glassSubtle` | 14px | Stat tiles, insets |
| Content | `glass` | 22px | Standard cards |
| Floating | `glassFloat` / `glass-2` | 30–34px | Hero, active step, modals, tooltips |

Helpers `glass`, `glassFloat`, `glassSubtle` live in `src/lib/utils.ts`. Every glass surface (except chrome) carries `.glass-edge` (top specular + rim, painted in `::before` behind content). Blur budget: never exceed ~36px; no `backdrop-filter` on long scrolling lists.

## Motion tokens
| Token | Curve | Usage |
|---|---|---|
| `ease-glass` | `cubic-bezier(0.22,1,0.36,1)` | Reveals, page transitions |
| `ease-soft` | `cubic-bezier(0.4,0,0.2,1)` | Colour/opacity changes |
| `ease-spring` | `cubic-bezier(0.34,1.3,0.64,1)` | Press release, switch knob, modal enter |

- Press: `.press` (scale 0.97 spring). Hover: `hover-elevate`. Focus: animated 4px soft ring.
- Route transitions via `template.tsx` per section (240ms opacity fade; shell never remounts).
- Section entrances: `Reveal` (`src/components/shared/reveal.tsx`), stagger 80–120ms.
- Transform/opacity only — no layout-thrashing animation. No bouncy loops.

## Palette (HSL tokens in `src/app/globals.css`)
Primary blue `--primary`, amber `--accent` (streaks/highlights ONLY), semantic `--success`/`--warning`/`--danger`. Restraint: one blue→violet gradient allowed on hero accent; no neon/rainbow. Fonts: Sora (display, tight tracking), Inter (body), mono/tabular numerics.

## Component rules
- Buttons: CVA variants in `src/components/ui/button.tsx`; links styled via `buttonVariants()` — never restyle an `<a>` by hand.
- Reuse shared primitives: `Dialog`, `Switch`, `Tooltip`, `Skeleton` (shimmer), `EmptyState`, `ScoreRing`, `MasteryBar` in `src/components/ui/`. If a pattern appears twice, extract it there.
- Tables/lists: `divide-y` hairlines, row hover tint, status as soft pills.
- Loading: skeletons on glass, not spinners, wherever possible.

## Guardrails (non-negotiable)
- WCAG AA contrast over glass; sheen/edge stays behind content.
- `prefers-reduced-motion` and `.data-saver` (drops blur/loops/decoration) must keep working — test both.
- Light + dark parity: verify every change in both modes.
- Definition of done per pass: `npm run build` green, screenshots light+dark, no console errors, diff touches only styling/motion (no logic/route/content changes when doing design passes).

## Anti-patterns
Uniform glass on everything · over-blur · fake gloss · neon gradients · bouncy motion · animation for its own sake · translucency that hurts contrast · new theme proposals (explicitly decided against in `docs/growth/slice-3-spec.md`).
