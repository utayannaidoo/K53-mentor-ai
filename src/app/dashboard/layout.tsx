import { AppScope } from "@/components/app/app-scope";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppScope>{children}</AppScope>;
}
