import { afterEach,describe,expect,it } from "vitest";
import { partnerDb,hasPartnerDb,seed,claim,user,school,type TestDb } from "./partner-db";
let db: TestDb;
afterEach(async()=>{if(db) await db.close();});
describe.skipIf(!hasPartnerDb)("school attribution SQL",()=>{
  it("grants both rewards once and keeps friend attribution independent",async()=>{
    db=await partnerDb(); await seed(db);
    await db.query(`update profiles set referral_code='friend01',referred_by=$1`,[school]);
    expect(await claim(db)).toBe("Kasi Driving School"); expect(await claim(db)).toBeNull();
    expect((await db.query(`select cp from streaks`)).rows[0].cp).toBe(250);
    expect((await db.query(`select trial_bonus_days,referral_code from profiles`)).rows[0]).toEqual({trial_bonus_days:7,referral_code:"friend01"});
    await expect(db.query(`update school_referrals set code_used='hijack'`)).rejects.toThrow("immutable");
  },30000);
  it("rejects self-referral, former payers and pending schools",async()=>{
    db=await partnerDb(); await seed(db,3);
    await db.query(`update auth.users set email='OWNER@example.com' where id=$1`,[user(1)]);
    await db.query(`update subscriptions set tier='premium',paid_at=now() where user_id=$1`,[user(2)]);
    await db.query(`update subscriptions set tier='free',paid_at=null where user_id=$1`,[user(2)]);
    expect(await claim(db,1)).toBeNull(); expect(await claim(db,2)).toBeNull();
    await db.exec(`update partner_schools set status='pending'`); expect(await claim(db,3)).toBeNull();
    expect((await db.query(`select count(*)::int as n from streaks`)).rows[0].n).toBe(0);
  },30000);
  it("denies every browser role the money RPCs, tables and trial writes",async()=>{
    db=await partnerDb();
    const {rows}=await db.query(`select has_function_privilege('authenticated','record_school_commission(uuid,text,text,text,integer)','EXECUTE') as rpc,
      has_table_privilege('anon','partner_schools','SELECT') as banks,
      has_column_privilege('authenticated','profiles','trial_bonus_days','UPDATE') as bonus`);
    expect(rows[0]).toEqual({rpc:false,banks:false,bonus:false});
    expect((await db.query(`select count(*)::int as n from pg_class where relname like 'partner_%' and relkind='r' and not relrowsecurity`)).rows[0].n).toBe(0);
  },30000);
});
