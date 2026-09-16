import { describe,expect,it,vi } from "vitest";
import { trialDaysRemaining } from "@/lib/billing/trial";
import { defaultUserState } from "@/lib/store/local-store";
import { hydrateAccountState } from "@/lib/store/account-hydrate";
let bonus=0;
const started="2026-09-01T00:00:00Z";
vi.mock("@/lib/supabase/admin",()=>({createAdminClient:()=>({from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{created_at:started,onboarded_at:started,trial_bonus_days:bonus}})})})})})}));
import { isWithinFreeTrial } from "@/lib/billing/entitlements.server";
describe("school trial parity",()=>{
  for(const extra of [0,7]) it(`agrees on every boundary with ${extra} bonus days`,async()=>{
    bonus=extra;
    const state={...defaultUserState(),trialBonusDays:extra,profile:{id:"u",name:"Learner",email:"l@example.com",createdAt:started}};
    for(const day of [0,6,7,9,13,14,15]) {
      const now=Date.parse(started)+day*86400000;
      expect(await isWithinFreeTrial("u",now)).toBe(trialDaysRemaining(state,now)>0);
    }
    expect(trialDaysRemaining(state,Date.parse(started))).toBe(7+extra);
  });
  it("keeps a completed reward across a stale hydration and clears it for another account",()=>{
    const state={...defaultUserState(),trialBonusDays:7,ownerEmail:"a@example.com"};
    expect(hydrateAccountState(state,{trialBonusDays:0},null,"a@example.com").trialBonusDays).toBe(7);
    expect(hydrateAccountState(state,{trialBonusDays:0},null,"b@example.com").trialBonusDays).toBe(0);
  });
});
