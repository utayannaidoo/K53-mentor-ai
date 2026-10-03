import { beforeEach, describe, expect, it, vi } from "vitest";
import { refundDb, refundRow, paidRow } from "./refund-db";
vi.mock("@/lib/paystack/client", async (original) => ({ ...await original<typeof import("@/lib/paystack/client")>(), refundTransaction: vi.fn(), verifyTransaction: vi.fn(), listTransactionRefunds: vi.fn(), fetchRefund: vi.fn() }));
vi.mock("@/lib/notify/email", () => ({ sendEmail: vi.fn(), isEmailConfigured: true }));
import { refundTransaction, verifyTransaction, listTransactionRefunds, fetchRefund, PaystackError } from "@/lib/paystack/client";
import { processRefund, applyRefundEvent, queuePendingRefund, processPendingRefunds, REFUND_MAX_ATTEMPTS } from "@/lib/billing/refund-lifecycle";
import { flushBillingEmails, notifyRefundOperator } from "@/lib/billing/refund-notifications";
import { sendEmail } from "@/lib/notify/email";
import { retryRefundNow, stopRefundRetries, recordManualRefund } from "@/lib/billing/pending-refunds";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(verifyTransaction).mockResolvedValue({ id: 1, status: "success", reference: "ref_old", amount: 6000, customer: {customer_code:"CUS_1",email:"buyer@example.com"} });
  vi.mocked(listTransactionRefunds).mockResolvedValue([]);
  vi.mocked(refundTransaction).mockResolvedValue({ id: 9, status: "pending", amount: 6000 });
  vi.mocked(sendEmail).mockResolvedValue(true);
});
const HOUR_AGO = () => new Date(Date.now() - 3_600_000).toISOString();
/** The outbox row the cancel route writes before it claims the guarantee. */
const requestedNotice = (reference: string, at: () => string) => ({ id: `refund-${reference}-requested`, message: {}, created_at: at(), last_attempt_at: null, sent_at: at() });
const setup = () => refundDb({ pending_refunds:[refundRow()], subscriptions:[paidRow()], profiles:[{id:"user-1",email:"buyer@example.com",full_name:"Learner"}] });

