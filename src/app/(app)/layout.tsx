import { StudyStoreProvider } from "@/hooks/use-study-store";

/**
 * One study store for the whole app.
 *
 * It has to be exactly one, mounted above every route that reads it. Giving
 * each route its own provider looks equivalent and is not: a client navigation
 * unmounts the old subtree and mounts the new one, so the store is rebuilt from
 * localStorage mid-flow. State written moments earlier — the profile from
 * "Continue as demo guest", the answers from onboarding — is still sitting in
 * the 250ms save debounce at that point, so the fresh store reads an empty
 * cache and the learner is bounced back to /login having lost the step they
 * just completed.
 *
 * Marketing, guides and the legal pages sit outside this group and mount no
 * store at all, which is what keeps the question bank off them.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <StudyStoreProvider>{children}</StudyStoreProvider>;
}
