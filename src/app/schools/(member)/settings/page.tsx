import type { Metadata } from "next";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, glass, glassSubtle, formatDate } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { currentSchool, type SchoolContext } from "@/lib/schools/auth";
import { SCHOOL_ANNUAL_MONTHS_CHARGED, SCHOOL_PLANS, SCHOOL_PLAN_MAP, type SchoolPlanId } from "@/lib/billing/school-plans";
import { isSchoolBillingConfigured, schoolChargeCents, schoolPlanFromCode } from "@/lib/billing/school-billing";
import { SchoolBillingActions, SchoolBillingReturn, SchoolPlanPicker } from "@/components/schools/plan-picker";
import { DEMO_INSTRUCTORS, DEMO_SCHOOL } from "@/lib/schools/demo";
import { schoolTeam } from "@/lib/schools/members";
import { ActionForm, Field } from "@/components/admin/action-form";
import {
  inviteMember,
  revokeInvite,
  removeMember,
  linkPartnerCode,
  transferOwnership,
  setCommissionMode,
  closeSchool,
} from "@/app/schools/actions";
import { CloseSchoolForm } from "@/components/schools/close-school-form";
import { EXPORT_KINDS } from "@/lib/schools/export";
import { createAdminClient } from "@/lib/supabase/admin";
import { schoolStatementById } from "@/lib/partners/statement";
import { schoolCreditLedger } from "@/lib/billing/school-credit";
import { formatRand } from "@/lib/schools/money";

export const metadata: Metadata = { title: "Settings" };

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  instructor: "Instructor",
  assistant: "Office",
};

