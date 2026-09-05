# K53 Mentor AI — product, UX, QA and security audit

Audit date: 5 September 2026. Target: https://k53mentorai.co.za. Evidence: public production browsing, isolated local demo browsing, repository inspection, automated checks and focused executable probes. No application fixes, purchases, account deletion, credential attacks or production data mutations were performed.

## Executive summary

**Overall: 62/100. Verdict: NOT READY FOR PRODUCTION as a dependable, paid exam-preparation product.**

The principal release blocker is assessment integrity: resuming a paper can change the selected answer because the saved index is reapplied to a different option order. A second major trust problem is that a perfect diagnostic calculates 100% readiness alongside a pass probability formatted as “<1%.” These are more important than visual refinements. The public tutor preview also answers a four-way-stop question with amber-light advice.

The implementation has meaningful foundations: the inspected payment code resolves entitlements on the server; five protected production endpoints rejected anonymous requests; lint, typecheck, 1,032 tests and the production build passed. Those checks did not catch the assessment defects. This is not evidence of a confirmed payment breach, and this report does not claim one.

| Dimension | Score | Basis |
|---|---:|---|
| UI | 15/20 | Coherent visual language; oversized mobile blocks and weak empty-state hierarchy |
| UX | 11/20 | Clear assessment entry, but misleading feedback and friction for immediate practice |
| Features | 11/20 | Substantial content and working sampled flows; answer persistence and diagnostic interpretation fail |
| Performance | 7/10 | Successful static production build; substantial study-route JS and long animated landing page |
| Mobile | 6/10 | Sampled layouts fit; dashboard action and pricing are pushed below the first screen |
| Security | 7/10 | Positive server controls; configuration, quota and logout risks remain; production account isolation unverified |
| Conversion | 5/10 | Relevant offer, undermined by contradictory refund, pass and usage claims |
| **Total** | **62/100** | Expert assessment of inspected evidence, not a Lighthouse or certification score |

UI subscores: visual polish **7/10**; consistency **8/10**; mobile design **6/10**; desktop design **8/10**; navigation **7/10**; usability **6/10**; perceived trust **5/10**; overall UI **7/10**. Performance and security scores are provisional because field metrics and authenticated production checks were unavailable.

## Scope, evidence and limits

Labels used below: **LIVE** = observed on production; **LOCAL** = reproduced in the isolated demo; **SOURCE** = established from implementation or a local executable probe; **RISK** = conditional exposure, not a demonstrated exploit; **RECOMMENDATION** = proposed improvement.

Production coverage included the homepage and its interactive preview, navigation/menu/theme, pricing and annual toggle, onboarding, a complete 15-question diagnostic and results, signup/login/reset form presentation and empty validation, all nine guide pages, contact, privacy, terms, refunds and sources. Local coverage included demo entry, onboarding, dashboard, study navigation, a practice session/result and mock-paper selection/reload/resume. The remaining feature inventory below explicitly distinguishes discovery from successful end-to-end testing.

Homepage geometry was sampled at 320, 375, 390, 430, 768 and 1280px. Pricing was visually inspected at 320px; dashboard and mock were inspected at 375px. This is not a full cross-browser/device matrix. No physical mobile keyboard, iOS safe-area or assistive-technology certification was performed.

The user authorized an existing signed-in test account, but the accessible production tab remained on login. No usable authenticated production session was established. Later automatic approval review blocked additional browser access because the account reached its usage limit. Consequently production login completion, password email delivery, authenticated persistence, paid AI, checkout return, subscription cancellation/refund, account deletion and cross-user authorization remain **unverified**. This report is a substantial completed assessment of accessible evidence, not a claim that every control was clicked or every feature passed.

## Top 10 highest-impact problems

“Critical” in the requested section title is treated as ranking importance; not all ten are critical vulnerabilities.

