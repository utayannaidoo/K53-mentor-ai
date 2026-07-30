import { StudyStoreProvider } from "@/hooks/use-study-store";
import { AppShell } from "@/components/app/app-shell";

/**
 * The signed-in app: study state plus the chrome that reads it.
 *
 * The store used to live in the root layout, which meant every route — the
 * landing page, the guides, the pricing table, the login form — carried the
 * question bank the store transitively imports. It now mounts only on the
 * route trees that study, and this is the shared mount point for the five
 * that also want the app shell (dashboard, study, tutor, licence-prep,
 * account). Surfaces with their own chrome (onboarding, diagnostic, the auth
 * pages) mount StudyStoreProvider directly instead.
 */
export function AppScope({ children }: { children: React.ReactNode }) {
  return (
    <StudyStoreProvider>
      <AppShell>{children}</AppShell>
    </StudyStoreProvider>
  );
}