/** The third plan tile: the one date or state an owner needs to know about. */
function planStanding(school: SchoolContext): { label: string; value: string; alert?: boolean } {
  if (school.status === "trialing") {
    return school.access === "full" && school.trialEndsAt
      ? { label: "Trial ends", value: formatDate(school.trialEndsAt) }
      : { label: "Trial", value: "Ended", alert: true };
  }
  if (school.status === "past_due") return { label: "Payment", value: "Failed", alert: true };
  if (school.status === "active" && school.access === "full") {
    if (school.cancelAtPeriodEnd) {
      return { label: "Ends", value: school.currentPeriodEnd ? formatDate(school.currentPeriodEnd) : "Soon" };
    }
    return { label: "Renews", value: school.currentPeriodEnd ? formatDate(school.currentPeriodEnd) : "Monthly" };
  }
  return { label: "Plan", value: "Ended", alert: true };
}

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

  // Referral earnings, for an owner whose workspace is linked to a partner
  // code. Read with the service role, and only after the owner check above:
  // the statement is counts and totals, never who the learners were.
  const linkedPartner = isOwner && isSupabaseConfigured ? school.partnerSchoolId : null;
  const [statement, creditEntries] = linkedPartner
    ? await Promise.all([
        schoolStatementById(linkedPartner),
        (() => {
          const admin = createAdminClient();
          return admin ? schoolCreditLedger(admin, school.schoolId, 6) : Promise.resolve([]);
        })(),
      ])
    : [null, []];
  const paidPlan = SCHOOL_PLAN_MAP[school.plan as SchoolPlanId];
  const planName = paidPlan?.name ?? "Free trial";
  // A paid plan still billing, or told to stop but not yet over.
  const paidRunning = Boolean(paidPlan) && (school.status === "active" || school.status === "past_due");
  const standing = planStanding(school);
  // What the credit does next, in one sentence. One payment is a month, or a
  // year on yearly billing — credit only ever covers whole payments.
  const billed = paidRunning ? schoolPlanFromCode(school.planCode) : null;
  const paymentCents = billed ? schoolChargeCents(billed.plan, billed.cycle) : null;
  const creditLine =
    paymentCents === null
      ? `You have ${formatRand(school.creditCents)} of credit. It starts paying for your plan once you're on a paid one.`
      : school.creditCents >= paymentCents
        ? `You have ${formatRand(school.creditCents)} of credit, enough to cover a ${formatRand(paymentCents)} payment. We refund a payment from it for you.`
        : `You have ${formatRand(school.creditCents)} of credit. Once it reaches ${formatRand(paymentCents)}, one payment on your plan, we refund a payment from it.`;
  // The demo shows the picker so it can be seen; choosing explains itself there.
  const billingOpen = !isSupabaseConfigured || isSchoolBillingConfigured();
  const pickerIntro = paidRunning
    ? school.cancelAtPeriodEnd
      ? `Your plan stops renewing${school.currentPeriodEnd ? ` on ${formatDate(school.currentPeriodEnd)}` : ""}. Choose a plan to keep going — it starts a new billing period today.`
      : "Switching starts the new plan today and stops the old one renewing. Paid by card through Paystack."
    : school.status === "trialing" && school.access === "full"
      ? `Your free trial runs${school.trialEndsAt ? ` until ${formatDate(school.trialEndsAt)}` : ""}. You're only charged from the day you choose a plan, by card through Paystack.`
      : "Choose a plan to make the workspace editable again. Everything you recorded is still here.";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your team, your plan, and your referral code.
        </p>
      </div>

      {/* ── Plan ───────────────────────────────────────────────────────── */}
      <div id="plan" className="scroll-mt-20 space-y-3">
        <h2 className="font-display text-base font-semibold">Plan</h2>
        <Suspense fallback={null}>
          <SchoolBillingReturn />
        </Suspense>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className={cn(glassSubtle, "p-4")}>
            <p className="text-2xs uppercase tracking-wide text-muted-foreground">Plan</p>
            <p className="mt-1 font-display text-2xl font-semibold">{planName}</p>
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
            <p className="text-2xs uppercase tracking-wide text-muted-foreground">{standing.label}</p>
            <p className={cn("mt-1 font-display text-2xl font-semibold", standing.alert && "text-danger")}>
              {standing.value}
            </p>
          </Card>
        </div>
        {overSeats ? (
          <Card className={cn(glassSubtle, "p-4 text-sm text-muted-foreground")}>
            You have more instructors than seats. Nobody has been removed and nothing has stopped
            working — you just can&apos;t invite anyone new until the plan covers them.
          </Card>
        ) : null}

        {isOwner ? (
          <Card className={cn(glass, "space-y-4 p-5")}>
            <div>
              <h3 className="font-display text-base font-semibold">
                {paidRunning ? "Change plan" : "Choose a plan"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{pickerIntro}</p>
            </div>
            {billingOpen ? (
              <SchoolPlanPicker
                plans={SCHOOL_PLANS}
                currentPlan={paidRunning ? school.plan : ""}
                seatsUsed={school.seatsUsed}
                annualMonths={SCHOOL_ANNUAL_MONTHS_CHARGED}
              />
            ) : (
              <p className="text-sm">
                Paid plans aren&apos;t open yet. Nothing is charged until you choose one, and
                everything you record now carries over.
              </p>
            )}
            {paidRunning ? (
              <div className="space-y-2 border-t border-border/50 pt-4">
                {school.status === "past_due" ? (
                  <p className="text-sm text-danger">
                    Your last payment didn&apos;t go through. Put a new card on the plan and Paystack
                    will try again — the workspace keeps working in the meantime.
                  </p>
                ) : null}
                <SchoolBillingActions
                  cancelAtPeriodEnd={school.cancelAtPeriodEnd}
                  periodEnd={school.currentPeriodEnd ? formatDate(school.currentPeriodEnd) : null}
                />
              </div>
            ) : null}
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">Only the school owner can change the plan.</p>
        )}
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
                <>
                  <ActionForm
                    action={transferOwnership}
                    submitLabel="Make owner"
                    variant="ghost"
                    className="space-y-0"
                    confirm={`Make ${member.displayName} the owner? They take over the team, the plan and the settings, and you become an instructor. ${
                      paidRunning
                        ? "The current plan keeps charging your card until they choose a plan of their own."
                        : "They choose and pay for the plan from now on."
                    }`}
                  >
                    <input type="hidden" name="id" value={member.id} />
                  </ActionForm>
                  <ActionForm
                    action={removeMember}
                    submitLabel="Remove"
                    variant="ghost"
                    className="space-y-0"
                    confirm="Remove this person? They lose access immediately. Their lessons stay on the diary as a record."
                  >
                    <input type="hidden" name="id" value={member.id} />
                  </ActionForm>
                </>
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

      {/* ── Referral earnings ──────────────────────────────────────────── */}
      {isOwner && school.partnerSchoolId !== null ? (
        <div className="space-y-3">
          <h2 className="font-display text-base font-semibold">Referral earnings</h2>
          {statement ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <Card className={cn(glassSubtle, "p-4")}>
                <p className="text-2xs uppercase tracking-wide text-muted-foreground">Learners who paid</p>
                <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{statement.converted}</p>
              </Card>
              <Card className={cn(glassSubtle, "p-4")}>
                <p className="text-2xs uppercase tracking-wide text-muted-foreground">On hold</p>
                <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
                  {formatRand(statement.pendingCents)}
                </p>
              </Card>
              <Card className={cn(glassSubtle, "p-4")}>
                <p className="text-2xs uppercase tracking-wide text-muted-foreground">
                  {school.commissionMode === "credit" ? "Credit" : "Paid to you"}
                </p>
                <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
                  {formatRand(school.commissionMode === "credit" ? school.creditCents : statement.paidCents)}
                </p>
              </Card>
            </div>
          ) : null}
          <Card className={cn(glass, "space-y-4 p-5")}>
            <p className="text-sm text-muted-foreground">
              Every learner you refer who pays earns you commission, once per learner. It waits
              out the learner&apos;s money-back period first, then reaches you however you choose
              here. Credit pays for this plan and can&apos;t be paid out as cash.
            </p>
            <ActionForm action={setCommissionMode} submitLabel="Save" pendingLabel="Saving…">
              <div className="space-y-1.5">
                <label htmlFor="commission-mode" className="block text-sm font-medium">
                  Take commission as
                </label>
                <select
                  id="commission-mode"
                  name="mode"
                  defaultValue={school.commissionMode}
                  className="flex h-10 w-full rounded-md border border-border/70 bg-background/60 px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <option value="eft">Bank transfer, paid monthly</option>
                  <option value="credit">Credit toward this plan</option>
                </select>
              </div>
            </ActionForm>
            {school.commissionMode === "credit" ? (
              <p className="text-sm">{creditLine}</p>
            ) : null}
            {creditEntries.length > 0 ? (
              <div className="divide-y divide-border/50 border-t border-border/50">
                {creditEntries.map((entry) => (
                  <div key={entry.id} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                    <span className="tabular-nums text-muted-foreground">{formatDate(entry.createdAt)}</span>
                    <span>
                      {entry.kind === "earned"
                        ? "Commission credited"
                        : entry.kind === "redeemed"
                          ? "Paid for your plan"
                          : "Put back"}
                    </span>
                    <span className="ml-auto font-semibold tabular-nums">
                      {entry.amountCents < 0 ? `−${formatRand(-entry.amountCents)}` : formatRand(entry.amountCents)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        </div>
      ) : null}

      {/* ── Your records ───────────────────────────────────────────────── */}
      {school.role !== "instructor" ? (
        <div className="space-y-3">
          <h2 className="font-display text-base font-semibold">Your records</h2>
          <Card className={cn(glass, "space-y-3 p-5")}>
            <p className="text-sm text-muted-foreground">
              Download everything as spreadsheets (CSV): for your own files, your accountant, or before you
              close the school. Works even when the workspace is read-only.
            </p>
            <div className="flex flex-wrap gap-2">
              {EXPORT_KINDS.map((kind) => (
                <a
                  key={kind}
                  href={`/schools/export/${kind}`}
                  download
                  className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "press capitalize")}
                >
                  {kind}
                </a>
              ))}
            </div>
          </Card>
        </div>
      ) : null}

      {/* ── Close the school ────────────────────────────────────────────── */}
      {isOwner ? (
        <div className="space-y-3">
          <h2 className="font-display text-base font-semibold">Close the school</h2>
          <Card className={cn(glass, "space-y-4 border-danger/40 p-5")}>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                Closing deletes {school.name} for everyone, permanently: the diary, every learner, lessons and
                notes, packages and payments, vehicles, enquiries and test results. It can&apos;t be undone.
                Download your records first.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                {paidRunning && !school.cancelAtPeriodEnd ? (
                  <li>Your plan stops renewing first. What you&apos;ve already paid for isn&apos;t refunded.</li>
                ) : null}
                {school.creditCents > 0 ? (
                  <li>Your {formatRand(school.creditCents)} of referral credit is lost.</li>
                ) : null}
                {school.partnerSchoolId ? (
                  <li>Your referral earnings as a partner school aren&apos;t affected.</li>
                ) : null}
                <li>Everyone keeps their own K53 Mentor account. Learners who connected their app stop seeing the school.</li>
              </ul>
            </div>
            <CloseSchoolForm schoolName={school.name} action={closeSchool} />
          </Card>
        </div>
      ) : null}

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
