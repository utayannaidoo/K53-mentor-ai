# Migrations

Apply in filename order (`supabase db push` or the SQL editor).

**Known quirk — two files share the `0004` prefix:** `0004_lock_subscriptions.sql` and
`0004_worry_categories.sql`. They are independent (one locks `subscriptions` RLS, the other
adds a profile column) and can run in either order. They are NOT renamed because renaming an
already-applied migration desyncs Supabase's migration history on live projects. New
migrations continue from the highest number (next: `0013_…`) — never reuse a prefix again.
