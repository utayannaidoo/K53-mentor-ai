# Timing sheet

**58.0s · 3480 frames · 60 fps · 120 BPM**

One beat = 30 frames. One bar = 120 frames. Every scene boundary in the film
lands on a bar line, which is why the edit reads as locked to the music rather
than laid over it.

All frame numbers are **absolute on the master timeline** unless a column says
otherwise. Source of truth: [`src/video/config.ts`](../src/video/config.ts).

---

## Act structure

| Act | Scene | In | Out | Raw length | Runtime |
|---|---|---:|---:|---:|---|
| I | Mystery | 0 | 372 | 372 | 0:00 – 0:06 |
| II | Problem | 354 | 1044 | 690 | 0:06 – 0:17 |
| III | Reveal | 999 | 1635 | 636 | 0:17 – 0:27 |
| IV·1 | Diagnostic | 1605 | 1953 | 348 | 0:27 – 0:33 |
| IV·2 | Weak spots | 1929 | 2271 | 342 | 0:33 – 0:38 |
| IV·3 | Daily plan | 2247 | 2607 | 360 | 0:38 – 0:43 |
| IV·4 | AI tutor | 2583 | 2925 | 342 | 0:43 – 0:49 |
| V | Close | 2885 | 3480 | 595 | 0:49 – 0:58 |

Scenes overlap because transitions consume frames from both sides. Raw lengths
sum to 3685; transitions total 205; the film is 3480.

## Transitions

| # | Between | Frames | Presentation | Why this one |
|---|---|---:|---|---|
| T1 | Mystery → Problem | 18 | `lightWipe` 96° | A blade of light cuts the line off mid-breath. The most violent cut in the film. |
| T2 | Problem → Reveal | 45 | `throughBlack` hold 0.36 | **The silence.** ~16 frames at full black with no audio. |
| T3 | Reveal → Diagnostic | 30 | `depthPush` 0.5 | We fly into the product. Object continuity — one continuous move, not a cut. |
| T4 | Diagnostic → Weak spots | 24 | `blurDissolve` 22 | Rack between two planes. |
| T5 | Weak spots → Daily plan | 24 | `lightWipe` 112° | Breaks up four dissolves in a row before they flatten into a slideshow. |
| T6 | Daily plan → Tutor | 24 | `blurDissolve` 24 | |
| T7 | Tutor → Close | 40 | `blurDissolve` 34 | The exhale. |

---

## Beat sheet

Frames in the **Local** column are relative to that scene's start; **Abs** is the
master timeline.

### Act I — Mystery · 0:00–0:06

| Local | Abs | Beat |
|---:|---:|---|
| 0 | 0 | Black. Grain only. Two full seconds of nothing — the most valuable second in the film. |
| 46 | 46 | A point of light at the horizon opens into a line. `reach` is animated, not opacity: it has to be born, not appear. |
| 152 | 152 | "It's not a hard test." resolves out of defocus, word by word. |
| 250 | 250 | Hold. Camera drifts. Nothing happens. |
| 330 | 330 | The line brightens half a stop — an inhale before the cut. |

### Act II — Problem · 0:06–0:17

| Local | Abs | Beat |
|---:|---:|---|
| 4 | 358 | "So why do" mask-reveals. |
| 26 | 380 | The number counts in. **6** in mono, red, 4.6× the size of the line above it. |
| 58 | 412 | "fail it." |
| 120 | 474 | **THE TURN.** The Act I line shatters. The only camera roll in the film (0.9°). |
| 150 | 504 | Slam 1 — "Cram." |
| 246 | 600 | Slam 2 — "Forget." *(interval: 96f)* |
| 330 | 684 | Slam 3 — "Guess." *(interval: 84f)* |
| 402 | 756 | Slam 4 — "Fail." *(interval: 72f)* — the act is accelerating under the viewer |
| 452 | 806 | The stack: "Book again / Pay again / Wait again" overlap inside one bar. |
| 560 | 914 | **NOT YET COMPETENT.** One frame of full red. The film's low point. |
| 628 | 982 | Collapse. The frame contracts and darkens. |

### — SILENCE — frames 990–1023

Nothing on screen, nothing in the mix. If you add anything here you break the
film.

