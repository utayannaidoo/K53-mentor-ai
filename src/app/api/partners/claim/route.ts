import { z } from "zod";
import { createHmac } from "node:crypto";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ACCOUNT_DAILY_LIMIT,clientIp,limitCheckout,limitUserDaily } from "@/lib/ai/rate-limit";
import { normaliseSchoolCode,validSchoolCode,schoolClaimMessage } from "@/lib/partners/codes";
export const runtime="nodejs";
const schema=z.object({code:z.string().max(32).transform(normaliseSchoolCode).refine(validSchoolCode),source:z.enum(["manual","link"]).default("manual")});
export async function POST(req:Request) {
  if(!isSupabaseConfigured) return Response.json({error:"Not configured"},{status:501});
  const rl=await limitCheckout(clientIp(req));
  if(!rl.success) return Response.json({error:"Please try again later"},{status:429,headers:{"Retry-After":String(rl.retryAfter)}});
  const client=await createClient(); const {data:{user}}=await client!.auth.getUser();
  if(!user) return Response.json({error:"Unauthorized"},{status:401});
  const daily=await limitUserDaily("school_claim",user.id,ACCOUNT_DAILY_LIMIT.school_claim);
  if(!daily.success) return Response.json({error:"Please try again tomorrow"},{status:429,headers:{"Retry-After":String(daily.retryAfter)}});
  const parsed=schema.safeParse(await req.json().catch(()=>null));
  if(!parsed.success) return Response.json({error:"Enter a valid school code"},{status:400});
  const admin=createAdminClient(); if(!admin) return Response.json({error:"Not configured"},{status:501});
  const key=process.env.PARTNER_SECRET||process.env.CRON_SECRET;
  const ip=clientIp(req);
  const ipHash=key&&ip!=="unknown"?createHmac("sha256",key).update(`school-ip:${ip}`).digest("hex"):null;
  const {data,error}=await admin.rpc("claim_school_referral",{p_user:user.id,p_code:parsed.data.code,p_source:parsed.data.source,p_ip_hash:ipHash});
  if(error){console.error("school claim failed",error.message);return Response.json({error:"We couldn't apply that code. Please try again."},{status:500});}
  return Response.json({ok:typeof data==="string",school:data??null,message:data?schoolClaimMessage(data):"That code couldn't be applied. It may be inactive, or your account may already be credited or have paid."});
}
