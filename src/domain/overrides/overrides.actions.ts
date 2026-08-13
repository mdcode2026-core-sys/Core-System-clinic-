"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type { SetOverrideInput, RemoveOverrideInput, OverrideActionResult } from "./overrides.types";

/**
 * Helper: Resolve caller identity and tenant via the canonical pattern.
 */
async function resolveCaller() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw "Unauthorized";
  }

  const { data: clinicUser, error: clinicError } = await supabase
    .from("clinic_users")
    .select("tenant_id, role, id")
    .eq("auth_user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (clinicError || !clinicUser?.tenant_id) {
    throw "Tenant resolution failed";
  }

  return { user, tenantId: clinicUser.tenant_id, callerClinicUserId: clinicUser.id };
}

/**
 * Helper: Check a permission server-side.
 */
async function requirePermission(userId: string, tenantId: string, perm: string) {
  const effectivePerms = await getEffectivePermissions(userId, tenantId);
  if (!effectivePerms.includes(perm as any)) {
    throw `Permission denied: ${perm} required`;
  }
}

/**
 * Helper: Verify target user belongs to caller's tenant.
 */
async function verifyTenantOwnership(
  supabase: any,
  targetUserId: string,
  tenantId: string
) {
  const { data, error } = await supabase
    .from("clinic_users")
    .select("id")
    .eq("id", targetUserId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error || !data) {
    throw "Target user not found or does not belong to this tenant";
  }

  return data;
}

/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Set (create or update) a permission override for a user.
 *
 * Authorization: requires `overrides:manage` permission.
 */
export async function setPermissionOverride(
  input: SetOverrideInput
): Promise<OverrideActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId, callerClinicUserId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "overrides:manage");

    // Verify target user belongs to tenant
    await verifyTenantOwnership(supabase, input.userId, tenantId);

    // Verify permission exists in catalog
    const { data: permData, error: permError } = await supabase
      .from("permissions")
      .select("id")
      .eq("id", input.permissionId)
      .maybeSingle();

    if (permError || !permData) {
      return { success: false, error: "Permission not found in catalog" };
    }

    // Upsert: insert on conflict update
    const { error: upsertError } = await supabase
      .from("clinic_user_permission_overrides")
      .upsert({
        tenant_id: tenantId,
        user_id: input.userId,
        permission_id: input.permissionId,
        granted: input.granted,
        created_by: callerClinicUserId,
      }, {
        onConflict: "tenant_id,user_id,permission_id",
      });

    if (upsertError) {
      console.error("[setPermissionOverride] upsert error:", upsertError.message);
      return { success: false, error: "Failed to set permission override" };
    }

    revalidatePath("/settings");
    return { success: true, error: null };
  } catch (err) {
    const message = typeof err === "string" ? err : err instanceof Error ? err.message : "Unknown error";
    console.error("[setPermissionOverride] error:", message);
    return { success: false, error: message };
  }
}

/**
 * Remove a permission override for a user.
 *
 * Authorization: requires `overrides:manage` permission.
 */
export async function removePermissionOverride(
  input: RemoveOverrideInput
): Promise<OverrideActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "overrides:manage");

    // Verify target user belongs to tenant
    await verifyTenantOwnership(supabase, input.userId, tenantId);

    const { error: deleteError } = await supabase
      .from("clinic_user_permission_overrides")
      .delete()
      .eq("user_id", input.userId)
      .eq("permission_id", input.permissionId)
      .eq("tenant_id", tenantId);

    if (deleteError) {
      console.error("[removePermissionOverride] delete error:", deleteError.message);
      return { success: false, error: "Failed to remove permission override" };
    }

    revalidatePath("/settings");
    return { success: true, error: null };
  } catch (err) {
    const message = typeof err === "string" ? err : err instanceof Error ? err.message : "Unknown error";
    console.error("[removePermissionOverride] error:", message);
    return { success: false, error: message };
  }
}
