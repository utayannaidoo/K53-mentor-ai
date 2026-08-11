# AI cost model — what the tutor actually costs

Written 11 Aug 2026, before the first real invoice. The point of this document is
not the price list (which dates fast) but the **margin arithmetic**, which is the
part that decides whether the plan caps in `src/lib/billing/plans.ts` are priced
correctly.

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
| **Claude Haiku 4.5 — current fast tier** | 1.00 | 5.00 | **$3.25** | **R59** |
| Gemini 3.5 Flash-Lite | 0.30 | 2.50 | $1.23 | R22 |
| DeepSeek V4-Pro | 0.435 | 0.87 | $1.09 | R20 |
| GPT-5.6 Luna | 0.20 | 1.20 | $0.70 | R13 |
| DeepSeek V3.2 | 0.28 | 0.42 | $0.67 | R12 |
| **DeepSeek V4-Flash** | 0.14 | 0.28 | **$0.35** | **R6** |
| Gemini 2.5 Flash-Lite *(retires 16 Oct 2026)* | 0.10 | 0.40 | $0.30 | R5 |
| Llama 3.1 8B | 0.02 | — | ~$0.05 | ~R1 |

## The finding: the caps, not the model

Cost at each plan's **full daily allowance**, 30 days, against what that plan
actually earns:

| Plan | Cap | Msgs/month at cap | Haiku 4.5 | DeepSeek V4-Flash | Revenue |
|---|---|---|---|---|---|
| Free (7-day trial) | 2/day | 14 per signup | $0.05 (R0.82) | $0.005 (R0.09) | R0 |
| Premium | 15/day | 450 | **$1.46 — 44% of revenue** | $0.16 (4.7%) | R60 (~$3.33) |
| Premium Plus | 40/day | 1,200 | **$3.90 — 100% of revenue** | $0.42 (11%) | R70 (~$3.89) |

**A Premium Plus subscriber who uses their allowance costs their entire
subscription in tokens** — before Paystack's fee, before Supabase, before Vercel.
Premium is not far behind at 44%.

This is a pricing problem before it is a model problem. Three levers, and they
are not mutually exclusive:

1. **Lower the caps.** 40/day is generous for a study aid whose sessions are
   meant to be ten minutes. Nothing in the product needs it.
2. **Cheaper fast tier.** Almost all volume is fast-tier — the escalation
   threshold is 500 chars, so only genuinely long or explicitly confused
   questions reach the smart model.
3. **Accept it as a loss leader** on the assumption most subscribers use a
   fraction of their cap. Plausible, and unverified — instrument actual
   per-user message counts before betting on it.

Nobody will hit these ceilings on day one. The number that matters is *average*
usage, which is unknown until real traffic exists. Instrument first.

## If you switch the fast tier

`src/lib/ai/provider.ts` constructs the OpenAI client as
`new OpenAI({ apiKey })` with **no `baseURL`**. Every provider in the table below
Anthropic speaks the OpenAI wire format, so pointing the existing fallback path
at one is a one-line change plus an env var — the cascade, streaming, and the
local fallback all keep working untouched.

Three things to weigh that are not on the price list:

- **POPIA.** `/privacy` names each processor and relies on the s72
  contract-necessity ground for cross-border transfer. Adding a provider means
  updating that section, and a transfer to China is a different disclosure than
  one to the US or EU. This is real work, not a footnote — the policy was written
  to be specific, and a stale processor list is worse than a vague one.
- **Grounding drift.** K53 is South African road law; no model knows it well from
  pre-training. The app compensates by retrieving cited facts into the prompt —
  which means the question is not "does this model know K53" but "does it stay on
  the grounding it is given". Cheaper and smaller models drift more. Run the
  question bank past a candidate before switching; the content is right there.
- **DeepSeek announced a price rise** on 6 Aug 2026 with no published rates or
  date. The 9× advantage over Haiku may narrow.

`OPENAI_MODEL_FAST` still defaults to `gpt-4o-mini`, which is well behind the
current budget tier — worth updating whether or not the provider changes.

## Spend caps are a separate control, and still unset

None of the above bounds a runaway. `/api/tutor` and `/api/vision` are the cost
blast radius, and the Upstash per-IP and per-user limits are the only thing
between a scraper and the card. Hard caps in the **Anthropic** and **OpenAI**
dashboards are the backstop for when those limits are wrong, and they are
independent of which model is selected. Set them before driving traffic.

## Sources

Pricing checked 11 Aug 2026. Anthropic rates from the first-party model table;
competitor rates from published rate cards, which change without notice —
re-check before acting on the numbers rather than trusting this table's age.
