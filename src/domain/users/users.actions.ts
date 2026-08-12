"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type { CreateUserInput, UpdateUserInput, UserActionResult } from "./users.types";

/*
 * ═══════════════════════════════════════════════════════════════════════════════
 * M2.3 — User Management Server Actions
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * AUTHENTICATION ARCHITECTURE NOTE (CRITICAL):
 * ───────────────────────────────────────────
 * The application layer (Server Actions) does NOT have access to service_role
 * keys and MUST NOT call auth.signUp() from an authenticated session — doing so
 * would replace the administrator's session with the newly-created user's session.
 *
 * Therefore createClinicUser() inserts a clinic_users row with auth_user_id = NULL
 * and status = 'pending_auth'. The actual auth.users record must be created later
 * by an external provisioning mechanism (Supabase Dashboard, Edge Function, or
 * admin CLI) and then linked by updating auth_user_id.
 *
 * This design prevents:
 *   - Session hijacking/replacement
 *   - Orphaned auth.users records
 *   - Partial creation states
 *
 * DEPENDENCY: A separate auth-provisioning step is required to create the
 * actual Supabase Auth user and link auth_user_id.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Helper: Resolve caller identity and tenant via the canonical pattern.
 * Returns { user, tenantId } or throws an error string.
 */
async function resolveCaller() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw "Unauthorized";
  }

  const { data: clinicUser, error: clinicError } = await supabase
    .from("clinic_users")
    .select("tenant_id, role")
    .eq("auth_user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (clinicError || !clinicUser?.tenant_id) {
    throw "Tenant resolution failed";
  }

  return { user, tenantId: clinicUser.tenant_id, callerRole: clinicUser.role };
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
    .select("id, role")
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
 * Create a new clinic user record.
 *
 * Authorization: requires `users:create`.
 * Does NOT create an Auth user — sets auth_user_id = NULL pending external
 * provisioning. The caller must arrange auth account creation separately.
 */
export async function createClinicUser(input: CreateUserInput): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "users:create");

    // Validate role exists (system role by key, or custom role by template_id)
    if (input.role_template_id) {
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("id, tenant_id, is_system_role")
        .eq("id", input.role_template_id)
        .maybeSingle();

      if (roleError || !roleData) {
        return { success: false, error: "Selected role template not found" };
      }

      if (!roleData.is_system_role && roleData.tenant_id !== tenantId) {
        return { success: false, error: "Role template does not belong to this tenant" };
      }
    } else {
      // Verify the role_key exists in roles table
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("id")
        .eq("role_key", input.role)
        .maybeSingle();

      if (roleError || !roleData) {
        return { success: false, error: "Invalid system role" };
      }
    }

    // Insert clinic_users row — auth_user_id is NULL pending external provisioning
    const { data: inserted, error: insertError } = await supabase
      .from("clinic_users")
      .insert({
        tenant_id: tenantId,
        auth_user_id: null,
        role: input.role,
        role_template_id: input.role_template_id ?? null,
        full_name: input.full_name,
        email: input.email,
        phone: input.phone ?? null,
        is_active: true,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[createClinicUser] insert error:", insertError.message);
      return { success: false, error: "Failed to create clinic user" };
    }

    revalidatePath("/settings");
    return { success: true, error: null, userId: inserted.id };
  } catch (err) {
    const message = typeof err === "string" ? err : err instanceof Error ? err.message : "Unknown error";
    console.error("[createClinicUser] error:", message);
    return { success: false, error: message };
  }
}

/**
 * Update an existing clinic user's details.
 *
 * Authorization: requires `users:update`.
 * Cannot modify system-protected users (clinic_owner) unless caller is clinic_owner.
 * Cannot change role to/from clinic_owner.
 */
export async function updateClinicUser(input: UpdateUserInput): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId, callerRole } = await resolveCaller();
    await requirePermission(user.id, tenantId, "users:update");

    // Verify ownership
    const target = await verifyTenantOwnership(supabase, input.id, tenantId);

    // System role protection: prevent ordinary admins from modifying clinic_owner
    if (target.role === "clinic_owner" && callerRole !== "clinic_owner") {
      return { success: false, error: "Cannot modify clinic owner account" };
    }

    // Prevent assigning clinic_owner role
    if (input.role === "clinic_owner" && callerRole !== "clinic_owner") {
      return { success: false, error: "Cannot assign clinic owner role" };
    }

    // Build update payload (omit id)
    const updatePayload: Record<string, any> = {};
    if (input.full_name !== undefined) updatePayload.full_name = input.full_name;
    if (input.email !== undefined) updatePayload.email = input.email;
    if (input.phone !== undefined) updatePayload.phone = input.phone;
    if (input.role !== undefined) updatePayload.role = input.role;
    if (input.role_template_id !== undefined) updatePayload.role_template_id = input.role_template_id;

    if (Object.keys(updatePayload).length === 0) {
      return { success: false, error: "No fields to update" };
    }

    const { error: updateError } = await supabase
      .from("clinic_users")
      .update(updatePayload)
      .eq("id", input.id)
      .eq("tenant_id", tenantId);

    if (updateError) {
      console.error("[updateClinicUser] error:", updateError.message);
      return { success: false, error: "Failed to update clinic user" };
    }

    revalidatePath("/settings");
    return { success: true, error: null };
  } catch (err) {
    const message = typeof err === "string" ? err : err instanceof Error ? err.message : "Unknown error";
    console.error("[updateClinicUser] error:", message);
    return { success: false, error: message };
  }
}

/**
 * Activate or deactivate a clinic user.
 *
 * Authorization: requires `users:delete`.
 * Cannot deactivate clinic_owner.
 * Cannot deactivate self.
 */
export async function toggleClinicUserActive(
  userId: string,
  isActive: boolean
): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "users:delete");

    // Verify ownership
    const target = await verifyTenantOwnership(supabase, userId, tenantId);

    // Cannot deactivate clinic_owner
    if (target.role === "clinic_owner" && !isActive) {
      return { success: false, error: "Cannot deactivate clinic owner" };
    }

    // Cannot deactivate self
    const { data: callerClinicUser } = await supabase
      .from("clinic_users")
      .select("id")
      .eq("auth_user_id", user.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (callerClinicUser?.id === userId && !isActive) {
      return { success: false, error: "Cannot deactivate your own account" };
    }

    const { error: updateError } = await supabase
      .from("clinic_users")
      .update({ is_active: isActive })
      .eq("id", userId)
      .eq("tenant_id", tenantId);

    if (updateError) {
      console.error("[toggleClinicUserActive] error:", updateError.message);
      return { success: false, error: "Failed to update user status" };
    }

    revalidatePath("/settings");
    return { success: true, error: null };
  } catch (err) {
    const message = typeof err === "string" ? err : err instanceof Error ? err.message : "Unknown error";
    console.error("[toggleClinicUserActive] error:", message);
    return { success: false, error: message };
  }
}