| Rank | Problem and evidence | Severity / why it matters | Exact solution |
|---|---|---|---|
| 1 | Resumed mock answers change meaning. LOCAL + SOURCE; diagnostic shares the same unsafe restoration pattern. | **Critical functionality, P0.** Invalidates scoring and learner trust. | Persist stable option identities or the exact option permutation with a versioned paper; restore that permutation before answers. Reject incompatible old drafts clearly. |
| 2 | Perfect 15/15 diagnostic produces readiness 100 and pass probability 0, displayed as “<1%.” SOURCE probe. | **High, P0.** Contradictory decision support can demoralize or misdirect learners. | Stop presenting the short diagnostic as a calibrated real-world pass probability. Show baseline coverage/mastery and sample size; reserve prediction for validated evidence. |
| 3 | Homepage tutor responds to a four-way-stop question with amber-light advice. LIVE + SOURCE. | **High, P1.** A core differentiator gives irrelevant road-rule guidance. | Improve intent matching; require a relevance threshold; ask for clarification when uncertain. Label the preview as a sample explainer. |
| 4 | Learner diagnostic includes practical road-test engine-start penalty content. LIVE + SOURCE. | **High, P1.** Weakens relevance of assessment and recommendations. | Correct content scope metadata, filter assessment pools by exam purpose and add scope assertions. |
| 5 | Refund promise differs between first payment and most recent payment. LIVE + SOURCE. | **High, P1.** Buyers cannot reliably understand their entitlement. | Choose the intended policy, then use one shared policy source across pricing, contact, FAQ, refunds and cancellation handling. Current code supports a recent-payment window. |
| 6 | Results say “You felt fairly confident” although onboarding never asked. LIVE + SOURCE. | **High UX, P1.** Fabricated personalization is especially harmful to nervous retakers. | Represent unanswered confidence as null; omit comparisons unless explicitly answered. Offer optional previous-attempt and concern inputs. |
| 7 | Public copy reduces the pass requirement to “51 to pass.” LIVE + SOURCE. | **High content, P1.** Total alone does not describe the app’s own section-pass requirements. | State all three section thresholds together wherever the pass requirement is explained. |
| 8 | IP scan allowance is 20/day while Plus entitlement is 25/day. SOURCE; production exhaustion not attempted. | **High feature risk, P1.** A legitimate subscriber can hit an earlier limit than the advertised user allowance. Shared-IP tutor caps also conflict with multiple subscribers. | Make per-user quotas authoritative; use separately sized IP burst/abuse protection. Test two paying users behind one IP. |
| 9 | AARTO guide presents a fixed 1 September 2026 commencement date despite a superseded official schedule. LIVE + official-source review. | **High content trust, P1.** Time-sensitive legal guidance needs traceable current authority. | Reverify against the current proclamation; remove unsupported certainty, add an explicit reviewed date and official link. |
| 10 | First mobile dashboard screen emphasizes an empty readiness card and zero statistics before a study action. LOCAL, 375×812. | **Medium/high UX, P1.** A user choosing to study first still cannot immediately start. | Put a concrete “Start 12 questions” action first; compress unmeasured readiness and collapse empty statistics. |

## Reproducible bugs

### B1 — Answer identity changes after refresh

**Severity:** Critical functionality. **Page:** `/study/mock-exam`; diagnostic restoration affected in source.

1. In local demo, start a mock and note the answer texts and letters.
2. On the observed “Which sign is this?” paper, choose **B — Parking for people with disabilities**.
3. Refresh the page and select Resume on the unfinished-paper prompt.
4. Inspect the selected answer.

**Expected:** The same answer text remains selected. **Actual:** B remains selected but now reads **Temporary parking reservation**. Parking for people with disabilities moves to C. The timer resumes, so the flow looks successful while the answer changes.

**Cause:** `src/lib/study/exam-draft.ts` stores question IDs and numeric selections. `src/components/study/mock-exam.tsx` reconstructs questions from the canonical bank without retaining the original shuffle. `src/components/diagnostic/diagnostic-runner.tsx` follows the same pattern. The separate probe demonstrates a correct selection becoming incorrect after canonical restoration.

**Fix/acceptance:** Save immutable option IDs/permutations, preserve answer meaning through reload/back/resume, and assert unchanged final scoring in browser regression tests. Cover full mock, shorter modes and diagnostic; handle existing drafts safely.