describe("refund lifecycle", () => {
  it("records acceptance as processing, preserves paid access, and sends no completion email", async () => {
    const db=setup();
    expect(await processRefund(db.client,"ref_old")).toBe("processing");
    expect(db.tables.pending_refunds[0]).toMatchObject({status:"processing",provider_refund_id:9});
    expect(db.tables.subscriptions[0].tier).toBe("premium");
    expect(db.tables.billing_email_outbox ?? []).toHaveLength(0);
  });
  it("concurrent workers submit the refund only once", async () => {
    const db=setup(); await Promise.all([processRefund(db.client,"ref_old"),processRefund(db.client,"ref_old")]);
    expect(refundTransaction).toHaveBeenCalledTimes(1);
  });
  it("processed confirmation revokes only the matching payment and queues durable receipts", async () => {
    const db=setup(); await applyRefundEvent(db.client,"refund.processed",{transaction_reference:"ref_old",amount:6000});
    expect(db.tables.pending_refunds[0].status).toBe("refunded");
    expect(db.tables.subscriptions[0].tier).toBe("free");
    expect(db.tables.billing_email_outbox).toHaveLength(2);
    await applyRefundEvent(db.client,"refund.processed",{transaction_reference:"ref_old",amount:6000});
    await applyRefundEvent(db.client,"refund.pending",{transaction_reference:"ref_old"});
    await applyRefundEvent(db.client,"refund.failed",{transaction_reference:"ref_old"});
    expect(db.tables.pending_refunds[0].status).toBe("refunded");
    expect(db.tables.billing_email_outbox).toHaveLength(2);
  });
  it("an old refund cannot revoke a new plan", async () => {
    const db=setup(); db.tables.subscriptions[0].last_charge_reference="ref_new";
    await applyRefundEvent(db.client,"refund.processed",{transaction_reference:"ref_old",amount:6000});
    expect(db.tables.subscriptions[0].tier).toBe("premium");
  });
  it("an unrelated top-up refund cannot revoke a plan, including empty plan objects", async () => {
    const db=setup();
    vi.mocked(verifyTransaction).mockResolvedValue({id:2,status:"reversed",reference:"topup",amount:2000,customer:{customer_code:"CUS_1",email:"a@b.com"},plan:{}});
    await applyRefundEvent(db.client,"refund.processed",{transaction_reference:"topup",amount:2000});
    expect(db.tables.subscriptions[0].tier).toBe("premium");
  });
  it.each(["refund.failed","refund.needs-attention"])("%s preserves access and notifies the operator", async event => {
    const db=setup(); await applyRefundEvent(db.client,event,{transaction_reference:"ref_old"});
    expect(db.tables.pending_refunds[0].status).toBe(event==="refund.failed"?"failed":"needs_attention");
    expect(db.tables.subscriptions[0].tier).toBe("premium");
    expect(db.tables.billing_email_outbox[0].message).toMatchObject({to:"support@k53mentorai.co.za"});
  });
  it("insufficient balance stays queued and alerts immediately", async () => {
    const db=setup(); vi.mocked(refundTransaction).mockRejectedValue(new PaystackError("Insufficient balance to process refund",400));
    expect(await processRefund(db.client,"ref_old")).toBe("queued");
    expect(db.tables.pending_refunds[0].attempts).toBe(1);
    expect(db.tables.billing_email_outbox).toHaveLength(1);
  });
  it("a timed-out POST requires reconciliation and is not submitted again", async () => {
    const db=setup(); vi.mocked(refundTransaction).mockRejectedValue(new Error("timeout"));
    expect(await processRefund(db.client,"ref_old")).toBe("needs_attention");
    await processRefund(db.client,"ref_old"); expect(refundTransaction).toHaveBeenCalledTimes(1);
  });
  it("reconciles an already accepted provider refund without another POST", async () => {
    const db=setup(); vi.mocked(listTransactionRefunds).mockResolvedValue([{id:9,status:"processed",amount:6000}]);
    expect(await processRefund(db.client,"ref_old")).toBe("refunded"); expect(refundTransaction).not.toHaveBeenCalled();
  });
  it("polls an accepted refund and completes it when its webhook was missed", async () => {
    const db=setup(); db.tables.pending_refunds[0].status="processing";db.tables.pending_refunds[0].provider_refund_id=9;
    vi.mocked(fetchRefund).mockResolvedValue({id:9,status:"processed",amount:6000});
    expect(await processRefund(db.client,"ref_old")).toBe("refunded"); expect(refundTransaction).not.toHaveBeenCalled();
  });
  it("preserves access for partial refunds", async () => {
    const db=setup(); await applyRefundEvent(db.client,"refund.processed",{transaction_reference:"ref_old",amount:3000});
    expect(db.tables.pending_refunds[0].status).toBe("needs_attention");expect(db.tables.subscriptions[0].tier).toBe("premium");
  });
  it("does not claim completion when a subscription write fails", async () => {
    const db=setup(); db.errors.add("subscriptions:update");
    await expect(applyRefundEvent(db.client,"refund.processed",{transaction_reference:"ref_old",amount:6000})).rejects.toThrow();
    expect(db.tables.pending_refunds[0].status).toBe("queued");
  });
  it("never reopens or submits a manually repaid refund", async () => {
    const db=setup();Object.assign(db.tables.pending_refunds[0],{status:"refunded",manual_reference:"owner confirmed"});
    expect(await queuePendingRefund(db.client,{userId:"user-1",reference:"ref_old"})).toEqual({ok:true,rowStatus:"refunded"});
    await processRefund(db.client,"ref_old");expect(refundTransaction).not.toHaveBeenCalled();
  });
  it("exhaustion triggers manual attention without another POST", async () => {
    const db=setup();db.tables.pending_refunds[0].attempts=REFUND_MAX_ATTEMPTS;
    expect(await processRefund(db.client,"ref_old")).toBe("failed");expect(refundTransaction).not.toHaveBeenCalled();
  });
  it("fails closed when it cannot persist the refund request", async () => {
    const db=setup();db.errors.add("pending_refunds:upsert");
    expect(await queuePendingRefund(db.client,{userId:"user-1",reference:"ref_new"})).toEqual({ok:false});
    expect(refundTransaction).not.toHaveBeenCalled();
  });
  it("an interrupted worker becomes visible for reconciliation", async () => {
    const db=setup();Object.assign(db.tables.pending_refunds[0],{status:"submitting",updated_at:"2020-01-01"});
    expect(await processRefund(db.client,"ref_old")).toBe("needs_attention");expect(refundTransaction).not.toHaveBeenCalled();
  });
  it("empty cron queue does nothing",async()=>{const db=refundDb();expect((await processPendingRefunds(db.client)).attempted).toBe(0);});
  it("recovers an orphaned claim without moving money",async()=>{
    const db=refundDb({subscriptions:[paidRow({money_back_used:true,cancel_at_period_end:true})],billing_email_outbox:[requestedNotice("ref_old",HOUR_AGO)]});
    expect((await processPendingRefunds(db.client)).recovered).toBe(1);
    expect(db.tables.pending_refunds[0].status).toBe("needs_attention");expect(refundTransaction).not.toHaveBeenCalled();
  });
  it("a polled partial refund preserves paid access",async()=>{
    const db=setup();Object.assign(db.tables.pending_refunds[0],{status:"processing",provider_refund_id:9});
    vi.mocked(fetchRefund).mockResolvedValue({id:9,status:"processed",amount:3000});
    expect(await processRefund(db.client,"ref_old")).toBe("needs_attention");expect(db.tables.subscriptions[0].tier).toBe("premium");
  });
  it("admin and cron share one submission claim",async()=>{
    const db=setup();await Promise.all([retryRefundNow(db.client,"refund-1"),processRefund(db.client,"ref_old")]);
    expect(refundTransaction).toHaveBeenCalledTimes(1);expect(db.tables.pending_refunds[0].status).toBe("processing");
  });
  it.each(["submitting","processing","needs_attention"])("cannot record EFT while provider state is %s",async status=>{
    const db=setup();db.tables.pending_refunds[0].status=status;
    expect((await recordManualRefund(db.client,"refund-1",{reference:"bank",by:"owner"})).ok).toBe(false);
    expect(db.tables.pending_refunds[0].status).toBe(status);
  });
  it("stopping a queued refund prevents subsequent cron submission",async()=>{
    const db=setup();expect((await stopRefundRetries(db.client,"refund-1","owner")).ok).toBe(true);
    expect(await processRefund(db.client,"ref_old")).toBe("failed");expect(refundTransaction).not.toHaveBeenCalled();
  });
});

