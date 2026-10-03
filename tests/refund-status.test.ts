import { beforeEach, expect, it, vi } from "vitest";
import { refundDb, refundRow, paidRow } from "./refund-db";
vi.mock("@/lib/env", async original => ({ ...await original<typeof import("@/lib/env")>(), isSupabaseConfigured: true }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GET } from "@/app/api/billing/status/route";
let db: ReturnType<typeof refundDb>;
const daysAgo=(days:number)=>new Date(Date.now()-days*86_400_000).toISOString();
beforeEach(() => {
 db=refundDb({subscriptions:[paidRow({tier:"free",paid_at:daysAgo(5)})],pending_refunds:[refundRow({status:"refunded",created_at:daysAgo(4),refunded_at:daysAgo(1)})]});
 vi.mocked(createAdminClient).mockReturnValue(db.client);
 vi.mocked(createClient).mockResolvedValue(Object.assign({},db.client,{auth:{getUser:async()=>({data:{user:{id:"user-1"}}})}}) as never);
});
it("still shows refund completion after the learner returns to free",async()=>{
 expect(await(await GET()).json()).toMatchObject({tier:"free",refundStatus:"refunded",refundProcessingSince:null});
});
it("keeps failures visible to free users",async()=>{
 db.tables.pending_refunds[0].status="failed";
 expect(await(await GET()).json()).toMatchObject({tier:"free",refundStatus:"failed"});
});
it("does not report free or hide refunds when a database read fails",async()=>{
 db.errors.add("subscriptions:read");expect((await GET()).status).toBe(503);
});
it("stops showing a settled refund after a month",async()=>{
 db.tables.pending_refunds[0].refunded_at=daysAgo(31);
 expect(await(await GET()).json()).toMatchObject({tier:"free",refundStatus:null});
});
it("stops showing a settled refund once the learner has paid again",async()=>{
 Object.assign(db.tables.subscriptions[0],{tier:"premium",paid_at:new Date().toISOString()});
 expect(await(await GET()).json()).toMatchObject({refundStatus:null});
});
it("keeps an owed refund visible however old it is",async()=>{
 Object.assign(db.tables.pending_refunds[0],{status:"failed",refunded_at:null,created_at:daysAgo(90),updated_at:daysAgo(60)});
 expect(await(await GET()).json()).toMatchObject({refundStatus:"failed"});
});