### B2 — Perfect diagnostic reports effectively no chance of passing

**Severity:** High. **Page:** `/diagnostic/results`. **Evidence:** SOURCE calculation, not a completed perfect production browser run.

Run `node docs/audits/2026-09-05/probe.cjs`. It scores a correctly answered diagnostic and outputs `total:15, correct:15, readiness:100, passProbability:0`. The formatter renders zero as `<1%`.

**Expected:** Coherent feedback acknowledging excellent observed answers and limited predictive evidence. **Actual:** Readiness and apparent pass likelihood conflict radically. Shrinkage and multiplication across exam sections produce a number that should not be presented as a validated personal forecast.

**Fix:** Replace the probability display with evidence-aware language and coverage. If prediction is retained, calibrate and validate it using real outcomes and sufficient assessment data. Add product-level tests for plausible interpretation, not just arithmetic.

### B3 — Irrelevant homepage tutor response

**Severity:** High. **Page:** `/`, AI tutor preview.

Select the tutor preview, ask **“How do I safely approach a four-way stop?”**, and submit. Expected: relevant stop/intersection guidance or clarification. Actual: explanation of stopping at an amber light. Inspect `src/components/landing/product-preview.tsx` and `src/lib/ai/keyword-search.ts`; permissive keyword matching can select an unrelated bank explanation.

**Fix:** Match subject and intent, exclude distractor-driven matches, set a confidence threshold, and add tests for ambiguous road-rule queries. Do not animate irrelevant text as if a tutor reasoned about the question.

### B4 — Invented confidence comparison

**Severity:** High UX. **Page:** onboarding → diagnostic results.

Complete onboarding without a confidence question, then the diagnostic. Observed 5/15 result: 35% readiness, `<1%` probability, and “You felt fairly confident.” Expected: no claim about an unasked feeling. Actual: default confidence 3 is treated as an explicit answer.

**Fix:** Nullable confidence and conditional comparison; migrate old defaults as unknown where provenance is unavailable.

### B5 — Assessment includes a practical-test penalty

**Severity:** High educational relevance. **Page:** learner diagnostic.

Choose learner preparation/car; the sampled diagnostic included “On the road test, failing to start the engine first time costs:”. Randomization means it will not appear on every run. The probe identifies `qm_str_eng_penalty` with `scope: learners` in the starter bank.

**Expected:** Learner-theory diagnostic items. **Actual:** Practical-test scoring item. **Fix:** Correct classification and exclude practical scoring from learner assessment pools; audit adjacent pre-trip and non-exam content.

### B6 — Conflicting refund conditions

**Severity:** High purchase clarity. **Pages:** pricing, contact, refunds/FAQ.

Compare the pricing “first payment” promise with the “most recent payment” window on the policy/FAQ. The cancellation implementation and tests implement the recent-payment interpretation. Expected: one eligibility rule. Actual: materially different eligibility descriptions. Fix shared policy language and regression coverage of rendered purchase/policy copy.

## UI/UX findings, ranked

