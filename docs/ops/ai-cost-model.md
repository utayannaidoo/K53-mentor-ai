# AI cost model — what the tutor actually costs

Written 11 Aug 2026, before the first real invoice. The point of this document is
not the price list (which dates fast) but the **margin arithmetic**, which is the
part that decides whether the plan caps in `src/lib/billing/plans.ts` are priced
correctly.

> **Acted on, same day.** The fast tier is now **DeepSeek V4-Flash** and the caps
> went back to **15/day Premium, 35/day Premium Plus**. The two decisions are one
> decision: the caps were cut to 10/20 because Haiku 4.5 made the old ceiling
> unaffordable, and a model at a ninth the price is what let them go back up.
> Anthropic stays in the cascade as the fallback, and as the *only* path for
> images. What follows is the reasoning; §"The switch" at the bottom records what
> shipped.

## The workload

One tutor message is roughly:

- **~2,000 input tokens** — the ~350-token persona, the grounding block
  (anchored item + retrieved related facts + a ≤900-char learner profile), and up
  to `MAX_TURNS = 10` turns of history.
- **~250 output tokens** — `TUTOR_MAX_TOKENS` caps at 350; real answers average
  lower.

Both numbers are estimates, and input is the one that moves: history dominates as
a conversation lengthens. Re-measure against real traffic before trusting any
figure below to more than one significant digit.

## Cost per 1,000 tutor messages

At 2 MTok input + 0.25 MTok output. Rand at ~R18/$.

| Model | $/MTok in | $/MTok out | Per 1,000 msgs | Rand |
|---|---|---|---|---|
| Claude Opus 5 | 5.00 | 25.00 | $16.25 | R293 |
| Claude Sonnet 5 (list) | 3.00 | 15.00 | $9.75 | R176 |
| Claude Sonnet 5 (intro, to 31 Aug 2026) | 2.00 | 10.00 | $6.50 | R117 |
| **Claude Haiku 4.5 — fallback fast tier** | 1.00 | 5.00 | **$3.25** | **R59** |
| Gemini 3.5 Flash-Lite | 0.30 | 2.50 | $1.23 | R22 |
| DeepSeek V4-Pro | 0.435 | 0.87 | $1.09 | R20 |
| GPT-5.6 Luna | 0.20 | 1.20 | $0.70 | R13 |
| DeepSeek V3.2 | 0.28 | 0.42 | $0.67 | R12 |
| **DeepSeek V4-Flash — current fast tier** | 0.14 | 0.28 | **$0.35** | **R6** |
| Gemini 2.5 Flash-Lite *(retires 16 Oct 2026)* | 0.10 | 0.40 | $0.30 | R5 |
| Llama 3.1 8B | 0.02 | — | ~$0.05 | ~R1 |

## The finding: the caps and the model are one decision

Cost at each plan's **full daily allowance**, 30 days, against what that plan
actually earns. The 15/40 column is what the caps were before 11 Aug 2026; the
15/35 column is what shipped.

| Plan | Old cap | On Haiku 4.5 | New cap | On V4-Flash | Revenue |
|---|---|---|---|---|---|
| Free (7-day trial) | 2/day | $0.05 (R0.82) per signup | 2/day | $0.005 (R0.09) | R0 |
| Premium | 15/day | **$1.46 — 44% of revenue** | 15/day | $0.16 — **4.7%** | R60 (~$3.33) |
| Premium Plus | 40/day | **$3.90 — 100% of revenue** | 35/day | $0.37 — **9.4%** | R70 (~$3.89) |

**A Premium Plus subscriber who used their old allowance cost their entire
subscription in tokens** — before Paystack's fee, before Supabase, before Vercel.
Premium was not far behind at 44%.

Three levers were available, and they are not mutually exclusive:

1. **Lower the caps.** Done first, as the immediate stop-loss: 10/20 for a few
   hours on 11 Aug.
2. **Cheaper fast tier.** Done second, and it is what actually fixed the problem.
   Almost all volume is fast-tier — the escalation threshold is 500 chars, so
   only genuinely long or explicitly confused questions reach the smart model.
3. **Accept it as a loss leader** on the assumption most subscribers use a
   fraction of their cap. Plausible, and unverified — instrument actual
   per-user message counts before betting on it.

With (2) in place, (1) reverses: 15/35 on V4-Flash costs less than 10/20 did on
Haiku, so the allowance the learner sees went *up* while the bill went down. That
is the whole trade, and it is why the two changes belong in one commit rather
than being argued separately.

### The exposure this creates

**The new caps are only affordable while DeepSeek is the one answering.** At
35/day on Haiku 4.5 — which is exactly what the cascade falls back to — Premium
Plus costs $3.41/month against $3.89 of revenue, 88%. A sustained DeepSeek outage
is therefore a *margin* incident, not just a latency one, and nothing in the code
notices. Before this matters in practice:

- The per-IP and per-user limits still cap the blast radius, so it is a bad week
  rather than a bad month.
- The honest fix is a spend alarm, not a code path. See the spend-cap section.
- If DeepSeek is down for more than a day, lower the caps by hand rather than
  waiting it out.

Nobody will hit these ceilings on day one either way. The number that matters is
*average* usage, which is unknown until real traffic exists. Instrument first.

## The switch — what shipped

DeepSeek was added to the front of the cascade in `src/lib/ai/provider.ts`. It
speaks the OpenAI wire format, so it is the same `OpenAI` client with a
`baseURL` of `https://api.deepseek.com`, and it shares every chat-completions
code path with the OpenAI branch — streaming, the coach one-shot, and the local
fallback all kept working untouched.

