# Authenticated production verification — 6 September 2026

Target: `https://k53mentorai.co.za`. This is an additive verification record for
the 5 September site audit, not a claim that every release scenario was tested.

## Environment and safety boundary

An already-authenticated existing production test account was available in the
browser. No password was entered or revealed. The account identified itself as
`paystack.review@k53mentor.app`, with an active **Premium Plus** subscription.
No cancellation, refund, plan change, account deletion, password-reset request,
card update, checkout, upload, camera access, or sign-out was performed: those
would have changed the account or made the session unrecoverable without its
credentials.

## Verified in production

| Check | Result | Evidence |
|---|---|---|
| Authenticated route and account hydration | Pass | Navigating to `/login` resumed the signed-in session at `/dashboard`. Dashboard history, CP, streak, study plan and account profile loaded. |
| Persistence across reload | Pass | `/account` retained the signed-in profile, active Premium Plus label, Code 08 preference, CP and email-reminder state after reload. |
| Server-presented paid entitlement | Pass (Premium Plus only) | `/account/billing` rendered Premium Plus as the current plan, current-plan control disabled, renewal date 22 July 2027, and Plus feature list. |
| Paid feature gate — scanner | Pass (surface access only) | `/study/scan` rendered the camera/upload scanner surface rather than an upgrade gate. No image was supplied. |
| Paid feature gate and allowance — tutor | Pass (access/allowance only) | `/tutor` rendered the paid photo attachment affordance and displayed 35 of 35 messages before the probe. One request reduced this to 34 of 35. |
| Tutor conversation persistence | Pass | The submitted prompt, reply and 34-of-35 allowance remained after a full page reload. |

## Reproduced production failure

### P1 — four-way-stop tutor prompt receives unrelated guidance

1. With the Premium Plus production test account, open `/tutor`.
2. Select **“How do four-way stops work?”**.
3. Wait for the streamed answer.

Expected: four-way-stop/right-of-way guidance, or a clarification if the system
cannot answer reliably.

Actual: the request consumed one paid allowance and returned: “A fixed direction
is a memory aid, not a rule of physics — but under test nerves it is what stops
you missing a wheel. Walk it the same way every time you practise.”

The reply is not about intersections or four-way stops. It persisted after a
reload, so this is a real delivered response rather than a transient rendering
artifact. This reopens the 5 September audit's tutor-relevance P1 finding and
blocks a production-readiness pass for the AI tutor.

## Follow-up after production fix

The tutor-relevance fix was merged through PRs #89 and #90. The final production
deployment is `b1e5b319affe652d19c9987cd37b86b57477d59c`; its GitHub CI and Vercel
deployment both passed.

The exact production prompt was repeated in a fresh conversation after that
deployment. Navi answered: “At a four-way stop, vehicles proceed in the order
they arrived and stopped. If two stop at the same time, the vehicle on the right
has priority.” The allowance moved from 33 to 32 of 35. **The production
tutor-relevance regression now passes.**

The implementation now ignores conversational filler, matches topic words on
whole-word boundaries, and normalizes regular plurals (`stops` → `stop`). The
test suite includes the exact production quick prompt through the local tutor
reply path, as well as assertions excluding the previously selected yard-test
facts.

## Additional environment and server-boundary evidence

- The Vercel Preview environment contains encrypted values for Supabase,
  Paystack, all four active plan codes, Upstash Redis and the AI providers. No
  secret values were downloaded or printed.
- The PR #90 preview was reachable at its public Vercel URL and displayed the
  configured Supabase login form; it had no authenticated session.
- Unauthenticated `POST /api/checkout` probes on both production and that
  Preview returned `401 {"error":"Unauthorized"}`. Neither request reached a
  Paystack authorization page.
- A focused run of 14 auth/billing suites passed 125 tests, covering account
  hydration and tier failure-closed behavior, sign-out/analytics reset,
  checkout origin, Paystack ownership verification, webhook signatures and
  ledger idempotency, webhook lifecycle events, reconciliation, entitlement
  expiry, cancellation, pending refunds and the concurrent refund race.

## Follow-up live matrix — 7 September 2026

The main production account `support.k53mentor@gmail.com` was available in a
separate authenticated session. The UI identifies it as **Free**, with its
introductory week expired. No progress, preference, subscription or account
state was changed.