| Page / component | Problem | Severity and consequence | Exact recommended fix |
|---|---|---|---|
| Diagnostic results / assessment feedback | Unsupported confidence and contradictory prediction | High; harms interpretation and trust | Apply B2/B4; lead with observed performance, uncertainty and one next action |
| Dashboard / new-user readiness | Large empty card, repeated absence of readiness and zero statistics dominate mobile | Medium/high; delays first study action | Compact “Baseline not taken” row with optional assessment; primary practice action above it |
| Pricing / heading | At 320px the heading wraps over many lines and prices start below the first viewport | Medium; slow plan comparison | Use approximately 32–36px mobile title, shorter introduction and earlier plan prices |
| Study hub / “Free practice” and plan cards | Paid tools appear under free framing; limits are not always evident before clicking | Medium; surprise billing detours | Label paid destinations and daily quantities on cards; rename mixed section “Study tools” |
| Upgrade copy / unlimited language | Unlimited practice language conflicts with capped Premium practice and capped AI use | High commercial clarity | Use precise quantities and distinguish unlimited question access from limited daily actions |
| Homepage / long page and sticky demonstrations | Sampled mobile height about 13,804–15,539px; desktop 10,815px | Medium; considerable scrolling before repeated explanations resolve into action | Remove duplicate explanations; shorten mobile demonstrations; maintain a direct practice entry |
| Homepage / illustrative readiness panel | Personalized-looking sample numbers and a Start affordance can look functional | Medium; unclear demo boundary | Label “Example dashboard”; make the action a real link or remove interactive styling |
| Sources and guides / references | Authority names without actionable item-level official references | Medium; hard to verify a rule or report an error | Add exact document URLs, section/page references, reviewed date and question-ID correction link |
| Mock exam / selected option | Selection is visually evident but sampled accessible buttons do not expose selected state | High accessibility; nonvisual users cannot reliably confirm their choice | Use a labelled radiogroup with radio semantics and checked state, preserving keyboard behavior |
| Results / headings | Sampled diagnostic and practice-completion views lack a main h1 | Medium accessibility; weak page orientation | Add one descriptive h1; keep card headings beneath it |
| Dashboard calendar / day controls | Numeric days lack full contextual accessible date labels | Medium accessibility | Full day/month/year labels; identify today and selected date semantically |

The sampled glass/card/icon treatment is coherent enough that a redesign is not the priority. Concentrate on hierarchy and trustworthy state. Do not treat transparent-surface contrast as passing merely because palette-token tests pass: measure rendered combinations in both themes. No numerical WCAG contrast failure is claimed here without measurement.

## Four user journeys

| Persona | Journey and outcome | Friction / recommended change |
|---|---|---|
| A — First-time learner | Homepage → onboarding → 15-question assessment → baseline result; full breakdown invites signup | Purpose and entry are understandable. Explain upfront exactly what is available before signup, then give one study action after results. |
| B — Nervous retaker | Failure guide → assessment/results | Relevant entry content is undermined by assumed confidence and alarming probability. Ask optional prior-attempt context and use supportive, evidence-based feedback. |
| C — Wants practice immediately | Landing preview and study-first demo route → onboarding/dashboard → practice | The dominant assessment funnel and empty dashboard delay practice. Add a direct short practice session; request profile details when saving progress. |
| D — Considering Premium | Pricing → annual toggle → plan/signup entry; no real purchase | Annual totals were explicit: Premium R480/year (R40/month equivalent), Plus R600/year (R50/month equivalent). Refund and unlimited-use wording need reconciliation before checkout. Payment completion remains unverified. |

## Feature inventory and readiness

“Unverified” means no end-to-end success claim. Mobile judgments apply only to sampled views.

