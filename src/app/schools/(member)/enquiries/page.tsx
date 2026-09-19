import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, glass, glassSubtle, formatDate } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";
import { currentSchool } from "@/lib/schools/auth";
import { DEMO_SCHOOL } from "@/lib/schools/demo";
import { schoolEnquiries } from "@/lib/schools/pipeline";
import { isDueToday, SOURCE_LABEL, type Enquiry, type EnquirySource } from "@/lib/schools/test-day";
import { schoolDay, shiftDay } from "@/lib/schools/time";
import { LICENCE_LABEL, whatsappLink, type LicenceCode } from "@/lib/schools/diary-types";
import { ActionForm, Field } from "@/components/admin/action-form";
import { SelectField, TextAreaField } from "@/components/schools/fields";
import { addEnquiry, convertEnquiry, updateEnquiry } from "@/app/schools/enquiry-actions";

export const metadata: Metadata = { title: "Enquiries" };

/**
 * People who asked about lessons and haven't signed up yet.
 *
 * Built around one question — who do I call back today — because the loss
 * this prevents is quiet: a WhatsApp read in the car, never answered, and a
 * learner who books with the school down the road.
 */
export default async function SchoolEnquiries() {
  const school = (isSupabaseConfigured ? await currentSchool() : DEMO_SCHOOL)!;
  const open = await schoolEnquiries(school, ["new", "contacted"]);
  const today = schoolDay(new Date(), school.timezone);
  const due = open.filter((e) => isDueToday(e, today));
  const later = open.filter((e) => !isDueToday(e, today));
  const canWrite = school.access === "full";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/schools/more" className="text-2xs text-muted-foreground hover:text-foreground">
          ← More
        </Link>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">Enquiries</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {due.length === 0
            ? "Nobody to call back today."
            : `${due.length} to call back today`}
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-base font-semibold">Call back today</h2>
        {due.length === 0 ? (
          <Card className={cn(glassSubtle, "p-6 text-sm text-muted-foreground")}>
            All caught up. Log the next WhatsApp or phone call below so it doesn&apos;t get lost.
          </Card>
        ) : (
          <Card className={cn(glass, "divide-y divide-border/50")}>
            {due.map((enquiry) => (
              <EnquiryRow key={enquiry.id} enquiry={enquiry} school={school.name} today={today} canWrite={canWrite} />
            ))}
          </Card>
        )}
      </div>

      {later.length > 0 ? (
        <div className="space-y-3">
          <h2 className="font-display text-base font-semibold">Coming up</h2>
          <Card className={cn(glass, "divide-y divide-border/50")}>
            {later.map((enquiry) => (
              <EnquiryRow key={enquiry.id} enquiry={enquiry} school={school.name} today={today} canWrite={canWrite} />
            ))}
          </Card>
        </div>
      ) : null}

      {canWrite ? (
        <details className="group" open={open.length === 0}>
          <summary className="cursor-pointer list-none">
            <span className={cn(buttonVariants(), "press")}>Log an enquiry</span>
          </summary>
          <Card className={cn(glass, "mt-3 p-5")}>
            <ActionForm action={addEnquiry} submitLabel="Save" pendingLabel="Saving…">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" name="name" required />
                <Field label="Phone" name="phone" type="tel" placeholder="082 123 4567" />
                <SelectField
                  label="How they got in touch"
                  name="source"
                  defaultValue="whatsapp"
                  options={(Object.keys(SOURCE_LABEL) as EnquirySource[]).map((s) => ({ value: s, label: SOURCE_LABEL[s] }))}
                />
                <SelectField
                  label="Licence"
                  name="licence_code"
                  defaultValue=""
                  options={[
                    { value: "", label: "Not sure yet" },
                    ...(Object.keys(LICENCE_LABEL) as LicenceCode[]).map((c) => ({ value: c, label: LICENCE_LABEL[c] })),
                  ]}
                />
              </div>
              <TextAreaField label="What they asked" name="message" rows={2} placeholder="e.g. How much for 10 lessons?" />
            </ActionForm>
          </Card>
        </details>
      ) : null}
    </div>
  );
}

function EnquiryRow({
  enquiry,
  school,
  today,
  canWrite,
}: {
  enquiry: Enquiry;
  school: string;
  today: string;
  canWrite: boolean;
}) {
  const first = enquiry.name.split(" ")[0];
  const wa = whatsappLink(
    enquiry.phone,
    `Hi ${first}, this is ${school} — thanks for asking about driving lessons. When would suit you for a first lesson?`,
  );
  return (
    <div className="space-y-2 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-0 flex-1 truncate font-medium">{enquiry.name}</span>
        <Badge variant="outline">{SOURCE_LABEL[enquiry.source]}</Badge>
        {enquiry.licence_code ? (
          <Badge variant="outline">{LICENCE_LABEL[enquiry.licence_code as LicenceCode] ?? enquiry.licence_code}</Badge>
        ) : null}
        {enquiry.status === "new" ? <Badge variant="warning">new</Badge> : null}
      </div>
      {enquiry.message ? <p className="text-sm text-muted-foreground">&ldquo;{enquiry.message}&rdquo;</p> : null}
      <p className="text-2xs text-muted-foreground">
        {[
          `asked ${formatDate(enquiry.created_at)}`,
          enquiry.next_follow_up_on ? `call back ${formatDate(enquiry.next_follow_up_on)}` : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <div className="flex flex-wrap items-start gap-2">
        {enquiry.phone ? (
          <a href={`tel:${enquiry.phone.replace(/\s/g, "")}`} className={cn(buttonVariants({ variant: "secondary" }), "press")}>
            Call
          </a>
        ) : null}
        {wa ? (
          <a href={wa} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline" }), "press")}>
            WhatsApp
          </a>
        ) : null}
        {canWrite ? (
          <ActionForm action={convertEnquiry} submitLabel="Make them a learner" pendingLabel="Adding…" className="space-y-1">
            <input type="hidden" name="id" value={enquiry.id} />
          </ActionForm>
        ) : null}
      </div>
      {canWrite ? (
        <ActionForm
          action={updateEnquiry}
          submitLabel="Save"
          variant="ghost"
          className="flex flex-wrap items-end gap-2 space-y-0"
          resetOnSuccess={false}
        >
          <input type="hidden" name="id" value={enquiry.id} />
          <SelectField
            label="Outcome"
            name="status"
            defaultValue={enquiry.status === "new" ? "contacted" : enquiry.status}
            className="min-w-40"
            options={[
              { value: "contacted", label: "Spoke to them" },
              { value: "booked", label: "Booked" },
              { value: "lost", label: "Not interested" },
            ]}
          />
          <Field
            label="Call back on"
            name="next_follow_up_on"
            type="date"
            defaultValue={enquiry.next_follow_up_on ?? shiftDay(today, 2)}
          />
        </ActionForm>
      ) : null}
    </div>
  );
}
