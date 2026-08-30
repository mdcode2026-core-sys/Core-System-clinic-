"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";

async function context(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return null;
  const {data:clinicUser}=await supabase.from("clinic_users").select("id,tenant_id,is_active,deleted_at").eq("auth_user_id",user.id).maybeSingle();
  if(!clinicUser?.is_active||clinicUser.deleted_at)return null;
  return{supabase,user,clinicUser,tenantId:clinicUser.tenant_id};
}
async function allowed(userId:string,permission:string){return hasEffectivePermission(permission,userId);}

export async function createOperatingExpense(input:{category:string;amount_subunits:number;expense_date?:string;description?:string;currency?:string;supplier_id?:string|null}){
  const ctx=await context();if(!ctx||!(await allowed(ctx.user.id,"expenses:manage")))return{success:false,error:"Permission denied"}as const;
  if(!input.category.trim()||!Number.isInteger(input.amount_subunits)||input.amount_subunits<0)return{success:false,error:"Invalid expense"}as const;
  const {data,error}=await ctx.supabase.from("operating_expenses").insert({tenant_id:ctx.tenantId,category:input.category.trim(),amount_subunits:input.amount_subunits,expense_date:input.expense_date||new Date().toISOString().slice(0,10),description:input.description?.trim()||null,currency:input.currency||"JOD",supplier_id:input.supplier_id||null,created_by:ctx.clinicUser.id}).select("id").single();
  if(error||!data)return{success:false,error:error?.message||"Unable to create expense"}as const;
  revalidatePath("/financial-resources");return{success:true,data}as const;
}

export async function createSupplierObligation(input:{supplier_id:string;purchase_order_id?:string|null;amount_subunits:number;due_date?:string|null}){
  const ctx=await context();if(!ctx||!(await allowed(ctx.user.id,"purchasing:manage")))return{success:false,error:"Permission denied"}as const;
  if(!Number.isInteger(input.amount_subunits)||input.amount_subunits<0)return{success:false,error:"Invalid supplier obligation"}as const;
  const {data,error}=await ctx.supabase.from("supplier_obligations").insert({tenant_id:ctx.tenantId,supplier_id:input.supplier_id,purchase_order_id:input.purchase_order_id||null,amount_subunits:input.amount_subunits,due_date:input.due_date||null,created_by:ctx.clinicUser.id}).select("id").single();
  if(error||!data)return{success:false,error:error?.message||"Unable to create supplier obligation"}as const;
  revalidatePath("/financial-resources");return{success:true,data}as const;
}

export async function recordSupplierPayment(input:{supplier_obligation_id:string;amount_subunits:number;payment_method?:string|null;reference?:string|null}){
  const ctx=await context();if(!ctx||!(await allowed(ctx.user.id,"purchasing:manage")))return{success:false,error:"Permission denied"}as const;
  if(!Number.isInteger(input.amount_subunits)||input.amount_subunits<=0)return{success:false,error:"Invalid supplier payment"}as const;
  const {data:obligation}=await ctx.supabase.from("supplier_obligations").select("id,amount_subunits,amount_paid_subunits,status").eq("tenant_id",ctx.tenantId).eq("id",input.supplier_obligation_id).maybeSingle();
  if(!obligation)return{success:false,error:"Supplier obligation not found"}as const;
  if(input.amount_subunits>(obligation.amount_subunits-obligation.amount_paid_subunits))return{success:false,error:"Payment exceeds outstanding supplier obligation"}as const;
  const {data,error}=await ctx.supabase.from("supplier_payments").insert({tenant_id:ctx.tenantId,supplier_obligation_id:input.supplier_obligation_id,amount_subunits:input.amount_subunits,payment_method:input.payment_method||null,reference:input.reference||null,created_by:ctx.clinicUser.id}).select("id").single();
  if(error||!data)return{success:false,error:error?.message||"Unable to record supplier payment"}as const;
  const paid=obligation.amount_paid_subunits+input.amount_subunits;const status=paid===obligation.amount_subunits?"paid":"partially_paid";
  const {error:updateError}=await ctx.supabase.from("supplier_obligations").update({amount_paid_subunits:paid,status,updated_at:new Date().toISOString()}).eq("tenant_id",ctx.tenantId).eq("id",input.supplier_obligation_id);
  if(updateError)return{success:false,error:updateError.message}as const;
  revalidatePath("/financial-resources");return{success:true,data}as const;
}
