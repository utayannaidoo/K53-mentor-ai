import { beforeEach, describe, expect, it, vi } from "vitest";
import { refundDb, paidRow } from "./refund-db";
vi.mock("@/lib/env", () => ({isPaystackConfigured:true,isSupabaseConfigured:true,assertLivePaystackKeyInProduction:vi.fn()}));
vi.mock("@/lib/ai/rate-limit",()=>({limitCheckout:vi.fn(async()=>({success:true})),limitUserDaily:vi.fn(async()=>({success:true})),clientIp:()=>"test",ACCOUNT_DAILY_LIMIT:{cancel:5}}));
vi.mock("@/lib/paystack/client", async original => ({...await original<typeof import("@/lib/paystack/client")>(),refundTransaction:vi.fn(),verifyTransaction:vi.fn(),listTransactionRefunds:vi.fn(),fetchCustomer:vi.fn(),disableSubscription:vi.fn()}));
vi.mock("@/lib/notify/email",()=>({isEmailConfigured:true,sendEmail:vi.fn(async()=>true)}));
vi.mock("@/lib/supabase/server",()=>({createClient:vi.fn()}));
vi.mock("@/lib/supabase/admin",()=>({createAdminClient:vi.fn()}));
import {POST} from "@/app/api/billing/cancel/route";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {refundTransaction,verifyTransaction,listTransactionRefunds,fetchCustomer,PaystackError} from "@/lib/paystack/client";
import {sendEmail} from "@/lib/notify/email";
let db: ReturnType<typeof refundDb>;
const send=()=>POST(new Request("https://k53mentorai.co.za/api/billing/cancel",{method:"POST"}));
beforeEach(()=>{
 vi.clearAllMocks();db=refundDb({subscriptions:[paidRow()],profiles:[{id:"user-1",email:"buyer@example.com",full_name:"Learner"}]});
 const server=Object.assign({},db.client,{auth:{getUser:async()=>({data:{user:{id:"user-1",email:"buyer@example.com"}}})}});
 vi.mocked(createClient).mockResolvedValue(server as never);vi.mocked(createAdminClient).mockReturnValue(db.client as never);
 vi.mocked(refundTransaction).mockResolvedValue({id:9,status:"pending",amount:6000});
 vi.mocked(verifyTransaction).mockResolvedValue({id:1,status:"success",reference:"ref_old",amount:6000,customer:{customer_code:"CUS_1",email:"buyer@example.com"}});
 vi.mocked(listTransactionRefunds).mockResolvedValue([]);
 vi.mocked(fetchCustomer).mockResolvedValue({customer_code:"CUS_1",email:"buyer@example.com",subscriptions:[{subscription_code:"SUB_1",email_token:"token",status:"active",plan:{plan_code:"PLN_1"}}]});
 vi.mocked(sendEmail).mockResolvedValue(true);
});
describe("cancel and refund",()=>{
 it("two cancels submit only once and do not mistake pending for refunded",async()=>{
  const responses=await Promise.all([send(),send()]);expect(responses.map(r=>r.status)).toEqual([200,200]);
  for(const response of responses)expect(await response.json()).toMatchObject({refunded:false,endsNow:false,refundQueued:true});
  expect(refundTransaction).toHaveBeenCalledTimes(1);expect(db.tables.subscriptions[0]).toMatchObject({tier:"premium",money_back_used:true,cancel_at_period_end:true});
  expect(db.tables.billing_email_outbox.filter(r=>String(r.id).endsWith("requested"))).toHaveLength(1);
 });
 it("insufficient funds keeps the durable claim and sends an attention alert",async()=>{
  vi.mocked(refundTransaction).mockRejectedValue(new PaystackError("Insufficient balance",400));
  expect(await (await send()).json()).toMatchObject({refunded:false,refundQueued:true,endsNow:false});
  expect(db.tables.pending_refunds[0].status).toBe("queued");expect(db.tables.subscriptions[0].money_back_used).toBe(true);
  expect(vi.mocked(sendEmail).mock.calls.some(([m])=>m.subject.includes("Refund needs attention"))).toBe(true);
 });
 it("operator sees the request even if cancellation fails before refunding",async()=>{
  vi.mocked(fetchCustomer).mockRejectedValue(new Error("upstream offline"));
  expect((await send()).status).toBe(502);expect(refundTransaction).not.toHaveBeenCalled();
  expect(vi.mocked(sendEmail).mock.calls.some(([m])=>m.subject.includes("Refund requested"))).toBe(true);
 });
 it("a mail outage does not lose the request or block cancellation",async()=>{
  vi.mocked(sendEmail).mockResolvedValue(false);expect((await send()).status).toBe(200);
  expect(db.tables.billing_email_outbox[0].sent_at).toBeUndefined();
 });
 it("cannot move money if the durable request cannot be saved",async()=>{
  db.errors.add("pending_refunds:upsert");expect((await send()).status).toBe(502);expect(refundTransaction).not.toHaveBeenCalled();
 });
 it("confirmed processing ends only the old paid access",async()=>{
  vi.mocked(refundTransaction).mockResolvedValue({id:9,status:"processed",amount:6000});
  expect(await(await send()).json()).toMatchObject({refunded:true,endsNow:true});expect(db.tables.subscriptions[0].tier).toBe("free");
 });
 it("outside-window cancellation preserves the paid period without a refund",async()=>{
  db.tables.subscriptions[0].paid_at="2020-01-01";expect(await(await send()).json()).toMatchObject({refunded:false,endsNow:false});
  expect(refundTransaction).not.toHaveBeenCalled();expect(db.tables.subscriptions[0].cancel_at_period_end).toBe(true);
 });
});
