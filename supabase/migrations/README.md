# Migrations

Apply in filename order (`supabase db push` or the SQL editor).

**Known quirk — two files share the `0004` prefix:** `0004_lock_subscriptions.sql` and
`0004_worry_categories.sql`. They are independent (one locks `subscriptions` RLS, the other
adds a profile column) and can run in either order. They are NOT renamed because renaming an
already-applied migration desyncs Supabase's migration history on live projects.

This quirk has one practical consequence: the Supabase CLI refuses duplicate version numbers,
so `supabase db reset` / `db push` will not run against this folder until it is resolved. The
project is dashboard-managed (no `config.toml`), so the supported rebuild path is: create a
fresh project → apply every file in filename order via the SQL editor, 0004 twice in
alphabetical order (`lock_subscriptions`, then `worry_categories`). If you later adopt the CLI,
resolve the pair FIRST — merge both into one file and `supabase migration repair` the live
project to record the merged name as applied — never by renaming one of them alone.

New migrations continue from the highest number (next: `0027_…`) — never reuse a prefix again.

