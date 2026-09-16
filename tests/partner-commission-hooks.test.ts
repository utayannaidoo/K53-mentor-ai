import {describe,expect,it,vi} from "vitest";
import type {SupabaseClient} from "@supabase/supabase-js";
import {earnSchoolCommission,voidSchoolCommission} from "@/lib/partners/commission";
import {MONEY_BACK_DAYS} from "@/lib/billing/refund-policy";
describe("post-payment partner hooks",()=>{
  it("passes reporting dimensions and the policy hold, never an amount",async()=>{
    const rpc=vi.fn(async()=>({data:null,error:null}));
    for(const plan of ["premium","premium_plus"])for(const cycle of ["monthly","annual"]){
      await earnSchoolCommission({rpc} as unknown as SupabaseClient,"user","charge",plan,cycle);
      expect(rpc).toHaveBeenLastCalledWith("record_school_commission",{p_user:"user",p_reference:"charge",p_plan:plan,p_cycle:cycle,p_hold_days:MONEY_BACK_DAYS+1});
    }
  });
  it("never throws on database errors or rejected calls",async()=>{
    const log=vi.spyOn(console,"error").mockImplementation(()=>{});
    for(const rpc of [vi.fn(async()=>({error:{message:"offline"}})),vi.fn(async()=>{throw Error("offline");})]){
      const admin={rpc} as unknown as SupabaseClient;
      await expect(earnSchoolCommission(admin,"u","r","premium","monthly")).resolves.toBeUndefined();
      await expect(voidSchoolCommission(admin,"r","refund")).resolves.toBeUndefined();
    }
    expect(log).toHaveBeenCalledTimes(4);log.mockRestore();
  });
});
