import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { cn, glassFloat } from "@/lib/utils";
import { ActionForm, Field } from "@/components/admin/action-form";
import { acceptInvite } from "@/app/schools/actions";

export const metadata: Metadata = { title: "Join a school" };
export const dynamic = "force-dynamic";

/**
 * The short-code door. The link at `/schools/join/[token]` is the convenient
 * path; this is the one that works when someone read the code down the phone.
 */
export default function JoinByCode() {
  return (
    <div className="bg-app min-h-dvh">
      <div className="mx-auto max-w-md space-y-8 px-4 py-12 sm:px-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Join a school</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the 8-character code the school owner gave you.
          </p>
        </div>
        <Card className={cn(glassFloat, "space-y-5 p-6")}>
          <ActionForm action={acceptInvite} submitLabel="Join" pendingLabel="Joining…">
            <Field
              label="Invite code"
              name="code"
              placeholder="ABCD2345"
              required
              hint="Letters and numbers, no spaces. Codes expire after 14 days."
              className="[&_input]:font-mono [&_input]:text-base [&_input]:uppercase [&_input]:tracking-widest"
            />
          </ActionForm>
        </Card>
      </div>
    </div>
  );
}