describe("operator notifications",()=>{
  it("deduplicates requests, retries mail failures and records only accepted sends",async()=>{
    const db=setup();const input={reference:"ref_old",userId:"user-1",userEmail:"buyer@example.com",kind:"requested" as const,detail:"Request received"};
    await notifyRefundOperator(db.client,input);await notifyRefundOperator(db.client,input);
    expect(db.tables.billing_email_outbox).toHaveLength(1);
    vi.mocked(sendEmail).mockResolvedValueOnce(false);
    expect(await flushBillingEmails(db.client)).toBe(0);expect(db.tables.billing_email_outbox[0].sent_at).toBeUndefined();
    expect(await flushBillingEmails(db.client)).toBe(1);expect(await flushBillingEmails(db.client)).toBe(0);
    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(vi.mocked(sendEmail).mock.calls[0][0]).toMatchObject({to:"support@k53mentorai.co.za",idempotencyKey:"refund-ref_old-requested"});
  });
});

describe("interrupted-claim recovery",()=>{
  it("a returning learner's ordinary cancellation is not mistaken for an unpaid refund",async()=>{
    // money_back_used is lifetime: used once on an earlier charge, then a new
    // plan (ref_new) cancelled outside the guarantee. No request was made.
    const db=refundDb({subscriptions:[paidRow({last_charge_reference:"ref_new",money_back_used:true,cancel_at_period_end:true})],pending_refunds:[refundRow({status:"refunded"})],billing_email_outbox:[requestedNotice("ref_old",HOUR_AGO)]});
    expect((await processPendingRefunds(db.client)).recovered).toBe(0);
    expect(db.tables.pending_refunds).toHaveLength(1);
    expect(db.tables.billing_email_outbox.filter(r=>String(r.id).includes("attention"))).toHaveLength(0);
  });
  it("leaves a request that may still be inside its own cancel call",async()=>{
    const db=refundDb({subscriptions:[paidRow({money_back_used:true,cancel_at_period_end:true})],billing_email_outbox:[requestedNotice("ref_old",()=>new Date().toISOString())]});
    expect((await processPendingRefunds(db.client)).recovered).toBe(0);
  });
  it("ignores a request whose claim was released",async()=>{
    const db=refundDb({subscriptions:[paidRow({money_back_used:false})],billing_email_outbox:[requestedNotice("ref_old",HOUR_AGO)]});
    expect((await processPendingRefunds(db.client)).recovered).toBe(0);
  });
});

