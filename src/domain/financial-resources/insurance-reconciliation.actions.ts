"use server";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";
export async function reconcileInsuranceClaim(input:{claimId:string;reconciledSubunits:number;patientResponsibilitySubunits:number}) {
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) return {success:false,error:"Unauthorized"} as const;
 const {data:u}=await supabase.from("clinic_users").select("id,tenant_id,is_active").eq("auth_user_id",user.id).maybeSingle(); if(!u?.is_active) return {success:false,error:"Clinic user not found"} as const;
 if(!(await hasEffectivePermission(user.id,"insurance:manage"))) return {success:false,error:"Permission denied"} as const;
 const {data,error}=await supabase.rpc("reconcile_insurance_claim",{p_tenant_id:u.tenant_id,p_claim_id:input.claimId,p_reconciled_subunits:input.reconciledSubunits,p_patient_responsibility_subunits:input.patientResponsibilitySubunits,p_reconciled_by:u.id});
 if(error) return {success:false,error:error.message} as const; return data as {success:boolean;error?:string;claim_id?:string;patient_balance_subunits?:number};
}
