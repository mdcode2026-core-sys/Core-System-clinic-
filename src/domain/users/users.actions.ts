"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type { CreateUserInput, UpdateUserInput, UserActionResult } from "./users.types";

function appUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const url = configured || (vercel ? `https://${vercel}` : "");
  if (!url) throw new Error("APPLICATION_URL_NOT_CONFIGURED");
  return url.replace(/\/$/, "");
}

async function resolveCaller() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw "UNAUTHORIZED";
  const { data: clinicUser, error } = await supabase
    .from("clinic_users")
    .select("id,tenant_id")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !clinicUser?.tenant_id) throw "TENANT_RESOLUTION_FAILED";
  return { user, tenantId: clinicUser.tenant_id, callerClinicUserId: clinicUser.id };
}

async function requirePermission(userId: string, tenantId: string, permission: string) {
  const permissions = await getEffectivePermissions(userId, tenantId);
  if (!permissions.includes(permission as any)) throw "PERMISSION_DENIED";
}

async function resolveRole(supabase: any, roleId: string, tenantId: string) {
  const { data, error } = await supabase.from("roles").select("id,role_key,tenant_id,is_system_role").eq("id", roleId).maybeSingle();
  if (error || !data) throw "ROLE_NOT_FOUND";
  if (!data.is_system_role && data.tenant_id !== tenantId) throw "ROLE_WRONG_TENANT";
  if (data.role_key === "super_admin") throw "ROLE_NOT_ASSIGNABLE";
  return data;
}

async function loadTarget(supabase: any, userId: string, tenantId: string) {
  const { data, error } = await supabase
    .from("clinic_users")
    .select("id,tenant_id,auth_user_id,full_name,email,is_active")
    .eq("id", userId)
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (error || !data) throw "USER_NOT_FOUND";
  return data;
}

export async function createClinicUser(input: CreateUserInput): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "users:create");
    const role = await resolveRole(supabase, input.role_id, tenantId);

    const { data: inserted, error } = await supabase.from("clinic_users").insert({
      tenant_id: tenantId,
      auth_user_id: null,
      role: role.role_key,
      role_id: role.id,
      role_template_id: role.is_system_role ? role.id : null,
      full_name: input.full_name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || null,
      is_active: true,
    }).select("id").single();
    if (error) return { success: false, error: "USER_CREATE_FAILED" };
    revalidatePath("/settings");
    return { success: true, error: null, userId: inserted.id };
  } catch (err) {
    return { success: false, error: typeof err === "string" ? err : "UNKNOWN" };
  }
}

/**
 * Provisions a real Supabase Auth identity for an existing clinic user and
 * sends the user an invitation to choose their own password.
 */
export async function activateClinicUserAccount(userId: string): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "users:update");
    const target = await loadTarget(supabase, userId, tenantId);
    if (!target.email) return { success: false, error: "USER_EMAIL_REQUIRED" };
    if (target.auth_user_id) {
      const admin = createAdminClient();
      const { error } = await admin.auth.admin.updateUserById(target.auth_user_id, { ban_duration: "0s" });
      if (error) return { success: false, error: "AUTH_REACTIVATION_FAILED" };
      const { error: dbError } = await supabase.from("clinic_users").update({ is_active: true }).eq("id", target.id).eq("tenant_id", tenantId);
      if (dbError) return { success: false, error: "USER_STATUS_UPDATE_FAILED" };
      revalidatePath("/settings");
      return { success: true, error: null, userId: target.id };
    }

    const admin = createAdminClient();
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(target.email, {
      data: {
        full_name: target.full_name,
        tenant_id: tenantId,
        clinic_user_id: target.id,
      },
      redirectTo: `${appUrl()}/activate`,
    });
    if (inviteError || !invited.user) return { success: false, error: "AUTH_INVITATION_FAILED" };

    const { error: linkError } = await supabase
      .from("clinic_users")
      .update({ auth_user_id: invited.user.id, is_active: true })
      .eq("id", target.id)
      .eq("tenant_id", tenantId)
      .is("auth_user_id", null);

    if (linkError) {
      try { await admin.auth.admin.deleteUser(invited.user.id); } catch { /* best-effort rollback */ }
      return { success: false, error: "AUTH_LINK_FAILED" };
    }

    revalidatePath("/settings");
    return { success: true, error: null, userId: target.id };
  } catch (err) {
    return { success: false, error: typeof err === "string" ? err : "UNKNOWN" };
  }
}

export async function updateClinicUser(input: UpdateUserInput): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "users:update");
    const target = await loadTarget(supabase, input.id, tenantId);

    const updatePayload: Record<string, unknown> = {};
    if (input.full_name !== undefined) updatePayload.full_name = input.full_name.trim();
    if (input.email !== undefined) updatePayload.email = input.email.trim().toLowerCase();
    if (input.phone !== undefined) updatePayload.phone = input.phone.trim() || null;
    if (input.role_id !== undefined) {
      const role = await resolveRole(supabase, input.role_id, tenantId);
      updatePayload.role_id = role.id;
      updatePayload.role = role.role_key;
      updatePayload.role_template_id = role.is_system_role ? role.id : null;
    }
    if (!Object.keys(updatePayload).length) return { success: false, error: "NO_FIELDS_TO_UPDATE" };

    if (input.email !== undefined && target.auth_user_id) {
      const admin = createAdminClient();
      const { error: authError } = await admin.auth.admin.updateUserById(target.auth_user_id, {
        email: input.email.trim().toLowerCase(),
      });
      if (authError) return { success: false, error: "AUTH_EMAIL_UPDATE_FAILED" };
    }

    const { error } = await supabase.from("clinic_users").update(updatePayload).eq("id", input.id).eq("tenant_id", tenantId);
    if (error) return { success: false, error: "USER_UPDATE_FAILED" };
    revalidatePath("/settings");
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: typeof err === "string" ? err : "UNKNOWN" };
  }
}

export async function toggleClinicUserActive(userId: string, isActive: boolean): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "users:delete");
    const target = await loadTarget(supabase, userId, tenantId);
    if (target.auth_user_id === user.id && !isActive) return { success: false, error: "CANNOT_DEACTIVATE_SELF" };

    if (target.auth_user_id) {
      const admin = createAdminClient();
      const { error: authError } = await admin.auth.admin.updateUserById(target.auth_user_id, {
        ban_duration: isActive ? "0s" : "876000h",
      });
      if (authError) return { success: false, error: "AUTH_STATUS_UPDATE_FAILED" };
    }

    const { error } = await supabase.from("clinic_users").update({ is_active: isActive }).eq("id", userId).eq("tenant_id", tenantId);
    if (error) return { success: false, error: "USER_STATUS_UPDATE_FAILED" };
    revalidatePath("/settings");
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: typeof err === "string" ? err : "UNKNOWN" };
  }
}