describe("admin reconciliation",()=>{
  const timedOut = async (db: ReturnType<typeof setup>) => {
    vi.mocked(refundTransaction).mockRejectedValueOnce(new Error("The operation was aborted due to timeout"));
    expect(await processRefund(db.client,"ref_old")).toBe("needs_attention");
  };
  it("re-checks a needs_attention refund and adopts the one Paystack did accept",async()=>{
    const db=setup();await timedOut(db);
    vi.mocked(listTransactionRefunds).mockResolvedValue([{id:9,status:"pending",amount:6000}]);
    expect((await retryRefundNow(db.client,"refund-1")).ok).toBe(true);
    expect(db.tables.pending_refunds[0]).toMatchObject({status:"processing",provider_refund_id:9});
    expect(refundTransaction).toHaveBeenCalledTimes(1);
  });
  it("submits a needs_attention refund again only when Paystack has none",async()=>{
    const db=setup();await timedOut(db);
    expect((await retryRefundNow(db.client,"refund-1")).ok).toBe(true);
    expect(db.tables.pending_refunds[0].status).toBe("processing");expect(refundTransaction).toHaveBeenCalledTimes(2);
  });
  it("leaves a submission that is still running alone",async()=>{
    const db=setup();Object.assign(db.tables.pending_refunds[0],{status:"submitting",updated_at:new Date().toISOString()});
    expect((await retryRefundNow(db.client,"refund-1")).ok).toBe(false);
    expect(db.tables.pending_refunds[0].status).toBe("submitting");expect(refundTransaction).not.toHaveBeenCalled();
  });
  it("retries an exhausted refund without spending attempts, and a refusal leaves it stopped",async()=>{
    const db=setup();Object.assign(db.tables.pending_refunds[0],{status:"failed",attempts:REFUND_MAX_ATTEMPTS});
    vi.mocked(refundTransaction).mockRejectedValueOnce(new PaystackError("Insufficient balance to process refund",400));
    const refused=await retryRefundNow(db.client,"refund-1");
    expect(refused).toMatchObject({ok:false});expect(refused.message).toContain("Insufficient balance");
    expect(db.tables.pending_refunds[0]).toMatchObject({status:"failed",attempts:REFUND_MAX_ATTEMPTS});
    expect((await retryRefundNow(db.client,"refund-1")).ok).toBe(true);
    expect(db.tables.pending_refunds[0]).toMatchObject({status:"processing",attempts:REFUND_MAX_ATTEMPTS});
  });
  it("a refund Paystack failed does not block a fresh one",async()=>{
    const db=setup();vi.mocked(listTransactionRefunds).mockResolvedValue([{id:8,status:"failed",amount:6000}]);
    expect(await processRefund(db.client,"ref_old")).toBe("processing");
    expect(db.tables.pending_refunds[0].provider_refund_id).toBe(9);
  });
  it("stops a needs_attention refund for EFT only once Paystack has nothing that could still pay",async()=>{
    const db=setup();await timedOut(db);
    vi.mocked(listTransactionRefunds).mockResolvedValue([{id:9,status:"processing",amount:6000}]);
    expect((await stopRefundRetries(db.client,"refund-1","owner")).ok).toBe(false);
    expect(db.tables.pending_refunds[0].status).toBe("needs_attention");
    vi.mocked(listTransactionRefunds).mockResolvedValue([{id:9,status:"processed",amount:6000}]);
    expect((await stopRefundRetries(db.client,"refund-1","owner")).ok).toBe(false);
    vi.mocked(listTransactionRefunds).mockResolvedValue([{id:9,status:"failed",amount:6000}]);
    expect((await stopRefundRetries(db.client,"refund-1","owner")).ok).toBe(true);
    expect(db.tables.pending_refunds[0].status).toBe("failed");
    expect((await recordManualRefund(db.client,"refund-1",{reference:"EFT 1",by:"owner"})).ok).toBe(true);
    expect(db.tables.pending_refunds[0]).toMatchObject({status:"refunded",manual_reference:"EFT 1"});
  });
  it("will not stop a needs_attention refund when Paystack can't be asked",async()=>{
    const db=setup();await timedOut(db);
    vi.mocked(verifyTransaction).mockRejectedValue(new Error("paystack down"));
    expect((await stopRefundRetries(db.client,"refund-1","owner")).ok).toBe(false);
    expect(db.tables.pending_refunds[0].status).toBe("needs_attention");
  });
});

describe("attention alerts",()=>{
  const attentionIds = (db: ReturnType<typeof setup>) => (db.tables.billing_email_outbox ?? []).map(r=>String(r.id)).filter(id=>id.includes("-attention-"));
  it("repeat refusals stay one email, but a later, different problem still reaches support",async()=>{
    const db=setup();vi.mocked(refundTransaction).mockRejectedValue(new PaystackError("Insufficient balance to process refund",400));
    await processRefund(db.client,"ref_old");await processRefund(db.client,"ref_old");
    expect(attentionIds(db)).toHaveLength(1);
    db.tables.pending_refunds[0].attempts=REFUND_MAX_ATTEMPTS;
    expect(await processRefund(db.client,"ref_old")).toBe("failed");
    expect(attentionIds(db)).toHaveLength(2);
  });
  it("a refund Paystack fails after accepting it alerts even when an earlier problem already did",async()=>{
    const db=setup();vi.mocked(refundTransaction).mockRejectedValueOnce(new PaystackError("Insufficient balance to process refund",400));
    await processRefund(db.client,"ref_old");
    expect(await processRefund(db.client,"ref_old")).toBe("processing");
    await applyRefundEvent(db.client,"refund.failed",{transaction_reference:"ref_old"});
    expect(attentionIds(db)).toHaveLength(2);
    expect(await flushBillingEmails(db.client,5,{prefix:"refund-ref_old-"})).toBe(2);
  });
});
