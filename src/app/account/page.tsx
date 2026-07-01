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
import { useStudyStore } from "@/hooks/use-study-store";
import { useDataSaver } from "@/hooks/use-data-saver";
import { PLAN_MAP } from "@/lib/billing/plans";
import { formatDate, cn, glass, glassFloat } from "@/lib/utils";

function AccountInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { state, signOut, resetProgress } = useStudyStore();
  const [dataSaver, setDataSaver] = useDataSaver();
  const [editOpen, setEditOpen] = React.useState(sp.get("edit") === "profile");
  const plan = PLAN_MAP[state.tier];
  const profile = state.profile;
  const onboarding = state.onboarding;

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
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={state.tier === "free" ? "secondary" : "default"}>{plan.name}</Badge>
              <span className="text-sm text-muted-foreground">{plan.tagline}</span>
            </div>
          </div>
          <Link href="/account/billing" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
            <CreditCard className="h-4 w-4" /> Manage
          </Link>
        </div>
      </Card>

      {/* Study profile */}
      {onboarding && (
        <Card className={cn(glass, "mt-5 p-6")}>
          <h2 className="font-display text-lg font-semibold">Study profile</h2>
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
          <QuickProfileEdit open={editOpen} onClose={() => setEditOpen(false)} />
        </Card>
      )}

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
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-start gap-2">
            <Wifi className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Data saver</p>
              <p className="text-sm text-muted-foreground">Disables decorative graphics and animations to save data.</p>
            </div>
          </div>
          <Switch checked={dataSaver} onChange={setDataSaver} label="Data saver" />
        </div>
      </Card>

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
        </div>
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

