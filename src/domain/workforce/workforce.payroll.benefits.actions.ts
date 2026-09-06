"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";

export async function setBenefitEmployeeContribution(input: { benefit_id: string; employee_contribution_subunits: number }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" } as const;
  const { data: clinicUser } = await supabase.from("clinic_users").select("id,tenant_id,is_active,deleted_at").eq("auth_user_id", user.id).maybeSingle();
  if (!clinicUser?.is_active || clinicUser.deleted_at) return { success: false, error: "Unauthorized" } as const;
  if (!(await hasEffectivePermission(user.id, "workforce:payroll"))) return { success: false, error: "Permission denied" } as const;
  const amount = Math.max(0, Math.round(input.employee_contribution_subunits));
  const { data, error } = await supabase.from("workforce_benefits").update({ employee_contribution_subunits: amount, updated_at: new Date().toISOString() }).eq("id", input.benefit_id).eq("tenant_id", clinicUser.tenant_id).select("id").single();
  if (error || !data) return { success: false, error: error?.message || "Unable to update benefit contribution" } as const;
  revalidatePath("/workforce"); revalidatePath("/workforce/payroll");
  return { success: true, data } as const;
}
