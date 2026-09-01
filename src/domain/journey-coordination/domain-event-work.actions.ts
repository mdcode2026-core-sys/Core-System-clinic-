"use server";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";
export async function createWorkFromDomainEvent(input:{eventType:string;sourceType:string;sourceId:string;patientId?:string|null;title:string;requiredPermission:string}) {
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) return {success:false,error:"Unauthorized"} as const;
 const {data:u}=await supabase.from("clinic_users").select("id,tenant_id,is_active").eq("auth_user_id",user.id).maybeSingle(); if(!u?.is_active) return {success:false,error:"Clinic user not found"} as const;
 if(!(await hasEffectivePermission(user.id,input.requiredPermission))) return {success:false,error:"Permission denied"} as const;
 const {data,error}=await supabase.rpc("create_operational_work_from_domain_event",{p_tenant_id:u.tenant_id,p_event_type:input.eventType,p_source_type:input.sourceType,p_source_id:input.sourceId,p_patient_id:input.patientId??null,p_title:input.title,p_required_permission:input.requiredPermission,p_requested_by:u.id});
 if(error) return {success:false,error:error.message} as const; return data as {success:boolean;error?:string;work_item_id?:string;idempotent?:boolean};
}
