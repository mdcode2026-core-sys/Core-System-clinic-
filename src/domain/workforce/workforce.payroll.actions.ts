"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: clinicUser } = await supabase
    .from("clinic_users")
    .select("id,tenant_id,is_active,deleted_at")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!clinicUser?.is_active || clinicUser.deleted_at) return null;
  return { supabase, user, clinicUser, tenantId: clinicUser.tenant_id };
}

export async function createPayrollEntryFromWorkforce(input: {
  payroll_period_id: string;
  employee_id: string;
  allowances_subunits?: number;
  overtime_subunits?: number;
  bonuses_subunits?: number;
  deductions_subunits?: number;
}) {
  const ctx = await context();
  if (!ctx) return { success: false, error: "Unauthorized" } as const;
  if (!(await hasEffectivePermission(ctx.user.id, "workforce:payroll"))) {
    return { success: false, error: "Permission denied" } as const;
  }

  const { data, error } = await ctx.supabase.rpc("create_workforce_payroll_entry_with_commissions", {
    p_tenant_id: ctx.tenantId,
    p_payroll_period_id: input.payroll_period_id,
    p_employee_id: input.employee_id,
    p_allowances_subunits: Math.max(0, input.allowances_subunits ?? 0),
    p_overtime_subunits: Math.max(0, input.overtime_subunits ?? 0),
    p_bonuses_subunits: Math.max(0, input.bonuses_subunits ?? 0),
    p_deductions_subunits: Math.max(0, input.deductions_subunits ?? 0),
    p_created_by: ctx.clinicUser.id,
  });

  if (error || !data) return { success: false, error: error?.message || "Unable to generate payroll entry" } as const;
  if (data.success === false) return data as { success: false; error: string };

  revalidatePath("/workforce");
  return { success: true, data } as const;
}
