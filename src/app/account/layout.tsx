import { AppScope } from "@/components/app/app-scope";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AppScope>{children}</AppScope>;
}
