/**
 * /login and /signup live in their own route group so their bundle carries
 * none of the app's machinery. (app)'s layout mounts StudyStoreProvider +
 * ContentProvider — study planning, engagement scoring, the starter question
 * pack, Supabase sync (~170KB of First Load JS) — and none of it has a job on
 * a signed-out page that only needs to render a form and read one boolean.
 *
 * AuthForm brings its own tiny localStorage provider (auth-local-provider),
 * which is why this layout deliberately mounts nothing at all.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
