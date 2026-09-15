import { afterEach,describe,expect,it } from "vitest";
import { partnerDb,hasPartnerDb,seed,claim,earn,user,school,type TestDb } from "./partner-db";
let db:TestDb;
afterEach(async()=>{if(db) await db.close();});
describe.skipIf(!hasPartnerDb)("partner EFT SQL",()=>{
  it("enforces minimum, supports override, and cannot settle a commission twice",async()=>{
    db=await partnerDb(); await seed(db); await claim(db); await earn(db);
    await db.exec(`update partner_commissions set eligible_at=now()-interval '1 day'; select mature_school_commissions();`);
    await expect(db.query(`select mark_partner_payout_paid($1,'eft','note')`,[school])).rejects.toThrow("minimum");
    const paid=await db.query(`select mark_partner_payout_paid($1,'eft','note',10000,true) as id`,[school]);
    expect(paid.rows[0].id).toBeTruthy();
    expect((await db.query(`select mark_partner_payout_paid($1,'eft','note',10000,true) as id`,[school])).rows[0].id).toBeNull();
    expect((await db.query(`select count(*)::int as n from partner_payouts`)).rows[0].n).toBe(1);
    await db.query(`select void_school_commission($1,'chargeback')`,[user(1)]);
    expect((await db.query(`select status,void_reason from partner_commissions`)).rows[0]).toEqual({status:"paid",void_reason:"chargeback"});
  },30000);

  // 0034. A payable balance exactly cancelled by an outstanding clawback used
  // to return null and leave both sides stuck against each other forever.
  it("settles a payout fully offset by a clawback instead of deadlocking",async()=>{
    db=await partnerDb(); await seed(db,2);
    await claim(db,1); await earn(db,1);
    await db.exec(`update partner_commissions set eligible_at=now()-interval '1 day'; select mature_school_commissions();`);
    await db.query(`select mark_partner_payout_paid($1,'eft-1','first',10000,true)`,[school]);
    // That paid R20 is refunded, becoming a R20 debt carried to the next run.
    await db.query(`select void_school_commission($1,'chargeback')`,[user(1)]);
    // A second conversion earns exactly what is owed back: net zero.
    await claim(db,2); await earn(db,2);
    await db.exec(`update partner_commissions set eligible_at=now()-interval '1 day' where status='pending'; select mature_school_commissions();`);
    const offset=await db.query(`select mark_partner_payout_paid($1,'eft-2','offset',10000,true) as id`,[school]);
    expect(offset.rows[0].id).toBeTruthy();
    // No money moves, but nothing is left dangling: the payout is R0, the new
    // commission is paid, and the clawback is marked settled by it.
    expect((await db.query(`select total_cents from partner_payouts order by created_at desc limit 1`)).rows[0].total_cents).toBe(0);
    expect((await db.query(`select count(*)::int as n from partner_commissions where status='payable'`)).rows[0].n).toBe(0);
    expect((await db.query(`select count(*)::int as n from partner_commissions where void_reason is not null and clawback_settled_payout_id is null`)).rows[0].n).toBe(0);
  },30000);
});
