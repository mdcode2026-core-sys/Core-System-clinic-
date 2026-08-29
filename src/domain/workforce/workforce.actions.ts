"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: clinicUser } = await supabase.from("clinic_users").select("id,tenant_id,is_active").eq("auth_user_id", user.id).maybeSingle();
  if (!clinicUser?.is_active) return null;
  return { supabase, user, clinicUser, tenantId: clinicUser.tenant_id };
}

async function allowed(userId: string, permission: string) { return hasEffectivePermission(permission, userId); }

export async function createWorkforcePosition(input: { name: string; name_ar?: string; department?: string; employment_type?: string; default_capacity?: number }) {
  const ctx = await context(); if (!ctx) return { success:false,error:"Unauthorized" } as const;
  if (!(await allowed(ctx.user.id,"workforce:manage"))) return { success:false,error:"Permission denied" } as const;
  if (!input.name.trim()) return { success:false,error:"Position name is required" } as const;
  const { data,error } = await ctx.supabase.from("workforce_positions").insert({ tenant_id:ctx.tenantId,name:input.name.trim(),name_ar:input.name_ar||null,department:input.department||null,employment_type:input.employment_type||"full_time",default_capacity:input.default_capacity??1,created_by:ctx.clinicUser.id }).select("id").single();
  if (error||!data) return { success:false,error:error?.message||"Unable to create position" } as const;
  revalidatePath("/workforce"); return { success:true,data } as const;
}

export async function createEmployee(input: { first_name:string; last_name:string; employee_number?:string; position_id?:string|null; user_id?:string|null; phone?:string; email?:string; hire_date?:string|null }) {
  const ctx = await context(); if (!ctx) return { success:false,error:"Unauthorized" } as const;
  if (!(await allowed(ctx.user.id,"workforce:manage"))) return { success:false,error:"Permission denied" } as const;
  if (!input.first_name.trim()||!input.last_name.trim()) return { success:false,error:"Employee name is required" } as const;
  const { data,error } = await ctx.supabase.from("workforce_employees").insert({ tenant_id:ctx.tenantId,first_name:input.first_name.trim(),last_name:input.last_name.trim(),employee_number:input.employee_number||null,position_id:input.position_id||null,user_id:input.user_id||null,phone:input.phone||null,email:input.email||null,hire_date:input.hire_date||null,created_by:ctx.clinicUser.id }).select("id").single();
  if (error||!data) return { success:false,error:error?.message||"Unable to create employee" } as const;
  revalidatePath("/workforce"); return { success:true,data } as const;
}

export async function recordAttendance(input:{employee_id:string;attendance_date:string;status:string;check_in?:string|null;check_out?:string|null;overtime_minutes?:number;notes?:string|null}) {
  const ctx=await context(); if(!ctx) return {success:false,error:"Unauthorized"} as const;
  if(!(await allowed(ctx.user.id,"workforce:attendance"))) return {success:false,error:"Permission denied"} as const;
  const {data,error}=await ctx.supabase.from("workforce_attendance").upsert({tenant_id:ctx.tenantId,...input,check_in:input.check_in||null,check_out:input.check_out||null,overtime_minutes:input.overtime_minutes||0,recorded_by:ctx.clinicUser.id},{onConflict:"tenant_id,employee_id,attendance_date"}).select("id").single();
  if(error||!data) return {success:false,error:error?.message||"Unable to record attendance"} as const;
  revalidatePath("/workforce"); return {success:true,data} as const;
}

export async function createLeaveRequest(input:{employee_id:string;leave_type_id:string;starts_on:string;ends_on:string;days:number;reason?:string|null}) {
  const ctx=await context(); if(!ctx) return {success:false,error:"Unauthorized"} as const;
  if(!(await allowed(ctx.user.id,"workforce:leave")) && !(await allowed(ctx.user.id,"workforce:manage"))) return {success:false,error:"Permission denied"} as const;
  if(input.days<=0||input.ends_on<input.starts_on) return {success:false,error:"Invalid leave range"} as const;
  const {data,error}=await ctx.supabase.from("workforce_leave_requests").insert({tenant_id:ctx.tenantId,...input,created_by:ctx.clinicUser.id}).select("id").single();
  if(error||!data) return {success:false,error:error?.message||"Unable to create leave request"} as const;
  revalidatePath("/workforce"); return {success:true,data} as const;
}

export async function createPayrollPeriod(input:{period_start:string;period_end:string;currency?:string}) {
  const ctx=await context(); if(!ctx) return {success:false,error:"Unauthorized"} as const;
  if(!(await allowed(ctx.user.id,"workforce:payroll"))) return {success:false,error:"Permission denied"} as const;
  const {data,error}=await ctx.supabase.from("workforce_payroll_periods").insert({tenant_id:ctx.tenantId,period_start:input.period_start,period_end:input.period_end,currency:input.currency||"JOD",created_by:ctx.clinicUser.id}).select("id").single();
  if(error||!data) return {success:false,error:error?.message||"Unable to create payroll period"} as const;
  revalidatePath("/workforce"); return {success:true,data} as const;
}

export async function createCommissionRule(input:{name:string;basis:string;rate?:number;fixed_amount_subunits?:number;notes?:string|null}) {
  const ctx=await context(); if(!ctx) return {success:false,error:"Unauthorized"} as const;
  if(!(await allowed(ctx.user.id,"workforce:commission"))) return {success:false,error:"Permission denied"} as const;
  if(!input.name.trim()) return {success:false,error:"Commission rule name is required"} as const;
  const {data,error}=await ctx.supabase.from("workforce_commission_rules").insert({tenant_id:ctx.tenantId,name:input.name.trim(),basis:input.basis,rate:input.rate||0,fixed_amount_subunits:input.fixed_amount_subunits||0,notes:input.notes||null,created_by:ctx.clinicUser.id}).select("id").single();
  if(error||!data) return {success:false,error:error?.message||"Unable to create commission rule"} as const;
  revalidatePath("/workforce"); return {success:true,data} as const;
}