| Env | Default |
|---|---|
| `DEEPSEEK_API_KEY` | — (unset ⇒ the cascade behaves exactly as before) |
| `DEEPSEEK_MODEL_FAST` | `deepseek-v4-flash` |
| `DEEPSEEK_MODEL_SMART` | `deepseek-v4-pro` |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` |

The old `deepseek-chat` / `deepseek-reasoner` aliases were retired on 24 Jul 2026
— the `v4-` ids are the current ones and are the only names the API answers to.

Four things were not on the price list and each cost real work:

- **Images do not go to DeepSeek.** The public API is text-only. Sending an image
  part does not fail loudly — it answers from the surrounding text, which for the
  sign scanner means confidently describing a photo it never saw. Every image
  path now calls `chooseProvider("image")`, which skips text-only providers and
  resolves to `local` when none remain, so the route reports the scanner
  unavailable instead of answering blind. This overrides `TUTOR_PROVIDER` too: a
  text-only *preference* must not silently disable a paid feature. Four tests in
  `tests/tutor-cost-controls.test.ts` pin it.
  **Keep `ANTHROPIC_API_KEY` set** — it is now the scanner's only path.
- **POPIA.** `/privacy` names each processor and relies on the s72
  contract-necessity ground for cross-border transfer. Both the processor list
  and the cross-border section now name DeepSeek and China explicitly, say what
  is and is not sent, note that China has no data-protection regime South Africa
  treats as comparable, and point out that skipping the tutor avoids the transfer
  entirely. Updated 11 Aug 2026.
- **Grounding drift.** K53 is South African road law; no model knows it well from
  pre-training. The app compensates by retrieving cited facts into the prompt —
  which means the question is not "does this model know K53" but "does it stay on
  the grounding it is given". Cheaper and smaller models drift more.
  **`npm run tutor:eval -- --compare` exists for exactly this** (see below).
  `TUTOR_PROVIDER=anthropic` reverts in one env var if it reads badly.
- **DeepSeek announced a price rise** on 6 Aug 2026 with no published rates or
  date. The 9× advantage over Haiku may narrow — and the caps are priced against
  that advantage, so re-check before the next allowance change.

### Judging a candidate model — `npm run tutor:eval`

```bash
npm run tutor:eval -- --compare
```

Runs the **real** prompt pipeline — same persona, same `resolveContext`, same
`retrieveRelated`, same `streamTutorReply` the route uses — over a seeded sample
of the bank, and writes a markdown report to `.tutor-eval/` (gitignored) with
each answer printed directly beneath the grounding it was given. `--compare`
does DeepSeek and Anthropic on identical prompts so the two files diff.

It deliberately **does not score anything**. Faithfulness to grounding is a
judgement, and a script that emitted a number would be inventing confidence it
does not have. What it does is make the human read cheap and structured, and
flag the mechanically checkable failures (markdown headings, code blocks, a
reply truncated mid-sentence, an answer that appears to endorse a distractor).

Three blocks, and the second is the one that matters:

1. **Anchored** — an item is on screen, so the official explanation is in the
   prompt. The model has everything it needs; drift here is simple failure to
   use it.
2. **Free-form** — no item, so the only grounding is what retrieval scored, and
   sometimes that is nothing. Then the model is answering South African road law
   from pre-training, which is precisely what it does not have. Flagged
   explicitly in the report. **Read these first.**
3. **Persona probes** — off-topic requests, an RTMC-affiliation question, and a
   prompt-injection attempt. These hold regardless of grounding.

Costs about $0.02 a run on V4-Flash. Cheap enough to run on every provider or
model-default change, and worth doing before any of them reaches a learner.

One free win comes with the switch: DeepSeek's context caching is **automatic and
prefix-based**, with cache-hit input at $0.0028/MTok — a fiftieth of the
cache-miss rate. Nothing needs to be marked; what earns it is keeping the persona
and grounding prefix stable across turns, which the persona-first message order
already does. Anthropic, by contrast, needs an explicit `cache_control` marker
and a 4,096-token minimum the ~350-token persona does not reach.

`OPENAI_MODEL_FAST` still defaults to `gpt-4o-mini`, which is well behind the
current budget tier. It matters less now that OpenAI is the third fallback, but
it is still the model a photo reaches if Anthropic is down.

## Spend caps are a separate control, and still unset

None of the above bounds a runaway. `/api/tutor` and `/api/vision` are the cost
blast radius, and the Upstash per-IP and per-user limits are the only thing
between a scraper and the card. Hard caps in the **Anthropic** and **OpenAI**
dashboards are the backstop for when those limits are wrong, and they are
independent of which model is selected. Set them before driving traffic.

**DeepSeek is different and worse here: it has no monthly spend cap.** Billing is
a prepaid balance you top up, so the ceiling is whatever you last put in. That is
crude but it is also a genuine hard limit — treat the balance *as* the cap and
keep it small (a few dollars covers thousands of messages at V4-Flash rates).
Set the auto-recharge off, and check the balance when you check the other
dashboards. An empty balance degrades to the Anthropic fallback, which is the
right failure: expensive, not broken.

## Sources

Pricing checked 11 Aug 2026. Anthropic rates from the first-party model table;
competitor rates from published rate cards, which change without notice —
re-check before acting on the numbers rather than trusting this table's age.

DeepSeek model ids, the retirement of the `deepseek-chat` alias, the
`https://api.deepseek.com` base URL and the absence of image input were checked
against the DeepSeek API docs and its published rate card on 11 Aug 2026. The
text-only finding is the one worth re-verifying if the scanner ever needs to move
— DeepSeek has published multimodal research and third-party write-ups already
describe V4-Pro as image-capable, but the public API documents no image request
format, and "undocumented but maybe works" is not a basis for routing a paid
feature.