| Feature | Observed behavior / value / discoverability | Readiness and edge cases |
|---|---|---|
| Public navigation, menu, theme, footer | Sampled interactions/routes worked; major destinations discoverable | Sampled pass; not every link in every state tested |
| Homepage practice/flashcard previews | Answer feedback and card flip worked; demonstrates learning format | Useful sample; distinguish sample from saved study |
| Homepage tutor | Clear interaction but irrelevant answer reproduced | Fail B3 |
| Onboarding | Goal, code and scheduling/study preference flows usable | Fix default confidence and retaker context |
| Diagnostic | Full production attempt completed; results rendered | Fail interpretation/content; resume source defect |
| Practice questions and explanations | Local session and result completed; answer feedback available | Useful; full bank correctness not certified |
| Mock exam/navigation/timer | Start/select/reload/resume exercised at mobile width | Fail B1; final full-paper completion/restart not certified |
| Randomization and drafts | Options shuffle, unfinished-paper prompt works | Answer identity not retained |
| Progress/readiness/weak areas | Dashboard/results inspected; actionable intent apparent | Diagnostic interpretation invalid; cross-device synchronization unverified |
| XP/CP and streaks | Counters visible in local study flow | Multi-session/day-boundary/idempotency not fully exercised |
| Study flashcard deck/spaced repetition | Feature discovered; homepage flip tested | Full deck ratings, keyboard flow and due scheduling unverified |
| Road signs, rules, controls | Routes/content discovered; bank count verified | Dedicated searches, filters and detailed module flows not fully exercised |
| Scenarios | Content inventory exists; paid navigation discovered | Full scenario sequence and scoring unverified |
| Authenticated AI tutor/coach | Provider fallback and server controls inspected | Real provider quality, streaming, outages and paid quotas unverified live |
| Scanner/vision | Paid capability and limits inspected | Upload/camera/recognition end-to-end unverified; quota conflict in source |
| Practical licence prep and eye checks | Features discovered in app | End-to-end accuracy and mobile interaction unverified |
| Signup/login/password reset | Form presentation and empty validation inspected | Successful auth, email delivery, reset-token lifecycle unverified |
| Logout/account settings | Source review and feature discovery | Production invalidation, preference persistence and deletion unverified |
| Billing/upgrade/cancellation/refunds | Public pricing exercised; server implementation/tests reviewed | Actual transaction and lifecycle unverified; copy inconsistency confirmed |
| Referrals/notifications | Protected endpoint behavior/source scope sampled | Reward attribution, delivery and abuse scenarios unverified |
| Guides/legal/contact/sources | Public pages visited | Update legal timing and source traceability; contact delivery not tested |

The bank contains **1,296 questions, 974 flashcards and 68 scenarios** according to the repository statistics script. This establishes inventory, not correctness or absence of duplicates. Derived sign questions are part of that total; do not equate total count with unique concepts mastered.

## Mobile and accessibility

No horizontal overflow was measured in the six homepage widths sampled, or the narrow pricing sample. This does not establish that every modal, study route or language string fits. The strongest observed mobile problems are vertical priority, heading scale and dense navigation, rather than broken horizontal layout.

At 375px the six-item bottom navigation fits but is dense. Verify real touch target bounds and safe-area padding before release; do not reduce label legibility to fit more destinations. Quiz answer cards fit the sampled viewport, but selected-state semantics need correction.

Accessibility priorities: radio semantics for answers; main headings on completion views; full calendar date names; then keyboard-only journeys through menus, dialogs, cards and quiz completion. Validate focus restoration and announce result/error changes. Existing reduced-motion CSS is positive, but the demo tutor’s typewriter behavior also needs to respect reduced motion rather than only data-saver preferences. Screen-reader, zoom and real-device keyboard checks remain open.

## Performance

**Verified:** lint and typecheck passed; **109 test suites / 1,032 tests passed**; production build passed and generated 69 static pages. Installed build version: Next.js 15.5.22. No app console errors were observed in the sampled production diagnostic/auth inspections; this is not a whole-site console certification.

Local build First Load JS: homepage **145kB**, pricing **124kB**, login/signup **125kB**, dashboard **239kB**, diagnostic **267kB**, practice **279kB**, mock **280kB**, flashcards **276kB**, tutor **271kB**, account **278kB**; shared JS **102kB**. These are build estimates, not measured network transfer or mobile execution times.

No valid field/Lighthouse LCP, INP or CLS figures were collected. Initial HTML was roughly 178k characters in one production response; this is not compressed transfer size. Do not present page-height or bundle measurements as Core Web Vitals.

**Quick wins:** shorten repeated landing sections and mobile scroll holds; skip nonessential typewriter effects for reduced-motion/data-saver users; lazy-load below-fold interactive demos; audit study-route imports for code only needed after a feature opens.

**Deeper optimization:** profile a production build on a representative low-end mobile device and slow network, then split the largest shared study-client dependencies. Measure hydration and route-change cost before changing state architecture. Add field Web Vitals with route/device segmentation and privacy-aware sampling. Investigate duplicate requests and database latency with authenticated traces; neither is demonstrated as a current defect by this audit.

## Security findings

### Critical

**No critical security vulnerability confirmed.** B1 is a critical functional issue, not evidence of unauthorized data access or payment compromise.

### High

