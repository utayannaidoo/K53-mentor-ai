import { afterEach,describe,expect,it } from "vitest";
import { partnerDb,hasPartnerDb,seed,claim,earn,school,type TestDb } from "./partner-db";
let db:TestDb;
afterEach(async()=>{if(db) await db.close();});
describe.skipIf(!hasPartnerDb)("partner leak controls SQL",()=>{
  it("rotates atomically without disturbing existing credit",async()=>{
    db=await partnerDb(); await seed(db,2); await claim(db);
    await db.query(`select rotate_school_code($1,'new-school','Leaked flyer')`,[school]);
    expect(await claim(db,2)).toBeNull();
    expect((await db.query(`select code_used from school_referrals`)).rows[0].code_used).toBe("kasi-school");
    await expect(db.query(`select rotate_school_code($1,'BAD!','test')`,[school])).rejects.toThrow();
    expect((await db.query(`select code from partner_school_codes where status='active'`)).rows[0].code).toBe("new-school");
  },30000);
  it("holds money, never attribution; release cannot bypass time or suspension",async()=>{
    db=await partnerDb(); await seed(db,3);
    await db.exec(`update partner_schools set review_threshold=1`);
    for(let n=1;n<=3;n++){expect(await claim(db,n)).toBeTruthy(); await earn(db,n);}
    expect((await db.query(`select mature_school_commissions() as n`)).rows[0].n).toBe(0);
    await db.exec(`update partner_commissions set eligible_at=now()-interval '1 day'; select mature_school_commissions()`);
    expect((await db.query(`select count(*)::int as n from partner_commissions where hold_reason is not null`)).rows[0].n).toBe(3);
    await db.exec(`update partner_schools set status='suspended'`);
    expect((await db.query(`select release_held_commissions($1) as n`,[school])).rows[0].n).toBe(0);
    await db.exec(`update partner_schools set status='active'`);
    expect((await db.query(`select release_held_commissions($1) as n`,[school])).rows[0].n).toBe(3);
  },30000);
  it("bounds monthly maturation and preserves the hold until review",async()=>{
    db=await partnerDb(); await seed(db,2); await db.exec(`update partner_schools set monthly_commission_cap=1`);
    for(let n=1;n<=2;n++){await claim(db,n);await earn(db,n);}
    await db.exec(`update partner_commissions set eligible_at=now()-interval '1 day'`);
    expect((await db.query(`select mature_school_commissions() as n`)).rows[0].n).toBe(1);
    expect((await db.query(`select hold_reason from partner_commissions where status='pending'`)).rows[0].hold_reason).toContain("Monthly");
  },30000);
});
