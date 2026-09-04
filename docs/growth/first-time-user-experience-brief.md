# First-time user experience brief

**Date:** 4 September 2026
**Scope:** First visit from onboarding through the first useful study action

## The problem

The product asks a new learner to understand too many concepts before they have felt the value:
seven onboarding steps, a 15-question diagnostic, account creation, a guided study session, an
upgrade screen, and finally the Today dashboard. Each part is defensible on its own; together they
make the learner repeatedly feel as though they are still setting up.

The current journey also uses several names for closely related ideas — plan, missions, readiness,
diagnostic, guided session and free week — before the learner knows the basic loop. The first-time
experience should answer only three questions:

1. What should I do now?
2. Why is this the right thing for me?
3. Can I trust the numbers I see?

## What was observed

- Onboarding contains seven steps before the diagnostic decision.
- A signed-out learner who chooses “take me to my plan” is sent to signup, not the plan.
- Deferring the diagnostic works on the same browser, and the learner can return later and complete
  all 15 questions successfully.
- The deferral was stored only in local storage, so it could be forgotten on another device.
- A learner who skipped the diagnostic was shown an internal baseline as a real readiness
  percentage in the guided session and on parts of Progress/Study.
- Both diagnostic completers and skippers are routed through the guided session before Today.
- The guided session ends in an upgrade screen before the learner has freely explored the product.

The first three defects above the routing observation are addressed in the current implementation:
the skip choice is now durable per account, copy matches the signup destination, and unassessed
scores render as “Not assessed” or a dash rather than a model prior.

## Experience principle

**Give the learner one real win within 60 seconds, then ask for the next commitment.**

Personalisation should be earned progressively. Collect only what changes the next screen now;
collect the rest when the learner can see why it matters.

## Recommended first-time journey

### 1. Shorten initial setup to three decisions

Keep only:

- licence goal;
- vehicle code;
- test date, with “not booked” as an equal option.

Move confidence, worry categories, starting knowledge and study frequency into lightweight prompts
after the first study action or into Account. If worry categories materially improve the first
question set, ask one combined “What feels hardest?” prompt and remove the separate confidence and
knowledge screens.

Target: 30–60 seconds from landing CTA to the first question.

### 2. Present the diagnostic as a clear choice, not another gate

Rename it in user-facing copy to **“15-question starting check”**, with “diagnostic” as supporting
language. The decision screen should state:

- time: about five minutes;
- benefit: measures all seven categories and builds the starting score;
- reassurance: it cannot be failed;
- consequence of skipping: studying still works, but scores stay unmeasured until it is completed.

Primary action: **Start my 5-minute check**
Secondary action: **Study first — measure me later**

### 3. Branch after signup instead of giving everyone the same tour

**If the diagnostic was completed:** land on the results, then Today after account creation. The
results already explain the weakest areas and provide a strong next action; another guided lesson
repeats the activation work.

**If the diagnostic was skipped:** give one short, real practice interaction, then land on Today.
Do not show a readiness score. Keep the diagnostic as the prominent, dismissible next action.

**If the learner abandons midway:** offer Resume first, with Start over as the secondary action.
This already works and should be preserved.

### 4. Delay the first upgrade interruption

Remove the paywall from the mandatory guided path. A learner should see their plan and complete at
least one self-directed action before an upgrade screen takes over. Good first upgrade moments are:

- after the learner finishes the first daily plan;
- when they deliberately open a paid feature;
- when a real daily allowance is reached;
- after diagnostic results have demonstrated a specific benefit worth extending.

Keep paid features visible, but use soft locked states until one of those moments.

### 5. Make Today explain itself once

For the first visit only, the Today sheet should have one short orientation line:

> This is your daily route. Start with the first item; the plan adapts as you answer.

The main button should name the actual next action, for example **Start 8 road-sign questions**, not
the generic **Start today's plan**. After the first completion, normal compact copy can take over.

### 6. Keep every unknown visibly unknown

- No readiness or predicted-pass percentage before the starting check.
- No category percentage without evidence in that category.
- Use **Not assessed** for categories and **—** for compact figures.
- Self-reported worries may guide ordering, but must be labelled “You told us this feels difficult,”
  never presented as measured weakness.
- Zero remains appropriate for actual counts such as questions answered, points and streak days.

## Content and language system

Use one term for each concept:

| Concept | Preferred label |
|---|---|
| Daily adaptive work | Today's plan |
| Initial measurement | Starting check |
| Overall measured level | Readiness |
| Individual plan items | Tasks |
| Unmeasured category | Not assessed |

Avoid introducing “missions” during setup if the dashboard calls the same object a plan. Keep the
game language as a reward layer after the learner understands the study loop.

## Delivery order

### Phase 1 — trust and continuity

- Persist the deferred diagnostic choice per account.
- Remove baseline scores from all unassessed surfaces.
- Make skip and signup copy describe the true next screen.
- Branch the guided-session copy for diagnostic completers and skippers.

### Phase 2 — reduce time to value

- Collapse onboarding to three required decisions.
- Skip the guided session for diagnostic completers.
- Remove the mandatory guided-session paywall.
- Give Today a specific first action and one-line orientation.

### Phase 3 — progressive personalisation

- Ask worry/knowledge/frequency questions after the first success, one at a time.
- Let each answer visibly update the next task so the reason for asking is obvious.
- Test whether “starting check” improves starts and completions over “diagnostic.”

## Success measures

Measure the funnel by branch rather than averaging unlike journeys:

- onboarding start → first question shown;
- first question shown within 60 seconds;
- starting-check start and completion rate;
- skip → first real study action rate;
- signup → Today reached rate;
- first study action completed within the first session;
- day-1 and day-7 return rate;
- upgrade conversion after a value event versus during guided setup.

Guardrail metrics: signup completion, diagnostic completion, support messages about scores, and
early exits from any step. The redesign succeeds only if faster activation does not reduce the
quality of the learner's licence-code or test-date setup.

## Definition of done

A brand-new learner can take either path without contradiction:

- completing the starting check produces real readiness and category scores;
- skipping it reaches useful study without showing any invented score;
- the choice survives refresh, sign-in and another device;
- the learner can return from Today and complete the check later;
- completion replaces every unmeasured state with the real result;
- no mandatory upgrade interruption appears before the learner reaches Today.