### Act III — Reveal · 0:17–0:27

| Local | Abs | Beat |
|---:|---:|---|
| 24 | 1023 | The road starts moving. Felt before it is seen. |
| 48 | 1047 | **THE RUSH** begins. Cubic travel ramp — the road gets away from you. |
| 168 | 1167 | **THE DROP.** The road passes the lens. Bloom, then chromatic split. |
| 186 | 1185 | The mark *draws* itself — road edges first, stroked from the vanishing point. |
| 216–244 | 1215–1243 | Three lane dashes light, bottom to top. |
| 300 | 1299 | The wordmark condenses in; letter-spacing collapses 0.14em → −0.028em. |
| 372 | 1371 | Handoff — the lockup lifts and defocuses out… |
| 412 | 1411 | …as the product rises into frame. 20 frames of overlap; no empty beat. |
| 432–560 | 1431–1559 | Slow orbit. Yaw −9° → +3°, pitch +3.4° → −0.6°. |
| 470 | 1469 | "Know exactly where you stand." — held back a full second so the image earns it. |
| 560 | 1559 | Push in. Hand off to the depth transition. |

### Act IV·1 — Diagnostic · 0:27–0:33

| Local | Abs | Beat |
|---:|---:|---|
| 30–176 | 1635–1781 | The deal. 15 cards at 9.7 frames each — under the ~12 frames it takes to read a line. |
| 184 | 1789 | The stack implodes toward the centre. |
| 200 | 1805 | The ring writes; the number counts to **78**. Overlaps the implosion by 12 frames. |
| 272 | 1877 | **82%** predicted pass probability. |

### Act IV·2 — Weak spots · 0:33–0:38

| Local | Abs | Beat |
|---:|---:|---|
| 30–140 | 1959–2069 | Four categories stagger in, in the order the app lists them. |
| 150–210 | 2079–2139 | **THE SORT.** Rows travel to new positions on a spring — they pass each other. |
| 200–250 | 2129–2179 | Weak two lift forward and brighten; strong two recede and dim to 34%. |
| 250 | 2179 | "Focus here" chips land. |

### Act IV·3 — Daily plan · 0:38–0:43

| Local | Abs | Beat |
|---:|---:|---|
| 60–100 | 2307–2347 | The pointer enters and travels — arcing, because hands arc. |
| 104 | 2351 | Click. |
| 108 | 2355 | The card flips on the *release*. |
| 150 | 2397 | Again / Hard / Good / Easy stagger up. |
| 186–222 | 2433–2469 | Pointer travels to "Good". |
| 224 | 2471 | Press. Down fast, released on a spring. |
| 232 | 2479 | The card is thrown under motion blur; the next is already rising behind. |
| 258–312 | 2505–2559 | Road signs mastery 64 → 71, and a +7 chip. |

### Act IV·4 — AI tutor · 0:43–0:49

| Local | Abs | Beat |
|---:|---:|---|
| 40 | 2623 | Option C is marked wrong, in red. |
| 60 | 2643 | The tutor panel rises on a heavy spring, blue-tinted — a different system speaking. |
| 78–116 | 2661–2699 | **RACK FOCUS.** Question → 7px blur, panel → sharp. Two planes, one rack. |
| 128 | 2711 | "Why is B correct?" |
| 132–290 | 2715–2873 | The answer streams. Eased, not linear. |

### Act V — Close · 0:49–0:58

| Local | Abs | Beat |
|---:|---:|---|
| 0 | 2885 | Black, and the line. The same line that opened the film. Let it sit. |
| 70–200 | 2955–3085 | **THE BEND.** scaleY opens 0.015 → 1 as the ring writes around it. |
| 200 | 3085 | **CLOSURE.** The stroke meets itself. Bloom pulse, particles get one push. |
| 206–268 | 3091–3153 | The ring contracts and dims away. |
| 232 | 3117 | The mark draws at the ring's centre. |
| 370 | 3255 | "Pass first time." — the largest type in the film. |
| 440 | 3325 | "Start free — no card needed." + the URL. |
| 500–560 | 3385–3445 | The pull-back. |
| 591 | 3476 | Black. The last four frames are pure black — a film ends on nothing. |
