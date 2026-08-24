"use server";

/** PJ Stage 3 — Clinic Service Catalog Server Actions. */
import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type { ClinicProcedureInsert, ClinicProcedureUpdate, ProcedureActionResult } from "./procedures.types";

async function resolveCaller() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw "UNAUTHORIZED";
  const { data: clinicUser, error: clinicError } = await supabase.from("clinic_users").select("tenant_id, role").eq("auth_user_id", user.id).limit(1).maybeSingle();
  if (clinicError || !clinicUser?.tenant_id) throw "TENANT_RESOLUTION_FAILED";
  return { user, tenantId: clinicUser.tenant_id, callerRole: clinicUser.role };
}

async function requirePermission(userId: string, tenantId: string, perm: string) {
  const effectivePerms = await getEffectivePermissions(userId, tenantId);
  if (!effectivePerms.includes(perm as any)) throw "PERMISSION_DENIED";
}

function stableErrorCode(error: unknown): string {
  return typeof error === "string" && /^[A-Z][A-Z0-9_]+$/.test(error) ? error : "UNKNOWN";
}

export async function createProcedure(input: ClinicProcedureInsert): Promise<ProcedureActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "procedures:create");
    const { data, error } = await supabase.from("clinic_procedures").insert({ ...input, tenant_id: tenantId }).select().single();
    if (error) { console.error("[createProcedure] error:", error.message); return { success: false, error: "PROCEDURE_CREATE_FAILED" }; }
    revalidatePath("/settings"); revalidatePath("/agenda"); revalidatePath("/invoices");
    return { success: true, data, error: null };
  } catch (err) {
    const code = stableErrorCode(err); console.error("[createProcedure] error:", code); return { success: false, error: code };
  }
}

export async function updateProcedure(id: string, updates: ClinicProcedureUpdate): Promise<ProcedureActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "procedures:update");
    const { data: existing } = await supabase.from("clinic_procedures").select("id").eq("id", id).eq("tenant_id", tenantId).maybeSingle();
    if (!existing) return { success: false, error: "PROCEDURE_NOT_FOUND" };
    const { data, error } = await supabase.from("clinic_procedures").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).eq("tenant_id", tenantId).select().single();
    if (error) { console.error("[updateProcedure] error:", error.message); return { success: false, error: "PROCEDURE_UPDATE_FAILED" }; }
    revalidatePath("/settings"); revalidatePath("/agenda"); revalidatePath("/invoices");
    return { success: true, data, error: null };
  } catch (err) {
    const code = stableErrorCode(err); console.error("[updateProcedure] error:", code); return { success: false, error: code };
  }
}

export async function toggleProcedureActive(id: string, isActive: boolean): Promise<ProcedureActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "procedures:delete");
    const { data: existing } = await supabase.from("clinic_procedures").select("id").eq("id", id).eq("tenant_id", tenantId).maybeSingle();
    if (!existing) return { success: false, error: "PROCEDURE_NOT_FOUND" };
    const { data, error } = await supabase.from("clinic_procedures").update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", id).eq("tenant_id", tenantId).select().single();
    if (error) { console.error("[toggleProcedureActive] error:", error.message); return { success: false, error: "PROCEDURE_STATUS_UPDATE_FAILED" }; }
    revalidatePath("/settings"); revalidatePath("/agenda"); revalidatePath("/invoices");
    return { success: true, data, error: null };
  } catch (err) {
    const code = stableErrorCode(err); console.error("[toggleProcedureActive] error:", code); return { success: false, error: code };
  }
}