**RISK — Distributed AI cost limits weaken during Redis outage.** Text tutor/coach limiters can fall back to process-local memory, so multiple instances do not share one budget. Vision instead fails closed. Location: `src/lib/ai/rate-limit.ts`. Keep a bounded circuit-breaker budget or use the rule-based fallback when shared paid-model accounting is unavailable. Test outage behavior across multiple instances. No production outage or overspend was induced.

**RISK — Conditional CAPTCHA deployment incompatibility.** The live CSP and `next.config.mjs` do not permit the Cloudflare Turnstile script/frame origin, while captcha code loads it when enabled. Allow the precise vendor script/frame/connect origins and test an enabled configuration. The widget was absent in the inspected production form; this is **not a confirmed live login outage**.

### Medium

**SOURCE / RISK — Analytics identity survives application logout.** `src/lib/analytics.ts` identifies users; `src/hooks/use-study-store.tsx` resets local study/auth state without a corresponding analytics reset. Shared-device events may be attributed to the previous user. Add analytics reset at logout and test account switching. No actual third-party data exposure was inspected.

**SOURCE / RISK — Logout errors are swallowed.** A failed Supabase sign-out can be masked by resetting the client UI. Confirm session invalidation and provide a recoverable failure state. This is not a demonstrated reusable production session.

**SOURCE — User quotas conflict with IP limits.** Besides the commercial issue in the top ten, shared-IP constraints can deny legitimate subscribers. Preserve abuse controls while reconciling them with per-user allowances.

### Low / best practice

The live CSP contains `unsafe-inline` for scripts. Move toward nonces/hashes with a compatibility test; no XSS execution was demonstrated. Add deployment checks for required billing/limiter configuration and prohibit unintended test-key overrides in production. These are hardening recommendations, not proof that the live deployment uses test billing.

### Controls that were actually checked

- Live responses included CSP, HSTS, `nosniff`, `X-Frame-Options: DENY`, a restrictive referrer policy and Permissions-Policy. CSP also uses `frame-ancestors 'none'` and `object-src 'none'`.
- Anonymous GETs to `/api/billing/status`, `/api/content/pack?probe=1`, `/api/referral`, `/api/cron/reconcile-payments` and `/api/cron/notifications` returned **401 Unauthorized**.
- Inspected billing resolves subscription entitlements server-side and selects server-controlled plan codes. Signed webhook verification, verified callback ownership/payment checks and reconciliation logic exist. A client-side gate is not treated as the money boundary.
- Repository migrations implement user-scoped RLS and restrict subscription writes. Applied production migrations and cross-account isolation were not verified.
- No service-role secret exposure was established. Public Supabase configuration alone is not a secret leak. Public-page permissive CORS alone is not proof of authenticated data exposure.

No confirmed finding is made for SQL injection, command injection, SSRF, path traversal, cross-user IDOR, reset-token takeover, cookie leakage or payment spoofing. These require additional evidence; absence of a finding is not a penetration-test pass.

## Premium and payments

The inspected architecture is materially stronger than a localStorage-only subscription gate. Production prices and entitlements are server-controlled; demo behavior should not be confused with a production bypass. No successful entitlement spoof, forged payment or unauthorized paid-content access was demonstrated.

Release checks still needed: controlled Paystack test-environment success/failure/abandonment, duplicate and delayed webhook delivery, return-before-webhook behavior, renewal, cancellation, refund eligibility, expiry, cross-account reference reuse and receipt consistency. Perform these in an approved test setup, without real charges. Reconcile the refund promise and quotas before directing more users into checkout.

## Content and conversion

The learner/practical scope defect warrants a focused editorial pass through assessment pools. Existing typed content and fact files are useful foundations; the public experience needs specific references users can follow. Add a correction action containing the item ID and selected explanation, without requiring the learner to reconstruct the question in an email.

