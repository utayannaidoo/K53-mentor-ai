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
});
