"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogOut, CreditCard, Trash2, Gauge, Target, CalendarClock, Wifi } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Switch } from "@/components/ui/switch";
import { QuickProfileEdit, GOAL_LABEL } from "@/components/account/quick-profile-edit";
import { EmailRemindersToggle } from "@/components/account/email-reminders-toggle";
import { InviteCard } from "@/components/account/invite-card";
import { useStudyStore } from "@/hooks/use-study-store";
import { useDataSaver } from "@/hooks/use-data-saver";
import { PLAN_MAP, VEHICLE_CLASS_SHORT } from "@/lib/billing/plans";
import { formatDate, cn, glass, glassFloat } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";

function AccountInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { state, signOut, resetProgress } = useStudyStore();
  const [dataSaver, setDataSaver] = useDataSaver();
  const [editOpen, setEditOpen] = React.useState(sp.get("edit") === "profile");
  const [showDelete, setShowDelete] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState("");
  const [deletePassword, setDeletePassword] = React.useState("");
  const [deleteCode, setDeleteCode] = React.useState("");
  const [codeSent, setCodeSent] = React.useState(false);
  const [sendingCode, setSendingCode] = React.useState(false);
  // How this account signs in decides how deletion is confirmed: a password
  // account re-enters its password; an OAuth account enters an emailed code.
  const [authMethod, setAuthMethod] = React.useState<"password" | "oauth" | null>(null);
  const needsPassword = authMethod === "password";
  const needsCode = authMethod === "oauth";
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const plan = PLAN_MAP[state.tier];
  const profile = state.profile;
  const onboarding = state.onboarding;

  // Deleting is irreversible, so it's confirmed by reauthentication: a password
  // account re-enters its password; an OAuth account (no password) enters a code
  // we email. Detect which so we ask for the right one. (The server enforces
  // this regardless; this is UX.)
  React.useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    let cancelled = false;
    void supabase.auth.getUser().then(({ data }) => {
      if (cancelled || !data.user) return;
      const hasPassword = (data.user.identities ?? []).some((i) => i.provider === "email");
      setAuthMethod(hasPassword ? "password" : "oauth");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /** OAuth accounts: email a one-time code before deletion can be confirmed. */
  async function sendDeleteCode() {
    setDeleteError(null);
    setSendingCode(true);
    try {
      const res = await fetch("/api/account/delete/send-code", { method: "POST" });
      const data = await res.json().catch(() => ({}) as { error?: string });
      if (res.ok) {
        setCodeSent(true);
        return;
      }
      setDeleteError(
        data.error === "email_not_configured" || data.error === "email_failed"
          ? "We couldn't email your code just now — please try again shortly."
          : "Couldn't start deletion — please try again shortly.",
      );
    } catch {
      setDeleteError("Network error — check your connection and try again.");
    } finally {
      setSendingCode(false);
    }
  }

  function handleSignOut() {
    signOut();
    router.push("/");
  }

  function handleReset() {
    if (window.confirm("Reset all progress? This permanently clears your readiness, streak, reviews and history.")) {
      resetProgress();
      router.push("/login");
    }
  }

  async function handleDelete() {
    setDeleteError(null);
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          needsPassword ? { password: deletePassword } : needsCode ? { code: deleteCode } : {},
        ),
      });
      const data = await res.json().catch(() => ({}) as { error?: string });
      if (res.ok) {
        // Server account is gone (or demo mode) — clear this browser too.
        resetProgress();
        signOut();
        router.push("/");
        return;
      }
      setDeleteError(
        data.error === "password_required" || data.error === "invalid_password"
          ? "That password is incorrect. Enter your current password to confirm."
          : data.error === "code_required" || data.error === "invalid_code"
            ? "That code is incorrect or expired. Request a new one and try again."
            : data.error === "subscription_cancel_failed"
              ? "We couldn't cancel your subscription just now, so we've kept your account. Please try again shortly."
              : "Deletion failed — please try again shortly.",
      );
    } catch {
      setDeleteError("Network error — check your connection and try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Account" description="Your profile, plan and preferences." />

      <Card className={cn(glassFloat, "flex items-center gap-4 p-6")}>
        <Avatar name={profile?.name ?? "Learner"} className="h-14 w-14 text-base" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold">{profile?.name ?? "Learner"}</p>
          <p className="truncate text-sm text-muted-foreground">{profile?.email}</p>
          {profile && (
            <p className="mt-0.5 text-2xs text-muted-foreground">Member since {formatDate(profile.createdAt)}</p>
          )}
        </div>
      </Card>

      {/* Subscription */}
      <Card className={cn(glass, "mt-5 p-6")}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Subscription</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant={state.tier === "free" ? "secondary" : "default"}>{plan.name}</Badge>
              {/* The track badge is a paid-plan concept — a free learner isn't
                  scoped to one, so showing it would imply a plan they don't have. */}
              {state.tier !== "free" && state.vehicleClass && (
                <Badge variant="secondary">{VEHICLE_CLASS_SHORT[state.vehicleClass]}</Badge>
              )}
              <span className="text-sm text-muted-foreground">{plan.tagline}</span>
            </div>
          </div>
          <Link href="/account/billing" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
            <CreditCard className="h-4 w-4" /> Manage
          </Link>
        </div>
      </Card>

      {/* Study profile — always available so the licence code can be set/changed
          even if onboarding was skipped (e.g. a Google sign-in). */}
      <Card className={cn(glass, "mt-5 p-6")}>
        <h2 className="font-display text-lg font-semibold">Study profile</h2>
        {onboarding ? (
          <>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Info icon={<Target className="h-4 w-4" />} label="Goal" value={GOAL_LABEL[onboarding.goal]} />
              <Info icon={<Gauge className="h-4 w-4" />} label="Licence code" value={`Code ${onboarding.vehicleCode}`} />
              <Info
                icon={<CalendarClock className="h-4 w-4" />}
                label={onboarding.goal === "both" ? "Learner's test" : "Test date"}
                value={onboarding.testDate ? formatDate(onboarding.testDate) : "Not booked"}
              />
              {onboarding.goal === "both" && (
                <Info
                  icon={<CalendarClock className="h-4 w-4" />}
                  label="Driver's test"
                  value={onboarding.driversTestDate ? formatDate(onboarding.driversTestDate) : "Not booked"}
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              Update study profile
            </button>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us which licence you&apos;re studying for so your questions, signs and mock
              exams match — car, motorcycle or heavy vehicle.
            </p>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              Choose my licence code
            </button>
          </>
        )}
        <QuickProfileEdit open={editOpen} onClose={() => setEditOpen(false)} />
      </Card>

      {/* Preferences */}
      <Card className={cn(glass, "mt-5 p-6")}>
        <h2 className="font-display text-lg font-semibold">Preferences</h2>
        <div className="mt-4 flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-sm font-medium">Appearance</p>
            <p className="text-sm text-muted-foreground">Switch between light and dark.</p>
          </div>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between py-4">
          <div className="flex items-start gap-2">
            <Wifi className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Data saver</p>
              <p className="text-sm text-muted-foreground">Disables decorative graphics and animations to save data.</p>
            </div>
          </div>
          <Switch checked={dataSaver} onChange={setDataSaver} label="Data saver" />
        </div>
        <EmailRemindersToggle />
      </Card>

      <InviteCard />

      {/* Danger zone */}
      <Card className={cn(glass, "mt-5 p-6")}>
        <h2 className="font-display text-lg font-semibold">Account actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
          <Button variant="ghost" className="gap-2 text-danger hover:bg-danger/10" onClick={handleReset}>
            <Trash2 className="h-4 w-4" /> Reset all progress
          </Button>
          {!showDelete && (
            <Button
              variant="ghost"
              className="gap-2 text-danger hover:bg-danger/10"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="h-4 w-4" /> Delete account
            </Button>
          )}
        </div>

        {showDelete && (
          <div className="mt-4 rounded-lg border border-danger/30 bg-danger/[0.06] p-4">
            <p className="text-sm font-semibold text-foreground">Delete your account permanently?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This erases your profile, progress, streak and all study history everywhere —
              it cannot be undone. If you have a paid plan, we&apos;ll cancel it automatically
              so you&apos;re never charged again — and refund your last payment in full if
              you&apos;re within 7 days of it.
            </p>
            <p className="mt-3 text-xs font-medium text-foreground">
              Type <span className="font-mono font-bold">DELETE</span> to confirm:
            </p>
            <input
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
              className="mt-1.5 h-9 w-40 rounded-md border border-border bg-card px-3 text-sm font-mono"
              placeholder="DELETE"
              autoComplete="off"
            />
            {needsPassword && (
              <div className="mt-3">
                <p className="text-xs font-medium text-foreground">Confirm your password:</p>
                <Input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="mt-1.5 h-9 w-56"
                  placeholder="Current password"
                  autoComplete="current-password"
                />
              </div>
            )}
            {needsCode && (
              <div className="mt-3">
                {!codeSent ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      For your security, we&apos;ll email a 6-digit code to confirm — your account
                      signs in with Google, so there&apos;s no password to enter.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={sendDeleteCode}
                      loading={sendingCode}
                      loadingText="Sending…"
                    >
                      Email me a code
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-medium text-foreground">
                      Enter the 6-digit code we emailed you:
                    </p>
                    <Input
                      inputMode="numeric"
                      value={deleteCode}
                      onChange={(e) => setDeleteCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="mt-1.5 h-9 w-40 font-mono tracking-[0.3em]"
                      placeholder="000000"
                      autoComplete="one-time-code"
                    />
                    <button
                      type="button"
                      onClick={sendDeleteCode}
                      disabled={sendingCode}
                      className="mt-2 block text-xs font-medium text-primary hover:underline disabled:opacity-60"
                    >
                      {sendingCode ? "Sending…" : "Resend code"}
                    </button>
                  </>
                )}
              </div>
            )}
            {deleteError && <p className="mt-2 text-xs text-danger">{deleteError}</p>}
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="danger"
                onClick={handleDelete}
                disabled={
                  confirmDelete !== "DELETE" ||
                  (needsPassword && !deletePassword) ||
                  (needsCode && (!codeSent || deleteCode.length !== 6)) ||
                  deleting
                }
              >
                {deleting ? "Deleting…" : "Delete forever"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowDelete(false);
                  setConfirmDelete("");
                  setDeletePassword("");
                  setDeleteCode("");
                  setCodeSent(false);
                  setDeleteError(null);
                }}
                disabled={deleting}
              >
                Keep my account
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountInner />
    </Suspense>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon} {label}</p>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  );
}

