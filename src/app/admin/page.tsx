import { redirect } from "next/navigation";

/** Refunds are the admin area's only section; the layout has already gated it. */
export default function AdminIndex() {
  redirect("/admin/refunds");
}
