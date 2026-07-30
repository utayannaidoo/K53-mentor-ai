import { StudyStoreProvider } from "@/hooks/use-study-store";

/** Needs study state, but renders its own chrome rather than <AppShell>. */
export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <StudyStoreProvider>{children}</StudyStoreProvider>;
}
