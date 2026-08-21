"use server";

/**
 * PJ Stage 3 — Clinic Service Catalog Server Actions
 * Secure server-side mutations with tenant isolation and permission enforcement.
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type { ClinicProcedureInsert, ClinicProcedureUpdate, ProcedureActionResult } from "./procedures.types";

/* ── Helpers ── */

async function resolveCaller() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw "Unauthorized";
  const { data: clinicUser, error: clinicError } = await supabase
    .from("clinic_users")
    .select("tenant_id, role")
    .eq("auth_user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (clinicError || !clinicUser?.tenant_id) throw "Tenant resolution failed";
  return { user, tenantId: clinicUser.tenant_id, callerRole: clinicUser.role };
}

async function requirePermission(userId: string, tenantId: string, perm: string) {
  const effectivePerms = await getEffectivePermissions(userId, tenantId);
  if (!effectivePerms.includes(perm as any)) {
    throw `Permission denied: ${perm}`;
  }
}

/* ── Create ── */

export async function createProcedure(input: ClinicProcedureInsert): Promise<ProcedureActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "procedures:create");

    const { data, error } = await supabase
      .from("clinic_procedures")
      .insert({ ...input, tenant_id: tenantId })
      .select()
      .single();

    if (error) {
      console.error("[createProcedure] error:", error.message);
      return { success: false, error: "Failed to create procedure" };
    }

    revalidatePath("/settings");
    revalidatePath("/agenda");
    revalidatePath("/invoices");
    return { success: true, data, error: null };
  } catch (err) {
    const message = typeof err === "string" ? err : err instanceof Error ? err.message : "Unknown error";
    console.error("[createProcedure] error:", message);
    return { success: false, error: message };
  }
}

/* ── Update ── */

export async function updateProcedure(
  id: string,
  updates: ClinicProcedureUpdate
): Promise<ProcedureActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "procedures:update");

    const { data: existing } = await supabase
      .from("clinic_procedures")
      .select("id")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (!existing) return { success: false, error: "Procedure not found or access denied" };

    const { data, error } = await supabase
      .from("clinic_procedures")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) {
      console.error("[updateProcedure] error:", error.message);
      return { success: false, error: "Failed to update procedure" };
    }

    revalidatePath("/settings");
    revalidatePath("/agenda");
    revalidatePath("/invoices");
    return { success: true, data, error: null };
  } catch (err) {
    const message = typeof err === "string" ? err : err instanceof Error ? err.message : "Unknown error";
    console.error("[updateProcedure] error:", message);
    return { success: false, error: message };
  }
}

/* ── Toggle Active ── */

export async function toggleProcedureActive(
  id: string,
  isActive: boolean
): Promise<ProcedureActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "procedures:delete");

    const { data: existing } = await supabase
      .from("clinic_procedures")
      .select("id")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (!existing) return { success: false, error: "Procedure not found or access denied" };

    const { data, error } = await supabase
      .from("clinic_procedures")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) {
      console.error("[toggleProcedureActive] error:", error.message);
      return { success: false, error: "Failed to update procedure status" };
    }

    revalidatePath("/settings");
    revalidatePath("/agenda");
    revalidatePath("/invoices");
    return { success: true, data, error: null };
  } catch (err) {
    const message = typeof err === "string" ? err : err instanceof Error ? err.message : "Unknown error";
    console.error("[toggleProcedureActive] error:", message);
    return { success: false, error: message };
  }
}
