"use server";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";

export type CommercialSaleInput = { patientId: string; serviceId?: string | null; packageId?: string | null; offerId?: string | null; financialPlanId?: string | null };
export async function executeCommercialSale(input: CommercialSaleInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" } as const;
  const { data: clinicUser } = await supabase.from("clinic_users").select("id,tenant_id,is_active").eq("auth_user_id", user.id).maybeSingle();
  if (!clinicUser?.is_active) return { success: false, error: "Clinic user not found" } as const;
  if (!(await hasEffectivePermission(user.id, "packages:sell"))) return { success: false, error: "Permission denied" } as const;
  const result = await supabase.rpc("execute_commercial_sale", { p_tenant_id: clinicUser.tenant_id, p_patient_id: input.patientId, p_service_id: input.serviceId ?? null, p_package_id: input.packageId ?? null, p_offer_id: input.offerId ?? null, p_financial_plan_id: input.financialPlanId ?? null, p_created_by: clinicUser.id });
  if (result.error) return { success: false, error: result.error.message } as const;
  return result.data as { success: boolean; error?: string; gross_subunits?: number; discount_subunits?: number; net_subunits?: number; patient_package_id?: string; financial_plan_id?: string; service_id?: string; package_id?: string; offer_id?: string };
}
