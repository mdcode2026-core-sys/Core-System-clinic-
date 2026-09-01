"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";

export async function createCommissionFromCollectedPayment(input:{employee_id:string;commission_rule_id:string;payment_id:string;notes?:string|null}){
  const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return{success:false,error:"Unauthorized"}as const;
  if(!(await hasEffectivePermission("workforce:commission",user.id)))return{success:false,error:"Permission denied"}as const;
  const {data:clinicUser}=await supabase.from("clinic_users").select("id,tenant_id,is_active").eq("auth_user_id",user.id).maybeSingle();if(!clinicUser?.is_active)return{success:false,error:"Unauthorized"}as const;
  const {data:payment}=await supabase.from("invoice_payments").select("id,invoice_id,amount_subunits").eq("id",input.payment_id).eq("tenant_id",clinicUser.tenant_id).maybeSingle();if(!payment)return{success:false,error:"Payment not found"}as const;
  const {data:rule}=await supabase.from("workforce_commission_rules").select("id,basis,rate,fixed_amount_subunits").eq("id",input.commission_rule_id).eq("tenant_id",clinicUser.tenant_id).maybeSingle();if(!rule)return{success:false,error:"Commission rule not found"}as const;
  const basis=rule.basis||"collected_revenue";if(basis!=="collected_revenue")return{success:false,error:`Unsupported commission basis: ${basis}`}as const;
  const eligibleAmount=Number(payment.amount_subunits);const rate=Number(rule.rate||0);const fixed=Number(rule.fixed_amount_subunits||0);const commission=Math.max(0,Math.round(eligibleAmount*rate/100)+fixed);
  const {data,error}=await supabase.from("workforce_commission_entries").insert({tenant_id:clinicUser.tenant_id,employee_id:input.employee_id,commission_rule_id:input.commission_rule_id,source_type:"invoice_payment",source_id:payment.id,source_payment_id:payment.id,basis_amount_subunits:eligibleAmount,eligible_amount_subunits:commission,notes:input.notes||null,created_by:clinicUser.id}).select("id").single();
  if(error||!data)return{success:false,error:error?.message||"Unable to create commission entry"}as const;
  revalidatePath("/workforce");return{success:true,data}as const;
}
