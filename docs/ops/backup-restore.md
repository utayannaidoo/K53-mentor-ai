# Database backup and restore

Supabase's **Free** plan gives no point-in-time recovery and no restore path
worth relying on. Until the project is on Pro, the nightly job in
[`.github/workflows/backup.yml`](../../.github/workflows/backup.yml) *is* the
backup.

It restores to **last night**, not to last minute. That is a real limitation and
it is worth being clear-eyed about: a failure at 17:00 loses the day's work.
At current data volumes it is still the difference between a bad hour and
losing the business, and it costs nothing. Upgrading to Supabase Pro (~$25/mo)
is the actual fix; this is what carries you until then.

---

## What is backed up

| Schema | Why |
|---|---|
| `public` | Every table the app owns — 27 of them, including `subscriptions`, `profiles`, `streaks`, all progress and attempt history |
| `auth` | The accounts themselves. Without it a restore leaves a database full of progress rows belonging to users who no longer exist and cannot log in |

**Not** backed up, deliberately:

- `storage` — verified empty (0 buckets, 0 objects). The 439 sign images are
  served from `/public` in the repo, not from Supabase.
- Migrations — they live in `supabase/migrations/` in git, which is a better
  record than a dump of the applied-migrations table.
- Anything in Vercel, Paystack, Resend or PostHog. Those are separate systems
  with their own durability; Paystack in particular is the system of record for
  money, and `subscriptions` is a mirror of it.

---

## Setting it up

Two repository secrets, under **Settings → Secrets and variables → Actions**:

### `SUPABASE_DB_URL`

Supabase dashboard → **Connect** → **Session pooler**. Copy the URI and
substitute your database password.

```
postgresql://postgres.<ref>:<password>@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
```

Two things here bite people, and both produce the same unhelpful "could not
connect" no matter how correct the password is:

- **The username must carry the project ref** — `postgres.aghurpwdvupuglztemaa`,
  not a bare `postgres`. The pooler authenticates on it. Get this wrong and the
  error is `password authentication failed for user "postgres"`, which sends
  you off to check a password that was never the problem. This is the single
  most misleading failure in this setup, so the workflow now detects it and
  says so directly.
- **It must be the session pooler, port 5432.** Port 6543 is the *transaction*
  pooler. `pg_dump` needs session-level state that the transaction pooler does
  not keep, so it cannot use it. The workflow rewrites 6543 to 5432 for you —
  same host, unambiguous correction — but the username it cannot guess.
- **It must not be the direct `db.<ref>.supabase.co` host.** That resolves to
  IPv6 only, and GitHub's runners have no IPv6.

**Paste it exactly as the dashboard gives it.** Two things about that string
would otherwise break `pg_dump`, and the workflow handles both so you do not
have to remember either:

- The trailing `?pgbouncer=true` is a hint for ORM connection pools, not a
  libpq parameter, and `pg_dump` rejects the whole URI over it. The query
  string is dropped and `sslmode=require` re-added.
- **Your password does not need to be URI-safe.** Supabase-generated passwords
  routinely contain `@ : / [ ] #`, all of which are URI syntax — a real run
  failed trying to resolve a hostname that was partly the password. The
  password is split out and passed via `PGPASSWORD` instead, so any password
  works as-is. Do not reset your database password to work around this, and do
  not percent-encode it by hand; both would break it again.

### `SUPABASE_DB_PASSWORD` — optional, but set it

Just the database password on its own, with no URI around it. Supabase
dashboard → **Settings → Database**; reset it there if you do not have it,
which is safe — the app authenticates with API keys and never opens a Postgres
connection, so nothing breaks.

When this secret is present the password is used exactly as given and every
parsing and encoding question disappears. Without it the password is lifted out
of the URI and percent-decoded, which works but is one more thing that can be
subtly wrong — a password inside a URI is percent-encoded, and a workflow that
extracts it by hand has to remember to decode it. That exact omission caused a
failed run reported as `password authentication failed`, which is the least
helpful message it could have produced.

### `BACKUP_PASSPHRASE`

Any long random string. Store it in a **password manager** — not in this repo,
not in the Supabase dashboard, not in the same place as anything else in this
list. This passphrase is the single point of failure for the entire scheme: an
encrypted backup you cannot decrypt is not a backup.

### Then

Run the workflow once by hand (**Actions → backup → Run workflow**) rather than
waiting for the schedule. The verify step will tell you immediately if the
connection string is wrong or the role cannot read `auth`.

---

## Limits worth knowing

GitHub's free tier gives a private repo **500 MB of artifact storage** and
2,000 Actions minutes a month. Today's dump is roughly 1–2 MB encrypted, so 90
days of retention costs well under 200 MB and the job itself takes about two
minutes a night. Comfortable.

It stops being comfortable if the database grows an order of magnitude. The
failure mode is quiet — uploads start failing once storage is full — so if
`public` ever gets into the hundreds of megabytes, either drop
`retention-days`, or move the upload to Cloudflare R2 (10 GB free, and the DNS
is already there). Worth a glance whenever the content bank grows a lot.

---

## Restoring

### 1. Get the file

**Actions → backup →** the run you want **→ Artifacts →** `db-backup-<stamp>`.
Artifacts are kept 90 days.

### 2. Decrypt

```bash
gpg --batch --decrypt --passphrase '<BACKUP_PASSPHRASE>' \
  --output k53.sql.gz k53-<stamp>.sql.gz.gpg
gunzip k53.sql.gz
```

You now have plain SQL. It is readable — open it and look, especially the first
time, so you know what you are holding.

### 3. Restore

**Into a fresh Supabase project** (the usual disaster case). The dump keeps
ownership and grants, and the roles it references — `supabase_auth_admin`,
`anon`, `authenticated` — already exist in any Supabase project, so it applies
cleanly:

```bash
psql "<new-project-session-pooler-url>" --single-transaction --file=k53.sql
```

`--single-transaction` matters: without it a failure halfway leaves you with a
half-restored database, which is harder to reason about than a failed restore.

**Into plain Postgres** (no Supabase). The Supabase-specific roles do not exist,
so strip the metadata that references them:

```bash
psql "<url>" --single-transaction \
  -c "create role anon; create role authenticated; create role supabase_auth_admin;" \
  --file=k53.sql
```

Creating the roles is usually less painful than stripping ownership, because
RLS policies reference them by name and a policy that cannot resolve its role
is a security control that silently does not apply.

### 4. Repoint the app

Update in Vercel, then **redeploy** — server-side environment variables only
apply to a new deployment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 5. Check the things that are not in the dump

- **Auth settings** — SMTP (Resend), email templates, redirect URLs, rate
  limits. These are project configuration, not database rows; see
  [`supabase-auth-setup.md`](./supabase-auth-setup.md).
- **Google OAuth** credentials.
- **Paystack** — the webhook URL points at the site, not the database, so it
  needs nothing. But reconcile afterwards with `npm run paystack:check` and
  confirm active subscribers still resolve to their paid tier.

---

## Rehearse it

**Restore into a scratch Supabase project once, before you need to.** Not
because the commands above are wrong, but because the first restore is where
you discover the thing nobody wrote down — a missing role, a setting that lived
only in the dashboard, a passphrase saved somewhere you cannot reach without
the account you just lost.

An untested backup is a hypothesis. Half an hour now converts it into a fact.
