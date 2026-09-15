import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MONEY_BACK_DAYS } from "@/lib/billing/refund-policy";

/** Post-grant work never releases a successful payment's idempotency ledger. */
async function bestEffort(admin: SupabaseClient, name: string, args: Record<string, unknown> = {}): Promise<unknown> {
  try {
    const {data,error}=await admin.rpc(name,args);
    if(error) console.error(`[partners] ${name} failed; manual reconciliation required`,args,error.message);
    return error?null:data;
  } catch(error) {
    console.error(`[partners] ${name} threw; manual reconciliation required`,args,error);
    return null;
  }
}
export async function earnSchoolCommission(admin:SupabaseClient,userId:string,reference:string,plan:string,cycle:string) {
  // Plan and cycle are reporting dimensions only. The RPC snapshots the
  // school's integer-cent rate; the charge amount never enters this path.
  await bestEffort(admin,"record_school_commission",{p_user:userId,p_reference:reference,p_plan:plan,p_cycle:cycle,p_hold_days:MONEY_BACK_DAYS+1});
}
export async function voidSchoolCommission(admin:SupabaseClient,reference:string,reason:string) {
  await bestEffort(admin,"reverse_school_charge",{p_reference:reference,p_reason:reason});
}
export async function matureSchoolCommissions(admin:SupabaseClient):Promise<number> {
  const count=await bestEffort(admin,"mature_school_commissions");
  console.error("[partners] commissions matured",count??"failed");
  try {
    const {count:held,error}=await admin.from("partner_commissions").select("id",{count:"exact",head:true}).eq("status","pending").not("hold_reason","is",null);
    if(error) console.error("[partners] held count failed",error.message);
    else console.error("[partners] commissions held for review",held??0);
  } catch(error){console.error("[partners] held count failed",error);}
  return typeof count==="number"?count:0;
}
