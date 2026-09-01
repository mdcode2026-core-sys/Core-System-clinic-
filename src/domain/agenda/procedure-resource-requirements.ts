import type { SupabaseClient } from "@supabase/supabase-js";
export async function validateProcedureResourcesForBooking(supabase: SupabaseClient, tenantId: string, procedureId: string, resourceId: string | null) {
 const { data, error } = await supabase.rpc("validate_procedure_resources_for_booking", { p_tenant_id: tenantId, p_procedure_id: procedureId, p_resource_id: resourceId });
 if (error) throw new Error(`Procedure resource validation failed: ${error.message}`);
 return data as { valid: boolean; required_count: number; matched_count?: number; error?: string };
}
