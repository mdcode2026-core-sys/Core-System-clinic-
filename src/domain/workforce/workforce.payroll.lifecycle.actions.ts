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

export async function setPayrollPeriodStatus(payrollPeriodId: string, status: "processing" | "locked" | "paid" | "cancelled") {
  const ctx = await context();
  if (!ctx) return { success: false, error: "Unauthorized" } as const;
  if (!(await hasEffectivePermission("workforce:payroll", ctx.user.id))) return { success: false, error: "Permission denied" } as const;
  const { data, error } = await ctx.supabase.rpc("set_workforce_payroll_period_status", { p_tenant_id: ctx.tenantId, p_payroll_period_id: payrollPeriodId, p_status: status, p_actor: ctx.clinicUser.id });
  if (error || !data) return { success: false, error: error?.message || "Unable to change payroll period status" } as const;
  if (data.success === false) return data as { success: false; error: string };
  revalidatePath("/workforce/payroll");
  return { success: true, data } as const;
}

export async function approvePayrollEntry(payrollEntryId: string) {
  const ctx = await context();
  if (!ctx) return { success: false, error: "Unauthorized" } as const;
  if (!(await hasEffectivePermission("workforce:payroll", ctx.user.id))) return { success: false, error: "Permission denied" } as const;
  const { data, error } = await ctx.supabase.rpc("approve_workforce_payroll_entry", { p_tenant_id: ctx.tenantId, p_payroll_entry_id: payrollEntryId, p_approved_by: ctx.clinicUser.id });
  if (error || !data) return { success: false, error: error?.message || "Unable to approve payroll entry" } as const;
  if (data.success === false) return data as { success: false; error: string };
  revalidatePath("/workforce/payroll"); return { success: true, data } as const;
}

export async function payPayrollEntry(payrollEntryId: string) {
  const ctx = await context();
  if (!ctx) return { success: false, error: "Unauthorized" } as const;
  if (!(await hasEffectivePermission("workforce:payroll", ctx.user.id))) return { success: false, error: "Permission denied" } as const;
  const { data, error } = await ctx.supabase.rpc("pay_workforce_payroll_entry", { p_tenant_id: ctx.tenantId, p_payroll_entry_id: payrollEntryId, p_paid_by: ctx.clinicUser.id });
  if (error || !data) return { success: false, error: error?.message || "Unable to pay payroll entry" } as const;
  if (data.success === false) return data as { success: false; error: string };
  revalidatePath("/workforce/payroll"); return { success: true, data } as const;
}