The AARTO date should be checked against official notices rather than replaced with another unverified date. The government records a [withdrawal of the earlier commencement proclamation](https://www.gov.za/documents/notices/administrative-adjudication-road-traffic-offences-act-commencement-withdrawal), and its [November 2025 deferral announcement](https://www.gov.za/news/media-statements/transport-defers-aarto-act-1-july-2026-10-nov-2025) describes a revised schedule. The app should link the operative authority and show its review date.

The hero communicates the audience and goal promptly. The weakest conversion points are later: unreliable diagnostic interpretation, a sample tutor that misses the question, long repeated explanation, unexpected paid gates and inconsistent policy promises. Fix these before adding urgency, testimonials or additional acquisition spend. No conversion uplift percentage is claimed without an experiment.

Test a direct “Practise 10 questions” entry against the current assessment-first entry. Measure completion and subsequent return, not just CTA clicks. On the result screen, offer a specific weak-area action and explain the limited evidence. On pricing, show exact usage allowances and renewal/refund conditions next to the decision.

## Product decisions and opportunities

**Improve:** assessment integrity, question relevance, feedback, targeted review and transparent subscription limits.

**Remove or suspend:** the unvalidated pass-probability claim, invented confidence comparisons and misleading unlimited-use wording. Remove decorative Start affordances that do not navigate.

**Simplify:** new-user dashboard; mobile pricing introduction; repeated landing explanations; the route from visitor to first useful practice session.

**Add:** contextual question-error reporting; stable review of missed questions; clear exam-section mastery with evidence counts; explicit last-reviewed source metadata. Before creating another study mode, validate whether existing targeted review and spaced repetition help learners resolve repeated mistakes.

## Implementation backlog

Complexity is relative engineering scope, not a time estimate. Each task includes a concrete acceptance outcome.

### P0 — Fix immediately

| Task | Location | Why | Recommended change / acceptance | Complexity | Impact |
|---|---|---|---|---|---|
| Preserve answer identity | `src/lib/study/exam-draft.ts`; mock and diagnostic runners | Resuming changes selections/grades | Versioned option identities/permutation; reload preserves text and final score; safely handle old drafts | Medium | High |
| Replace diagnostic probability presentation | Diagnostic scoring and results | Perfect performance produces `<1%` | Show observed mastery/coverage and uncertainty; remove forecast until calibrated; test perfect/mixed/low evidence cases | Medium | High |

### P1 — Fix before next major launch

| Task | Location | Why | Recommended change / acceptance | Complexity | Impact |
|---|---|---|---|---|---|
| Correct tutor preview relevance | `product-preview.tsx`; `keyword-search.ts` | Irrelevant road guidance | Subject-aware retrieval, threshold and clarification; four-way-stop regression | Medium | High |
| Separate learner/practical assessment pools | Content metadata, starter bank, diagnostic sampling | Wrong assessment scope | Correct engine-start item and audit related entries; scope assertions for sampled exams | Medium | High |
| Unify refund eligibility | Pricing/contact/FAQ/refunds; `subscription-cancel.ts` | Contradictory purchase promise | One reviewed policy and shared text matching server behavior | Low | High |
| Remove assumed confidence | Onboarding defaults/results contrast | Fabricated personalization | Nullable unanswered data; optional prior-attempt context; no comparison without input | Low | High |
| Correct pass-condition copy | Landing features/how-it-works | Total alone misleads | Shared section thresholds: controls 6/8, signs 23/28, rules 22/28, consistent with current exam scoring | Low | High |
| Align quotas and marketing | `rate-limit.ts`; entitlements; upgrade copy | Paid users hit earlier limits | User daily quota plus independent IP abuse guard; two-user same-IP tests; precise quantity labels | Medium | High |
| Reverify AARTO guide | Guide content and index | Unsupported date certainty | Current official citation, reviewed date and editorial ownership | Low | High |
| Put practice first on empty dashboard | Dashboard/readiness card | Main action below mobile fold | Primary short-session action visible at 375×812; compact unmeasured state | Medium | High |
| Expose answer selection accessibly | Mock/diagnostic answer controls | Visual-only selected state | Radiogroup/checked semantics, keyboard behavior and focus regression | Medium | High |
| Make Turnstile configuration coherent | `next.config.mjs`; captcha | Enabled widget blocked by CSP | Exact vendor origins and enabled-config browser check | Low | High |
| Bound AI calls during shared-limiter failure | `rate-limit.ts` and provider boundary | Per-process fallback loses global budget | Circuit breaker or local tutor fallback; multi-instance outage test | Medium | High |
| Reset identity and verify logout | Analytics and study-store signOut | Shared-device attribution/session risk | Reset analytics, handle auth failure visibly; account-switch integration check | Medium | High |
| Complete authenticated release verification | Production-like test account/environment | Important flows remain unverified | Auth, hydration, isolation, paid AI, payment lifecycle, reset and logout checks with recorded outcomes | High | High |

### P2 — Improve soon

| Task | Location | Why | Recommended change / acceptance | Complexity | Impact |
|---|---|---|---|---|---|
| Compact narrow pricing | Pricing heading/cards | Price discovery delayed | Short mobile intro and earlier prices at 320/375px | Low | Medium |
| Shorten landing journey | Landing preview/how-it-works | Excessive scrolling and repeat copy | Remove duplication and mobile scroll holds; preserve direct CTA | Medium | Medium |
| Clarify free/paid destinations | Study hub/dashboard plan cards | Surprise billing routes | Visible locks and exact allowance labels before click | Low | Medium |
| Add source/correction links | Sources, guides, question explanation | Learners cannot verify/report precisely | Document/page references, review date, question-ID feedback link | Medium | High |
| Repair headings/date semantics | Results and dashboard calendar | Poor nonvisual orientation | One main heading and full date accessible labels | Low | Medium |
| Finish motion/focus/accessibility verification | Shared components and tutor preview | Partial accessibility evidence | Respect reduced motion; keyboard/reader/zoom/device matrix | Medium | Medium |
| Measure and reduce client cost | Study route imports, landing demos | 239–280kB first-load study estimates | Profile production on low-end mobile; lazy-load optional tools; compare before/after field metrics | Medium | Medium |
| Harden CSP | `next.config.mjs` and script integration | Reduce inline-script exposure | Nonce/hash strategy with auth, analytics and captcha compatibility tests | Medium | Medium |

### P3 — Future improvements

| Task | Location | Why | Recommended change / acceptance | Complexity | Impact |
|---|---|---|---|---|---|
| Validate readiness against outcomes | Assessment analytics/research | Predictions need calibration | Consented outcome study; calibrated model and uncertainty, or retain mastery-only reporting | High | High |
| Experiment with immediate practice | Homepage → short session → save | Reduce first-value friction | Compare completed practice and return rate against current funnel | Medium | Medium |
| Strengthen missed-concept review | Existing review/spaced-repetition flow | Improve learning rather than feature count | Prioritize repeated errors and verify later recall; avoid duplicate study modes | Medium | High |

## Quick wins and major improvements

Quick wins: remove unsupported probability/confidence claims; correct pass and refund copy; clarify free/paid limits; update legal citations; reduce pricing title scale; add main headings/date labels. Validate each change in context—copy edits must match the intended product policy.

Major improvements: stable assessment persistence, content-scope quality gates, tutor relevance, accessible quiz controls, outage-safe cost accounting and a complete authenticated/payment test matrix. Existing unit-test success should be supplemented with a small number of high-value browser regressions covering answer meaning and final score through refresh.

## Production readiness decision

**NOT READY FOR PRODUCTION.** This means the inspected product should not be represented as a dependable finished exam-preparation service until P0 assessment defects are resolved. It is not a recommendation to infer an unseen payment breach or erase the existing deployment. Fix the answer persistence and diagnostic interpretation first, complete the remaining authenticated checks, then reassess. A polished visual shell and a passing build do not compensate for a paper whose selected answers change on resume.

### Evidence artifact

`probe.cjs` alongside this report reproduces the perfect-diagnostic calculation, index-only restoration failure and mis-scoped starter item without network access. Browser observations are documented above; screenshots were inspected during the audit but no saved screenshot archive is attached. The audit does not alter application behavior.
