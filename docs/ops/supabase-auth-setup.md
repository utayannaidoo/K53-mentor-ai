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

- **Site URL** — the production origin, `https://k53mentorai.co.za`. Supabase falls back
  to this whenever a requested redirect isn't allowlisted, which is why a link can
  "work" but dump the user on the marketing page instead of the app. The templates in §3
  build their links from it, so a wrong value here silently mails out broken links.
- **Redirect URLs** — must include every origin the app runs on:
  ```
  https://k53mentorai.co.za/auth/callback
  https://*-<your-vercel-scope>.vercel.app/auth/callback   ← preview deployments
  http://localhost:3000/auth/callback
  ```
  The app builds `emailRedirectTo` from `window.location.origin`, so a preview
  deployment sends a preview link — it needs to be allowlisted or the link breaks.

  **`www.` is deliberately absent, and must stay absent.** The PKCE code
  verifier is a host-only cookie, so a sign-in begun on `www.` can only be
  finished on `www.` — allowlisting it would give the app two hosts, two cookie
  jars and two half-sessions. The middleware 308s every non-canonical host to
  `NEXT_PUBLIC_SITE_URL` instead (`src/lib/auth/canonical-host.ts`), so no flow
  ever starts anywhere but the apex domain. Adding a `www.` entry here would
  quietly re-enable the split.

  > **This is what "log in with Google sends me to the home page, then works on
  > the second try" was.** A learner landing on `www.k53mentorai.co.za` sent
  > Supabase a `www.` callback, Supabase refused it and fell back to the Site
  > URL — the marketing page on the apex host — carrying a `?code=` that nothing
  > there could spend. Trying again, now on the apex host, worked. Fixed in code
  > (Aug 2026) by the canonical-host redirect plus `strandedAuthRedirect`, which
  > forwards any auth params that do land on `/` to `/auth/callback` so a future
  > allowlist gap surfaces as a named error rather than silence.

## 3. Email template — use `token_hash`, not the default

The default **Confirm signup** template sends a PKCE `?code=`, which can only be
exchanged **in the browser that started the signup**. Someone who signs up on a laptop
and opens the email on their phone gets bounced with "couldn't finish that sign-in" —
the single most common false report of "verification is broken".

`token_hash` is verified server-side by `/auth/callback`, so the link works from any
device or mail client.

> ✅ **Applied on the live project, 10 Aug 2026**, and re-read after a fresh page load to
> confirm each one persisted. Kept below as the record of what is deployed.
>
> Supabase will not let a project on the built-in mailer edit these at all — the page
> shows "Set up custom SMTP to edit templates" and renders a read-only preview with no
> editor and no save button. The order is therefore **mail DNS → Resend → custom SMTP →
> these templates**; before custom SMTP exists, every confirmation email goes out as the
> default PKCE `?code=` link with the cross-device failure described above.

Dashboard → **Authentication → Emails → Templates**. Three of the four templates change;
the fourth must not. The dashboard slugs are `confirm-sign-up`, `magic-link-or-otp`,
`change-email-address` and `reset-password` — not the names shown in the UI.

**Confirm signup** — `type=email`, landing on `/continue`:

```html
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=%2Fcontinue">
  Confirm your email
</a>
```

**Magic Link** — same shape, `type=magiclink`:

```html
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink&next=%2Fcontinue">
  Sign in
</a>
```

**Change Email Address** — `type=email_change`, landing back on `/account` rather than
`/continue`: this one is always confirmed by someone already signed in and already
onboarded, so the post-auth router has nothing to decide.

```html
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email_change&next=%2Faccount">
  Confirm your new email address
</a>
```

Keep this template's other two lines: the `{{ .NewEmail }}` reference, which is the only
place the learner sees *which* address they are confirming, and the "if you didn't request
this change, you can safely ignore this email" line, which is the security notice for an
address takeover attempt.

**Reset Password** — **leave as `{{ .ConfirmationURL }}`.** That flow starts and finishes
in the same browser, and the recovery session the PKCE exchange produces is what
`/reset-password/update` expects. Converting it to `token_hash` breaks password reset.

Both `/continue` and `/account` pass `safeNextPath()` (single leading slash, not an auth
page), and `email`, `magiclink` and `email_change` are all in the `OTP_TYPES` allowlist in
`src/app/auth/callback/route.ts`. Changing a `type` or a `next` here without checking both
is how these links start failing silently.

Verify each one after saving: sign up with a throwaway address, open the mail **on a
different device**, and confirm you land on the app rather than `/login?error=…`.

## What the code already covers

| Situation | Handling |
|---|---|
| `?token_hash=…&type=…` | `verifyOtp` server-side — works cross-device |
| `?code=…` | PKCE exchange (same-browser flows: OAuth, password reset) |
| Verifier cookie missing | `/login?error=device` → "open it in the same browser" notice |
| Expired / already-used link | `/login?error=expired` → notice + resend |
| Request on `www.` or the deploy alias | 308 to the canonical origin before any auth work |
| Auth params bounced to the Site URL (`/?code=…`) | Forwarded to `/auth/callback?next=/continue` |
| Login refused: email unconfirmed | Inline notice with a **Send it again** button |

Every failure now names itself on the login screen instead of redirecting to a blank form.
