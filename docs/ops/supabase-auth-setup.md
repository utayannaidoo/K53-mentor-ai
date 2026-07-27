# Supabase auth setup — email confirmation that actually arrives (and works)

The app code handles every link shape Supabase can send (`src/app/auth/callback/route.ts`),
but three settings live in the Supabase dashboard and **no code change can substitute for
them**. If "email verification isn't working", check them in this order.

## 1. Custom SMTP — the usual culprit

Supabase's built-in email sender is a **testing-only** service: a few messages per hour
across the whole project, no deliverability guarantees, and it frequently lands in spam.
Once real people are signing up, most "I never got the email" reports are this limit
silently swallowing the message.

Dashboard → **Authentication → Emails → SMTP Settings** → enable custom SMTP (Resend,
Postmark, SendGrid, Amazon SES…), then raise the per-hour rate limit under
**Authentication → Rate Limits**.

Verify: **Authentication → Logs** shows whether the confirmation mail was actually sent
or dropped.

## 2. Site URL + redirect allowlist

Dashboard → **Authentication → URL Configuration**:

- **Site URL** — the production origin, e.g. `https://k53mentor.ai`. Supabase falls back
  to this whenever a requested redirect isn't allowlisted, which is why a link can
  "work" but dump the user on the marketing page instead of the app.
- **Redirect URLs** — must include every origin the app runs on:
  ```
  https://k53mentor.ai/auth/callback
  https://*-<your-vercel-scope>.vercel.app/auth/callback   ← preview deployments
  http://localhost:3000/auth/callback
  ```
  The app builds `emailRedirectTo` from `window.location.origin`, so a preview
  deployment sends a preview link — it needs to be allowlisted or the link breaks.

## 3. Email template — use `token_hash`, not the default

The default **Confirm signup** template sends a PKCE `?code=`, which can only be
exchanged **in the browser that started the signup**. Someone who signs up on a laptop
and opens the email on their phone gets bounced with "couldn't finish that sign-in" —
the single most common false report of "verification is broken".

Dashboard → **Authentication → Emails → Templates → Confirm signup**, replace
`{{ .ConfirmationURL }}` with:

```html
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=%2Fcontinue">
  Confirm your email
</a>
```

`token_hash` is verified server-side by `/auth/callback`, so the link works from any
device or mail client. Do the same for **Magic Link** (`type=magiclink`) and
**Change Email Address** (`type=email_change`).

Password reset (**Reset Password** template) keeps `{{ .ConfirmationURL }}`: that flow
starts and finishes in the same browser, and the recovery session it produces is what
`/reset-password/update` expects.

## What the code already covers

| Situation | Handling |
|---|---|
| `?token_hash=…&type=…` | `verifyOtp` server-side — works cross-device |
| `?code=…` | PKCE exchange (same-browser flows: OAuth, password reset) |
| Verifier cookie missing | `/login?error=device` → "open it in the same browser" notice |
| Expired / already-used link | `/login?error=expired` → notice + resend |
| Login refused: email unconfirmed | Inline notice with a **Send it again** button |

Every failure now names itself on the login screen instead of redirecting to a blank form.
