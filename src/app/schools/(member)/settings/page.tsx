import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, glass, glassSubtle, formatDate } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { currentSchool } from "@/lib/schools/auth";
import { DEMO_INSTRUCTORS, DEMO_SCHOOL } from "@/lib/schools/demo";
import { schoolTeam } from "@/lib/schools/members";
import { ActionForm, Field } from "@/components/admin/action-form";
import { inviteMember, revokeInvite, removeMember, linkPartnerCode } from "@/app/schools/actions";

export const metadata: Metadata = { title: "Settings" };

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  instructor: "Instructor",
  assistant: "Office",
};

export default async function SchoolSettings() {
  const school = (isSupabaseConfigured ? await currentSchool() : DEMO_SCHOOL)!;
  const isOwner = school.role === "owner";

  let viewerId: string | null = null;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    viewerId = user?.id ?? null;
  }

  const team = isSupabaseConfigured
    ? await schoolTeam(school.schoolId, viewerId)
    : {
        members: DEMO_INSTRUCTORS.map((i) => ({
          id: i.id,
          role: i.role,
          displayName: i.displayName,
          createdAt: new Date().toISOString(),
          isSelf: i.id === school.memberId,
        })),
        invites: [],
      };

  const overSeats = school.seatsUsed > school.seats;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your team, your plan, and your referral code.
        </p>
      </div>

      {/* ── Plan ───────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="font-display text-base font-semibold">Plan</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className={cn(glassSubtle, "p-4")}>
            <p className="text-2xs uppercase tracking-wide text-muted-foreground">Plan</p>
            <p className="mt-1 font-display text-2xl font-semibold capitalize">{school.plan}</p>
          </Card>
          <Card className={cn(glassSubtle, "p-4")}>
            <p className="text-2xs uppercase tracking-wide text-muted-foreground">Seats used</p>
            <p
              className={cn(
                "mt-1 font-display text-2xl font-semibold tabular-nums",
                overSeats && "text-danger",
              )}
            >
              {school.seatsUsed} / {school.seats}
            </p>
          </Card>
          <Card className={cn(glassSubtle, "p-4")}>
            <p className="text-2xs uppercase tracking-wide text-muted-foreground">
              {school.status === "trialing" ? "Trial ends" : "Status"}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">
              {school.status === "trialing" && school.trialEndsAt
                ? formatDate(school.trialEndsAt)
                : school.status}
            </p>
          </Card>
        </div>
        {overSeats ? (
          <Card className={cn(glassSubtle, "p-4 text-sm text-muted-foreground")}>
            You have more instructors than seats. Nobody has been removed and nothing has stopped
            working — you just can&apos;t invite anyone new until the plan covers them.
          </Card>
        ) : null}
      </div>

      {/* ── Team ───────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="font-display text-base font-semibold">Team</h2>
        <Card className={cn(glass, "divide-y divide-border/50")}>
          {team.members.map((member) => (
            <div key={member.id} className="flex flex-wrap items-center gap-3 p-4">
              <span className="min-w-0 flex-1 truncate font-medium">
                {member.displayName}
                {member.isSelf ? (
                  <span className="ml-2 text-2xs text-muted-foreground">you</span>
                ) : null}
              </span>
              <Badge variant={member.role === "owner" ? "default" : "outline"}>
                {ROLE_LABEL[member.role] ?? member.role}
              </Badge>
              {isOwner && !member.isSelf && member.role !== "owner" ? (
                <ActionForm
                  action={removeMember}
                  submitLabel="Remove"
                  variant="ghost"
                  className="space-y-0"
                  confirm="Remove this person? They lose access immediately. Their lessons stay on the diary as a record."
                >
                  <input type="hidden" name="id" value={member.id} />
                </ActionForm>
              ) : null}
            </div>
          ))}
        </Card>

        {isOwner ? (
          <Card className={cn(glass, "space-y-4 p-5")}>
            <div>
              <h3 className="font-display text-base font-semibold">Invite someone</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You get an 8-character code to send or read out. An email address is optional —
                the code works on its own.
              </p>
            </div>
            <ActionForm action={inviteMember} submitLabel="Create invite" pendingLabel="Creating…">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email (optional)" name="email" type="email" placeholder="instructor@example.com" />
                <div className="space-y-1.5">
                  <label htmlFor="invite-role" className="block text-sm font-medium">
                    Role
                  </label>
                  <select
                    id="invite-role"
                    name="role"
                    defaultValue="instructor"
                    className="flex h-10 w-full rounded-md border border-border/70 bg-background/60 px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60"
                  >
                    <option value="instructor">Instructor — teaches, uses a seat</option>
                    <option value="assistant">Office — admin only, no seat</option>
                  </select>
                </div>
              </div>
            </ActionForm>
          </Card>
        ) : null}

        {team.invites.length > 0 ? (
          <Card className={cn(glass, "divide-y divide-border/50")}>
            {team.invites.map((invite) => (
              <div key={invite.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <code className="font-mono text-sm font-semibold">{invite.shortCode}</code>
                  <p className="mt-0.5 text-2xs text-muted-foreground">
                    {ROLE_LABEL[invite.role] ?? invite.role}
                    {invite.email ? ` · ${invite.email}` : ""} · expires{" "}
                    {formatDate(invite.expiresAt)}
                  </p>
                </div>
                {isOwner ? (
                  <ActionForm
                    action={revokeInvite}
                    submitLabel="Cancel"
                    variant="ghost"
                    className="space-y-0"
                  >
                    <input type="hidden" name="id" value={invite.id} />
                  </ActionForm>
                ) : null}
              </div>
            ))}
          </Card>
        ) : null}
      </div>

      {/* ── Referral code ──────────────────────────────────────────────── */}
      {isOwner && school.partnerSchoolId === null ? (
        <div className="space-y-3">
          <h2 className="font-display text-base font-semibold">Referral code</h2>
          <Card className={cn(glass, "space-y-4 p-5")}>
            <p className="text-sm text-muted-foreground">
              If you already earn R20 a learner through the partner programme, link that code here
              and your earnings show up alongside your bill. The code has to belong to the same
              contact email you signed up with.
            </p>
            <ActionForm action={linkPartnerCode} submitLabel="Link code" pendingLabel="Linking…">
              <Field label="Partner code" name="code" placeholder="your-school-code" required />
            </ActionForm>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
