import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { cn, glassFloat } from "@/lib/utils";
import { ActionForm } from "@/components/admin/action-form";
import { acceptInvite } from "@/app/schools/actions";

export const metadata: Metadata = { title: "Join a school" };
export const dynamic = "force-dynamic";

/**
 * The emailed-link door.
 *
 * The token is never checked on render — only on submit, through
 * `accept_school_invite`, which compares its digest. That means this page
 * cannot tell a stranger whether a token is real, and there is deliberately no
 * school name shown here for the same reason: the invite's contents are not
 * public just because someone guessed a URL.
 */
export default async function JoinByToken({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="bg-app min-h-dvh">
      <div className="mx-auto max-w-md space-y-8 px-4 py-12 sm:px-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Join your school</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You were invited to a school workspace on K53 Mentor. Accept to get the diary on your
            phone.
          </p>
        </div>
        <Card className={cn(glassFloat, "space-y-5 p-6")}>
          <ActionForm action={acceptInvite} submitLabel="Accept invite" pendingLabel="Joining…">
            <input type="hidden" name="token" value={token} />
          </ActionForm>
        </Card>
      </div>
    </div>
  );
}
