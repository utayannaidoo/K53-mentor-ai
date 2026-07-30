import { AppScope } from "@/components/app/app-scope";

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return <AppScope>{children}</AppScope>;
}
