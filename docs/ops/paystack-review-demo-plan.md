# Paystack activation — demo recording plan

For the review of **K53 Mentor AI** (Paystack activation request #1912390).
Live site: https://k53-mentor-ai.vercel.app/

**Goal of the recording:** show the reviewer (a) what the product is, (b) that
it's a real, working SaaS, (c) the pricing, and (d) the full payment + refund
loop — the four things `reviews@paystack.com` asked for.

Keep it **4–6 minutes**, screen + voice (or captions). A Loom or an unlisted
YouTube link is fine. Record at 1080p so text is legible.

---

## Before you record
1. Run `scripts/seed-reviewer-account.sql` in the Supabase SQL editor to create
   the full-access reviewer logins (see that file). Confirm the verify query
   shows `premium_plus / active`.
2. Log in once yourself as `paystack.review@k53mentor.app` to confirm it works.
3. Have Paystack **test card** details ready for the checkout step:
   card `4084 0840 8408 4081`, any future expiry, CVV `408`, OTP `123456`,
   PIN `0000` (Paystack's standard test card).
4. Clear/!use an incognito window so the sign-in is shown cleanly.

---

## Script (say roughly this, in this order)

**0:00 — What it is (landing page)**
> "K53 Mentor AI is a South African K53 learner's and driver's licence prep
> app. Learners practise questions, flashcards and mock exams and get an AI
> tutor. It's a subscription SaaS." 
Show the landing page at the root URL, scroll through the feature sections.

**0:30 — Pricing (visit /pricing)**
> "Here's our pricing — three tiers, billed monthly or annually in Rand, split
> by vehicle class."
Point at: Free (R0), Premium (R60/mo car, R50/mo bike & heavy), Premium Plus
(R70/mo car, R60/mo bike & heavy), and the annual −R20/mo saving.

**1:00 — Sign in as the reviewer account**
> "I'll sign in with the test account I've shared with you."
Log in as `paystack.review@k53mentor.app`. Land on the dashboard.

**1:20 — Core product walkthrough (this proves it's a real service)**
Move briskly through:
- **Diagnostic** (`/diagnostic`) — the AI readiness assessment + score.
- **Study → Questions** (`/study/questions`) — answer 2–3, show explanations.
- **Study → Flashcards** (`/study/flashcards`) — flip a couple.
- **AI Tutor** (`/tutor`) — ask one real question, show the AI answer.
- **Study → Scenarios** (`/study/scenarios`) — one scenario.
- **Study → Mock exam** (`/study/mock-exam`) — start one, show the format.
- **Study → Signs / Controls** — quick glance so breadth is clear.
- **Licence prep** (`/licence-prep`) — the driver's yard-test modules (Premium
  Plus feature).
- **Progress** (`/dashboard/progress`) — analytics/history.

**3:30 — The payment flow (what Paystack most wants to see)**
> "Now the checkout. Upgrading opens Paystack's hosted payment page."
Go to `/pricing` or Account → Billing, pick a plan, and start checkout. Show:
- the Paystack payment modal/page opening,
- paying with the **test card** above,
- landing back on the success/receipt state,
- the plan now showing as active on **Account → Billing & plan**.

**4:30 — Cancellation & refund**
> "Customers can cancel themselves, any time, and a cancel within 7 days is an
> automatic full refund."
Show **Account → Billing & plan → Cancel plan**, and mention the policy page.
Open `/refunds` briefly.

**5:00 — Close**
> "Full refund & cancellation policy is at /refunds, terms at /terms. Happy to
> provide anything else."

---

## Links to give them (all already live)
- Site: https://k53-mentor-ai.vercel.app/
- Pricing: https://k53-mentor-ai.vercel.app/pricing
- Refund & cancellation policy: https://k53-mentor-ai.vercel.app/refunds
- Terms: https://k53-mentor-ai.vercel.app/terms

## Test login to give them
- Email: `paystack.review@k53mentor.app`
- Password: `K53Review-2026`
- (Second identical account `paystack.review2@k53mentor.app` if two reviewers
  want to log in at once.)

---

# Full word-for-word narration script

Written to be spoken naturally — short sentences, relaxed pace. Anything in
_(italics)_ is a stage direction, not something you say. Aim for ~5–6 minutes.

## Intro — what it is _(landing page, ~40s)_
_(Start on https://k53-mentor-ai.vercel.app/, scrolling slowly.)_

> "Hi, this is a quick walkthrough of K53 Mentor AI for the Paystack activation
> review. K53 Mentor is a South African study app for the K53 learner's licence
> and driver's licence tests. It's a subscription product — people pay a monthly
> or annual fee to practise exam questions, use flashcards, take mock exams, and
> get help from an AI tutor. Everything you'll see here is a live, working
> service — nothing is mocked up for this video."

_(Scroll through the feature sections on the landing page as you talk.)_

> "On the home page you can see the main features — the practice questions, the
> AI tutor, mock exams, and the progress tracking. Let me show you the pricing
> first, then I'll log in and go through the actual product."

## Pricing — what customers pay for _(/pricing, ~50s)_
_(Navigate to /pricing.)_

> "Here's our pricing. There are three tiers, and everything is priced in South
> African Rand. Customers can pay monthly or annually."

> "The Free tier is a one-time trial so people can see where they stand before
> paying. Then there are two paid plans. Premium is sixty Rand a month for the
> car licence, or fifty Rand a month for motorbike and heavy vehicles. Premium
> Plus is seventy Rand a month for car, sixty for motorbike and heavy — that one
> unlocks everything, including the driver's-licence modules."

> "If a customer pays annually instead of monthly, they save twenty Rand a
> month. So the pricing is straightforward and it's all shown upfront before
> anyone pays."

## Log in _(/login, ~20s)_
_(Go to /login. Sign in as paystack.review@k53mentor.app.)_

> "I'll log in now with the test account I've shared with you in the email —
> paystack dot review at k53mentor dot app. This account has full access so you
> can see every feature."

_(Land on the dashboard.)_

> "And here's the dashboard a paying customer sees after logging in."

## Core product — prove it's real _(~1m45s)_
_(Move through each, spending 10–15s on each. Actually interact.)_

**Diagnostic** _(/diagnostic)_
> "First, the AI diagnostic. When someone starts, the app assesses them and
> gives a readiness score, so they know how close they are to passing. Let me
> answer a couple of these."
_(Answer 2–3 questions, show the result/score.)_

**Questions** _(/study/questions)_
> "This is the core practice — real K53 exam questions. When I answer, it tells
> me if I'm right and explains why. That explanation is the actual product
> people are paying for."
_(Answer 2–3, show the explanation.)_

**Flashcards** _(/study/flashcards)_
> "Flashcards work the same way — question on the front, answer on the back, for
> quick revision."
_(Flip one or two.)_

**AI tutor** _(/tutor)_
> "This is the AI tutor. A customer can ask a question in plain English and get
> an explanation back. Let me ask a real one."
_(Type e.g. "What does a solid white line in the middle of the road mean?" Wait
for the answer, read a line aloud.)_
> "So that's a genuine AI response, generated live."

**Scenarios & mocks** _(/study/scenarios then /study/mock-exam)_
> "There are also driving scenarios, and full mock exams that mirror the real
> test format and pass mark."
_(Open a scenario, then start a mock exam and show the exam screen — no need to
finish it.)_

**Licence prep** _(/licence-prep)_
> "And on the top plan, there are driver's-licence modules that walk through the
> practical yard test."
_(Open one module briefly.)_

**Progress** _(/dashboard/progress)_
> "Everything a customer does is tracked here — their history, their readiness
> over time. So this is a real, ongoing service, not a one-off download."

## Payment flow — the part Paystack most wants to see _(~1m)_
_(Go to /pricing or Account -> Billing, choose a plan, start checkout.)_

> "Now the payment flow. When a customer upgrades, we hand them straight to
> Paystack's hosted checkout."

_(The Paystack TEST simulator appears — Success / Bank Authentication /
Declined. This is normal: in test mode Paystack shows this instead of the live
card form. The real card-entry form appears once the account is activated.)_

> "Because the account is still in test mode, Paystack shows this test simulator
> instead of the live card form — that's expected until the account is
> activated. I'll choose Success to complete the payment."

_(Select **Success**, then click **Pay ZAR 60**. Optionally choose **Bank
Authentication** instead to show a 3-D Secure / OTP-style step for extra
realism.)_

> "Paystack processes it, sends the customer back to us, we receive the webhook,
> and the account upgrades automatically."

_(Land on the success/receipt screen, then open Account -> Billing & plan.)_

> "And you can see the plan is now active here on the billing page. Once the
> account is live, this same step shows the real card-entry form to the customer
> — the flow behind it is identical."

## Cancellation & refunds — answer the liability question _(~40s)_
_(Stay on Account -> Billing & plan, show the Cancel option.)_

> "You also asked how we handle unhappy customers and refunds, so let me show
> that. A customer can cancel themselves, right here, any time — no email, no
> phone call, no waiting period. Cancelling stops all future billing
> immediately."

> "And if they cancel within seven days of their first payment, they get an
> automatic full refund — they don't even have to ask. For anything else — a
> double charge, a charge they don't recognise — they email us and we refund it
> in full. We aim to sort out any billing issue within seven business days,
> which keeps chargebacks down."

_(Open /refunds.)_

> "The full refund and cancellation policy is published here on the site, at
> slash refunds, and it's linked in the footer of every page."

## Close _(~15s)_
> "So that's the full picture — a live subscription study app, clear upfront
> pricing, a working Paystack checkout, and a published refund policy with
> self-service cancellation. Our terms are at slash terms and the refund policy
> at slash refunds. Happy to provide anything else you need to approve the
> account. Thanks very much."

## Delivery tips
- Record in one take if you can, but it's fine to stop and restart between
  sections — you can trim later.
- Talk to the reviewer, not the screen. The phrases "live," "real service,"
  "published policy," and "working checkout" do a lot of quiet reassurance.
- The checkout segment is the most important 60 seconds. The test simulator is
  expected — naming it ("still in test mode") shows you understand test vs live.
- To avoid showing AI tutor latency, ask the question off-camera first, then
  re-ask on camera.
