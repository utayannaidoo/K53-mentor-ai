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

New migrations continue from the highest number (next: `0031_…`) — never reuse a prefix again.
Check the folder, not this line: `0028_diagnostic_skip` reused `0028` (taken by
`0028_pending_refunds`) and was renamed to `0030_diagnostic_skip` before it was ever applied.

**Prod is not tracked by `supabase_migrations`.** Most files from `0025` on were applied
through the SQL editor, so the dashboard's migration list stops early. Before assuming a
migration is live, check its effect directly (column, index, constraint) in prod.