| Check | Result | Evidence |
|---|---|---|
| Free production entitlement — scanner | Pass | `/study/scan` rendered the Premium upgrade gate and did not expose camera/upload controls. |
| Free production entitlement — tutor | Pass | `/tutor` rendered the expired-free-week gate, preserved the learner's readiness, and did not expose the paid composer or image attachment. |
| Preview deployment health | Pass | PR #91 deployment `dpl_6qvqJbPqEsWrJzX2Ruw5JfX374sd` was `READY`; GitHub CI and the Vercel status check were successful. |
| Preview Google authentication | Fail / configuration blocker | Starting **Continue with Google** on the PR #91 Preview returned the browser to the authenticated production `/dashboard`; it did not establish a session on the Preview hostname. This is consistent with the Preview callback URL being absent from Supabase's allowed redirect URLs. |
| Preview Paystack mode | User-confirmed, not independently completed | The operator confirmed that Preview uses an `sk_test_` key. Vercel CLI exposed the expected variable names but returned empty values for both general and branch-scoped Preview pulls, so the secret prefix and four plan objects could not be independently queried without a Preview checkout session. No checkout was initialized. |
| Approved vision fixture | Ready, blocked by entitlement | The repository-owned stop-sign asset `public/signs/regulatory/regulatory-006-01.png` is non-sensitive and explicitly approved for upload. The only authenticated account available for this follow-up is Free, so the production UI correctly prevents the upload; Preview authentication must work before the fixture can exercise vision safely. |
| 320 px responsive probe | Tooling blocker | The in-app browser accepted a 320 px viewport override, but the document still reported a 645 px client width on all six core routes. No horizontal overflow appeared at that effective width, but this cannot certify the requested phone breakpoints. |

## Still unverified (not safe or possible with this one session)

- Successful authentication from credentials; password-reset email and token
  lifecycle; logout invalidation; analytics reset; account switching and
  cross-account isolation.
- Premium *production* entitlement behavior. Premium Plus and Free have now
  been observed; the middle tier still needs its own account.
- Vision recognition itself and provider-outage behavior. Testing needs an image
  and would transmit it to the AI provider.
- Checkout success/failure/abandonment, return-before-webhook, delayed or
  duplicate webhook, renewal, cancellation, refund, expiry and cross-account
  reference-reuse behavior. These require a dedicated preview deployment with
  Paystack test credentials and test accounts.
- Full keyboard, screen-reader, zoom, reduced-motion and responsive-device
  matrix; representative low-end-device performance/Core Web Vitals.

## What is needed to complete the remaining live matrix

### Authentication, logout and isolation

Provide two dedicated test accounts (one Free, one Premium) with access to their
test inboxes, or sign both accounts into separate browser profiles and hand off
those sessions. This is necessary to verify credential login, reset-email
delivery/token reuse, account switching and cross-account data isolation. The
Premium Plus review session must not be logged out without recoverable
credentials or inbox access. The separate main production account is Free, but
its production session does not transfer to a Vercel Preview hostname.

### Free and Premium entitlements

Use the two dedicated accounts above and grant paid state only through a
verified Paystack test webhook. Do not downgrade the existing production Plus
account to manufacture lower tiers: that would mutate a real subscription and
would not prove the normal purchase path.

### Vision recognition

The repository stop-sign fixture is now approved. Complete Preview
authentication (or provide a dedicated paid Preview session), then upload
`public/signs/regulatory/regulatory-006-01.png` and verify identification,
explanation, allowance decrement and the provider-unavailable message. A
camera-permission test still needs an interactive browser handoff at the
permission prompt.

### Paystack lifecycle

First add the exact Preview callback (prefer the stable branch alias) to
Supabase Auth's allowed redirect URLs, for example
`https://k53-mentor-ai-git-codex-auth-c73014-utayannaidoo-5493s-projects.vercel.app/auth/callback`,
then sign a dedicated test account into that Preview. Verify in Vercel or the
Paystack merchant dashboard that its four plan codes are test Plans; the
operator has confirmed the Preview secret uses the `sk_test_` prefix. Then use
Paystack test cards for success, failure and abandonment. Replay or delay signed
test webhook events from the Paystack test dashboard to cover duplicate delivery,
return-before-webhook, renewal, disable/cancel, refund and expiry. A second test
account is required for cross-account reference-reuse attempts. Each hosted
checkout confirmation is a financial-flow action even in test mode and requires
an explicit go-ahead at the final confirmation step.

### Accessibility and performance

Use a browser session with controllable 320/375/390/430/tablet/desktop
viewports, CPU/network throttling and a screen reader (NVDA on Windows is the
appropriate production pairing). Collect Lighthouse or equivalent lab traces
plus Vercel field Web Vitals; keyboard-test every interactive route in both
themes, at 200% zoom and with reduced motion. The current in-app browser exposes
the accessibility tree but not the full device/CPU/network/screen-reader control
needed to certify this matrix.

## Local gate results

The clean `worktrees/next-audit-batch` checkout passed on 6 September:

- `npm run typecheck`
- `npm run lint`
- `npm run test` — 114 files, 1,073 tests after the final tutor regression
- `npm run build`

The nested-worktree extra-lockfile warning appeared during lint/build as
expected. An initial sandboxed test/build invocation could not spawn a Windows
child process (`EPERM`); rerunning with normal local process permission passed,
so this was an audit-environment restriction, not an application failure.
