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

export async function createPayrollEarning(input: { employee_id: string; payroll_period_id: string; earning_type: "allowance" | "overtime" | "bonus" | "other_earning"; amount_subunits: number; currency: string; source_type?: "attendance" | "leave" | "bonus" | "manual"; source_id?: string; reason?: string; }) {
  const ctx = await context();
  if (!ctx) return { success: false, error: "Unauthorized" } as const;
  if (!(await hasEffectivePermission("workforce:payroll", ctx.user.id))) return { success: false, error: "Permission denied" } as const;
  const { data, error } = await ctx.supabase.rpc("create_workforce_payroll_earning", { p_tenant_id: ctx.tenantId, p_employee_id: input.employee_id, p_payroll_period_id: input.payroll_period_id, p_earning_type: input.earning_type, p_amount_subunits: Math.max(0, input.amount_subunits), p_currency: input.currency, p_source_type: input.source_type ?? "manual", p_source_id: input.source_id ?? null, p_reason: input.reason?.trim() || null, p_created_by: ctx.clinicUser.id });
  if (error || !data) return { success: false, error: error?.message || "Unable to create earning" } as const;
  if (data.success === false) return data as { success: false; error: string };
  revalidatePath("/workforce/payroll");
  return { success: true, data } as const;
}

export async function issuePayrollPayslip(payrollEntryId: string) {
  const ctx = await context();
  if (!ctx) return { success: false, error: "Unauthorized" } as const;
  if (!(await hasEffectivePermission("workforce:payroll", ctx.user.id))) return { success: false, error: "Permission denied" } as const;
  const { data, error } = await ctx.supabase.rpc("create_workforce_payslip_for_entry", { p_tenant_id: ctx.tenantId, p_payroll_entry_id: payrollEntryId, p_created_by: ctx.clinicUser.id });
  if (error || !data) return { success: false, error: error?.message || "Unable to issue payslip" } as const;
  if (data.success === false) return data as { success: false; error: string };
  revalidatePath("/workforce/payroll");
  return { success: true, data } as const;
}
