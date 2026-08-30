"use server";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";
export async function consumeProcedureInventory(input:{visitId:string;treatmentPlanItemId?:string|null;itemId:string;quantity:number;reason?:string}) {
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) return {success:false,error:"Unauthorized"} as const;
 const {data:u}=await supabase.from("clinic_users").select("id,tenant_id,is_active").eq("auth_user_id",user.id).maybeSingle(); if(!u?.is_active) return {success:false,error:"Clinic user not found"} as const;
 if(!(await hasEffectivePermission(user.id,"inventory:adjust"))) return {success:false,error:"Permission denied"} as const;
 const {data,error}=await supabase.rpc("consume_procedure_inventory",{p_tenant_id:u.tenant_id,p_visit_id:input.visitId,p_treatment_plan_item_id:input.treatmentPlanItemId??null,p_item_id:input.itemId,p_quantity:input.quantity,p_consumed_by:u.id,p_reason:input.reason??"Procedure consumption"});
 if(error) return {success:false,error:error.message} as const; return data as {success:boolean;error?:string;new_stock?:number};
}
