import { afterEach,describe,expect,it } from "vitest";
import { partnerDb,hasPartnerDb,seed,claim,earn,user,type TestDb } from "./partner-db";
let db:TestDb;
afterEach(async()=>{if(db) await db.close();});
describe.skipIf(!hasPartnerDb)("school commission SQL",()=>{
  it("earns exactly R20 across all four plan/cycle pairs and never on renewal",async()=>{
    db=await partnerDb(); await seed(db,4);
    let n=0;
    for(const plan of ["premium","premium_plus"]) for(const cycle of ["monthly","annual"]) {
      n++; await claim(db,n); expect(await earn(db,n,plan,cycle)).toBeTruthy();
      expect((await db.query(`select record_school_commission($1,$2,$3,$4,8) as id`,[user(n),`charge-${n}`,plan,cycle])).rows[0].id).toBeNull();
    }
    expect((await db.query(`select amount_cents from partner_commissions`)).rows.map(r=>r.amount_cents)).toEqual([2000,2000,2000,2000]);
    expect((await db.query(`select record_school_commission($1,'renewal','premium','annual',8) as id`,[user(1)])).rows[0].id).toBeNull();
  },30000);
  it("snapshots a negotiated rate and honours a reversal delivered before earning",async()=>{
    db=await partnerDb(); await seed(db); await claim(db);
    await db.exec(`update partner_schools set commission_cents=2500; select reverse_school_charge('charge-1','refund');`);
    await earn(db);
    expect((await db.query(`select amount_cents,status from partner_commissions`)).rows[0]).toEqual({amount_cents:2500,status:"void"});
    await db.exec(`select mature_school_commissions()`);
    expect((await db.query(`select status from partner_commissions`)).rows[0].status).toBe("void");
  },30000);
});
