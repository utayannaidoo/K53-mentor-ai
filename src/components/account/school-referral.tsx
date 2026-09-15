"use client";
import * as React from "react";
import { useStudyStore } from "@/hooks/use-study-store";
import { isSupabaseConfigured } from "@/lib/env";
import { validSchoolCode,normaliseSchoolCode,SCHOOL_STORAGE_KEY } from "@/lib/partners/codes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function SchoolReferralField() {
  const {state,refreshAccount}=useStudyStore();
  const [code,setCode]=React.useState(""); const [message,setMessage]=React.useState(""); const [busy,setBusy]=React.useState(false);
  if(!isSupabaseConfigured||state.hasEverPaid||state.trialBonusDays>0) return null;
  async function claim() {
    if(!validSchoolCode(code)){setMessage("Use the 6–16 character code your school gave you.");return;}
    if(!state.profile){
      try {if(!localStorage.getItem(SCHOOL_STORAGE_KEY)) localStorage.setItem(SCHOOL_STORAGE_KEY,normaliseSchoolCode(code));setMessage("Code saved. We'll apply it when you sign in.");}
      catch {setMessage("Please enter your code after signing in.");} return;
    }
    setBusy(true);
    try {
      const res=await fetch("/api/partners/claim",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({code,source:"manual"})});
      const data=await res.json(); setMessage(data.message??data.error);
      if(data.ok){sessionStorage.setItem("k53.school.confirmation",data.message);window.dispatchEvent(new Event("k53:school-claimed"));await refreshAccount();}
    } catch {setMessage("We couldn't check your code. You can skip this and try in Account later.");}
    finally {setBusy(false);}
  }
  return <Card className="space-y-3 p-5">
    <label htmlFor="school-code" className="block font-semibold">Did a driving school refer you?</label>
    <p className="text-sm text-muted-foreground">Optional. Get 14 days free instead of 7, plus 250 CP. Your price stays the same.</p>
    <div className="flex flex-wrap gap-2"><Input id="school-code" value={code} maxLength={16} autoCapitalize="none" placeholder="School code" onChange={e=>setCode(e.target.value)} className="min-w-0 flex-1"/><Button type="button" variant="secondary" disabled={busy} onClick={claim}>{busy?"Checking…":"Apply code"}</Button></div>
    <p role="status" className="text-sm">{message}</p>
  </Card>;
}

export function SchoolReferralConfirmation() {
  const [message,setMessage]=React.useState("");
  React.useEffect(()=>{
    const read=()=>{try {setMessage(sessionStorage.getItem("k53.school.confirmation")??"");} catch {/* private mode */}};
    read(); window.addEventListener("k53:school-claimed",read); return ()=>window.removeEventListener("k53:school-claimed",read);
  },[]);
  if(!isSupabaseConfigured||!message) return null;
  return <Card className="mb-4 flex flex-wrap items-center gap-3 p-4" role="status"><p className="min-w-0 flex-1 text-sm">{message}</p><Button type="button" variant="ghost" onClick={()=>{sessionStorage.removeItem("k53.school.confirmation");setMessage("");}}>Dismiss</Button></Card>;
}
