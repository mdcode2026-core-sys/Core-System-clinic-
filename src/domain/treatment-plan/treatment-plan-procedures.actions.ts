"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";

export type TreatmentPlanProcedureOption = { id: string; name: string };

export async function getTreatmentPlanProcedureOptions(): Promise<TreatmentPlanProcedureOption[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) throw new Error("No tenant assigned");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  if (!permissions.includes("treatment_plans:read")) throw new Error("Permission denied: treatment_plans:read required");

  const { data, error } = await supabase
    .from("clinic_procedures")
    .select("id,procedure_name")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("procedure_name", { ascending: true });

  if (error) throw new Error(`Treatment plan procedures fetch failed: ${error.message}`);
  return (data ?? []).map((row) => ({ id: row.id, name: row.procedure_name }));
}
