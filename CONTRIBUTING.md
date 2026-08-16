# Contributing to K53 Mentor AI

This is a live product — `main` deploys straight to production at
[k53mentorai.co.za](https://k53mentorai.co.za). Everything below exists because of that.

Setup is in the [README](README.md): `npm install && npm run dev` and the app runs with **zero
config**. You do not need Supabase keys, an AI key, or a Paystack account to build most features.

---

## Workflow

`main` is protected. You cannot push to it directly.

1. Branch off `main` — `feature/…`, `fix/…`, whatever reads clearly.
2. Open a PR.
3. CI (`verify`) must pass, and the PR needs **one approving review**.
4. Resolve every review conversation — unresolved threads block the merge button.

Pushing new commits **dismisses existing approvals**, so get the branch settled before asking for a
final look.

CI runs on **Node 22** and is a single job that runs, in order:

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Run that locally first. `npm run lint` is not optional — it carries
`react-hooks/rules-of-hooks`, which `typecheck` cannot catch, and which a hook added below an early
return will trip.

Note that CI checks your branch as written, not the merge result. If your PR has been open a while
and touches shared code, rebase on `main` before merging.

---

## Non-negotiables

These are the ones that get PRs sent back.

**Both modes must always work.** There is a zero-config demo mode (localStorage, rule-based tutor)
and a production mode (Supabase, real AI). Every integration activates independently from env — never
assume a key exists. If a feature only works with Supabase configured, it is not finished.

**Client state is the source of truth for study progress.** `src/hooks/use-study-store.tsx` persists
to `localStorage`; Supabase mirrors the same shapes and hydrates through
`src/lib/store/account-hydrate.ts`. New progress state goes into the local store *first*, then gets
mirrored — not the other way round.

**The server is the source of truth for money.** Tier resolves server-side from the `subscriptions`
table and fails closed to free. The Paystack webhook is the only thing that writes a paid tier.
Client-side gates are UX only — never the enforcement.

**Every AI feature degrades gracefully.** Demo mode or a provider outage must never surface a raw
error to a learner.

**No `console.log` in `src/`.** Use the existing error reporting.

**Migrations are append-only.** Add a new numbered file in `supabase/migrations/`; never edit one
that has shipped.

**No new dependencies unless genuinely unavoidable**, and say why in the PR.

---

## UI work

The design is settled and deliberate — a liquid-glass system with defined depth tiers, motion tokens,
and a fixed palette. See [DESIGN_DIRECTION.md](DESIGN_DIRECTION.md).

Ship targeted additions that match the existing system. Don't redesign surrounding screens, and don't
introduce a new visual language for one feature. If you use Claude Code, the `glass-design-system`
skill in `.claude/skills/` has the tokens and component rules.

Mobile-first, light **and** dark, and accessible. `tests/contrast.test.ts` enforces WCAG AA on the
semantic status colours — against the page background *and* against their own tinted backgrounds — so
retuning one of those tokens fails CI rather than reaching review.

---

## The engagement layer (CP, ranks, progression)

Core logic lives in [`src/lib/engagement.ts`](src/lib/engagement.ts), UI in
[`src/components/engagement/`](src/components/engagement/) (`driving-passport`, `mastery-map`,
`rank-up-toast`, `road-progress`, `share-card`), reasoning in
[`docs/growth/engagement-research.md`](docs/growth/engagement-research.md), tests in
`tests/engagement.test.ts`.

**The central design rule: Confidence Points reward proven competence, never attendance.**

Concretely, as implemented today:

- CP is awarded for **correct**, difficulty-weighted work (2/4/6 by difficulty, doubled on a
  first-ever correct answer).
- Flashcard CP scales with the interval the recall just proved — remembering a card scheduled three
  weeks out pays triple a fresh one.
- Grinding an already-known item pays a fraction of first-time mastery.
- A wrong answer earns **0**. It is never punished with a deduction.
- Driver Rank gates on CP *plus* readiness and mock performance — the final rank is reserved for
  passing the real test and cannot be reached through the app.

So: a daily-login bonus, a "streak = points" mechanic, or anything that pays out for showing up
rather than demonstrating recall runs against the design, no matter how standard it is elsewhere.
Streaks exist in the product as a *retention* surface, deliberately kept separate from CP. If you
want to change that boundary, raise it in an issue before building — it is a product decision, not an
implementation detail.

Two practical constraints when adding achievements or progression state:

- It must work in **demo mode**, which means the local store, with Supabase mirroring after.
- Existing users must not open the app to an empty trophy case. `endowCp()` is the precedent —
  it retroactively banks past work by replaying history through the live rules. New achievements
  should be similarly backfillable from existing state.

---

## Tests

`npm test` runs Vitest. Add tests for logic that decides something — scoring, gating, eligibility.

`tests/content-coverage.test.ts` is a **ratchet**: it asserts minimum question and flashcard counts
per category. Raise the minimums when you add content; never lower them to make a run pass.

---

## Content

All questions and flashcards live in `src/lib/content/` as typed pack files. Every fact must trace to
a cited source in `docs/content/facts/*.md`. If you are adding content rather than features, read
[`docs/content/expansion-roadmap.md`](docs/content/expansion-roadmap.md) first — there is a specific
pipeline for it.

---

## Questions

Open an issue, or ask on the PR. Better to ask before building something the architecture rules out.
