import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { freshPglite, hasPartnerDb } from "./partner-db";

describe.skipIf(!hasPartnerDb)("refund lifecycle migration", () => {
  it("preserves manual settlements and restricts the outbox to the service role", async () => {
    const db = await freshPglite();
    try {
      await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
        create schema auth; create table auth.users(id uuid primary key);
        insert into auth.users values ('20000000-0000-0000-0000-000000000001');`);
      for (const file of ["0028_pending_refunds.sql", "0045_pending_refunds_manual.sql", "0046_refund_lifecycle_and_alerts.sql"])
        await db.exec(readFileSync(`supabase/migrations/${file}`, "utf8"));
      for (const status of ["queued", "submitting", "processing", "needs_attention", "failed", "refunded"])
        await db.query("insert into pending_refunds(user_id,transaction_reference,status) values ('20000000-0000-0000-0000-000000000001',$1,$1)", [status]);
      await expect(db.exec("update pending_refunds set manual_reference='bank receipt' where status='processing'")).rejects.toThrow();
      const {rows}=await db.query<{rls:boolean;anon:boolean;authenticated:boolean;service:boolean}>(`select relrowsecurity as rls,
        has_table_privilege('anon','billing_email_outbox','SELECT') as anon,
        has_table_privilege('authenticated','billing_email_outbox','INSERT') as authenticated,
        has_table_privilege('service_role','billing_email_outbox','INSERT') as service
        from pg_class where oid='billing_email_outbox'::regclass`);
      expect(rows[0]).toEqual({rls:true,anon:false,authenticated:false,service:true});
    } finally { await db.close(); }
  }, 60000);
});
