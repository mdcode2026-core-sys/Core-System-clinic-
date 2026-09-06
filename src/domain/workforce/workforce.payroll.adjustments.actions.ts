"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: clinicUser } = await supabase.from("clinic_users").select("id,tenant_id,is_active,deleted_at").eq("auth_user_id", user.id).maybeSingle();
  if (!clinicUser?.is_active || clinicUser.deleted_at) return null;
  return { supabase, user, clinicUser, tenantId: clinicUser.tenant_id };
}
const cleanOptional = (value?: string) => value && value !== "null" && value !== "undefined" && value.trim() ? value : undefined;
export async function createEmployeeAdvance(input: { employee_id: string; advance_type: "short_term" | "installment"; amount_subunits: number; currency: string; disbursed_on: string; deduction_payroll_period_id?: string; installment_amount_subunits?: number; installment_frequency?: "monthly"; installment_start_date?: string; reason?: string; }) {
  const ctx = await context(); if (!ctx) return { success: false, error: "Unauthorized" } as const;
  if (!(await hasEffectivePermission("workforce:payroll", ctx.user.id))) return { success: false, error: "Permission denied" } as const;
  const advanceType = input.advance_type, deductionPeriod = cleanOptional(input.deduction_payroll_period_id), installmentStart = cleanOptional(input.installment_start_date), installmentAmount = input.installment_amount_subunits && input.installment_amount_subunits > 0 ? input.installment_amount_subunits : undefined;
  if (advanceType === "short_term" && !deductionPeriod) return { success: false, error: "Short-term advance requires a payroll period" } as const;
  if (advanceType === "installment" && (!installmentAmount || !installmentStart)) return { success: false, error: "Installment advance requires installment amount and start date" } as const;
  const { data, error } = await ctx.supabase.rpc("create_workforce_employee_advance", { p_tenant_id: ctx.tenantId, p_employee_id: input.employee_id, p_advance_type: advanceType, p_amount_subunits: Math.max(0, input.amount_subunits), p_currency: input.currency, p_disbursed_on: input.disbursed_on, p_deduction_payroll_period_id: deductionPeriod ?? null, p_installment_amount_subunits: installmentAmount ?? null, p_installment_frequency: advanceType === "installment" ? "monthly" : null, p_installment_start_date: installmentStart ?? null, p_reason: cleanOptional(input.reason) ?? null, p_created_by: ctx.clinicUser.id });
  if (error || !data) return { success: false, error: error?.message || "Unable to create advance" } as const; if (data.success === false) return data as { success: false; error: string }; revalidatePath("/workforce"); revalidatePath("/workforce/payroll"); return { success: true, data } as const;
}
export async function createPayrollDeduction(input: { employee_id: string; payroll_period_id: string; deduction_type: string; amount_subunits: number; currency: string; source_type: string; reason?: string; }) {
  const ctx = await context(); if (!ctx) return { success: false, error: "Unauthorized" } as const;
  if (!(await hasEffectivePermission("workforce:payroll", ctx.user.id))) return { success: false, error: "Permission denied" } as const;
  const { data, error } = await ctx.supabase.rpc("create_workforce_payroll_deduction", { p_tenant_id: ctx.tenantId, p_employee_id: input.employee_id, p_payroll_period_id: input.payroll_period_id, p_deduction_type: input.deduction_type, p_amount_subunits: Math.max(0, input.amount_subunits), p_currency: input.currency, p_source_type: input.source_type, p_source_id: null, p_reason: cleanOptional(input.reason) ?? null, p_created_by: ctx.clinicUser.id });
  if (error || !data) return { success: false, error: error?.message || "Unable to create deduction" } as const; if (data.success === false) return data as { success: false; error: string }; revalidatePath("/workforce"); revalidatePath("/workforce/payroll"); return { success: true, data } as const;
}
