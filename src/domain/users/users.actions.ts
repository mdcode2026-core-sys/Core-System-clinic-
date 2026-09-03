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

function generateEmployeeCode() {
  return `EMP-${crypto.randomUUID().replaceAll("-", "").slice(0, 15).toUpperCase()}`;
}

async function resolveCaller() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw "UNAUTHORIZED";
  const { data: clinicUser, error } = await supabase
    .from("clinic_users")
    .select("id,tenant_id,role,role_id,account_status")
    .eq("auth_user_id", user.id)
    .eq("account_status", "active")
    .maybeSingle();
  if (error || !clinicUser?.tenant_id) throw "TENANT_RESOLUTION_FAILED";
  return { user, tenantId: clinicUser.tenant_id, callerClinicUserId: clinicUser.id };
}

async function requirePermission(userId: string, tenantId: string, permission: string) {
  const permissions = await getEffectivePermissions(userId, tenantId);
  if (!permissions.includes(permission as any)) throw "PERMISSION_DENIED";
}

async function resolveRole(supabase: any, roleId: string, tenantId: string) {
  const { data, error } = await supabase
    .from("roles")
    .select("id,role_key,tenant_id,is_system_role,workspace")
    .eq("id", roleId)
    .maybeSingle();
  if (error || !data) throw "ROLE_NOT_FOUND";
  if (!data.is_system_role && data.tenant_id !== tenantId) throw "ROLE_WRONG_TENANT";
  if (data.role_key === "super_admin" || data.role_key === "clinic_admin") throw "ROLE_NOT_ASSIGNABLE";
  return data;
}

async function loadTarget(supabase: any, userId: string, tenantId: string) {
  const { data, error } = await supabase
    .from("clinic_users")
    .select("id,tenant_id,auth_user_id,full_name,email,pending_email,is_active,account_status,role_id,roles:role_id(role_key)")
    .eq("id", userId)
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (error || !data) throw "USER_NOT_FOUND";
  return data;
}

async function assertTargetMutable(target: { auth_user_id: string | null; role_id: string; roles?: { role_key?: string } | { role_key?: string }[] | null }, callerAuthUserId: string) {
  const role = Array.isArray(target.roles) ? target.roles[0] : target.roles;
  if (target.auth_user_id === callerAuthUserId || role?.role_key === "clinic_admin") throw "CLINIC_ADMIN_ACCOUNT_PROTECTED";
}

async function assertEmailAvailable(supabase: any, tenantId: string, email: string, excludeUserId?: string) {
  let query = supabase.from("clinic_users").select("id").eq("tenant_id", tenantId).is("deleted_at", null).ilike("email", email).limit(1);
  if (excludeUserId) query = query.neq("id", excludeUserId);
  const { data, error } = await query;
  if (error) throw "USER_EMAIL_CHECK_FAILED";
  if ((data ?? []).length) throw "USER_EMAIL_OR_USER_EXISTS";
}

async function inviteAuthAccount(target: { id: string; email: string; full_name: string | null }, tenantId: string): Promise<UserActionResult> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(target.email, {
    redirectTo: `${appUrl()}/activate`,
    data: { full_name: target.full_name, tenant_id: tenantId, clinic_user_id: target.id },
  });
  if (!data?.user) return { success: false, error: error?.message || "AUTH_INVITATION_FAILED" };
  return { success: true, error: null, userId: data.user.id, emailSent: true };
}

async function insertClinicUser(supabase: any, payload: Record<string, unknown>) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await supabase
      .from("clinic_users")
      .insert({ ...payload, id: crypto.randomUUID(), employee_code: generateEmployeeCode(), pin_code: "" })
      .select("id,full_name,email")
      .single();
    if (!error && data) return { data, error: null };
    if (error?.code !== "23505") return { data: null, error };
    const message = String(error?.message || "");
    if (message.includes("uq_clinic_users_tenant_email_active")) return { data: null, error: { code: "USER_EMAIL_EXISTS" } };
    if (attempt === 4) return { data: null, error: { code: "USER_EMPLOYEE_CODE_EXISTS" } };
  }
  return { data: null, error: { code: "USER_CREATE_FAILED" } };
}

async function applyAccessConfiguration(supabase: any, userId: string, tenantId: string, callerId: string, directPermissionIds: string[] = [], revokedPermissionIds: string[] = []) {
  await requirePermission(callerId, tenantId, "overrides:manage");
  const directIds = [...new Set(directPermissionIds)].filter(Boolean);
  const revokedIds = [...new Set(revokedPermissionIds)].filter(id => id && !directIds.includes(id));
  const allIds = [...new Set([...directIds, ...revokedIds])];
  if (allIds.length) {
    const { data: validPermissions, error: permissionError } = await supabase.from("permissions").select("id").in("id", allIds);
    if (permissionError || (validPermissions ?? []).length !== allIds.length) throw "PERMISSION_REFERENCE_INVALID";
  }
  const { error: clearDirectError } = await supabase.from("clinic_user_permissions").delete().eq("tenant_id", tenantId).eq("user_id", userId);
  if (clearDirectError) throw "DIRECT_PERMISSION_SAVE_FAILED";
  const { error: clearOverrideError } = await supabase.from("clinic_user_permission_overrides").delete().eq("tenant_id", tenantId).eq("user_id", userId);
  if (clearOverrideError) throw "OVERRIDE_SAVE_FAILED";
  if (directIds.length) {
    const { error } = await supabase.from("clinic_user_permissions").insert(directIds.map(permission_id => ({ tenant_id: tenantId, user_id: userId, permission_id, granted: true, created_by: callerId })));
    if (error) throw "DIRECT_PERMISSION_SAVE_FAILED";
  }
  if (revokedIds.length) {
    const { error } = await supabase.from("clinic_user_permission_overrides").insert(revokedIds.map(permission_id => ({ tenant_id: tenantId, user_id: userId, permission_id, granted: false, created_by: callerId })));
    if (error) throw "OVERRIDE_SAVE_FAILED";
  }
}

async function updateWorkspaceAssignment(supabase: any, tenantId: string, userId: string, workspace: string) {
  const { error: clearError } = await supabase.from("clinic_user_workspaces").update({ is_default: false }).eq("tenant_id", tenantId).eq("user_id", userId);
  if (clearError) throw "USER_WORKSPACE_UPDATE_FAILED";
  const { error: upsertError } = await supabase.from("clinic_user_workspaces").upsert({ tenant_id: tenantId, user_id: userId, workspace, is_default: true }, { onConflict: "tenant_id,user_id,workspace" });
  if (upsertError) throw "USER_WORKSPACE_UPDATE_FAILED";
}

export async function createClinicUser(input: CreateUserInput): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "users:create");
    const normalizedEmail = input.email.trim().toLowerCase();
    await assertEmailAvailable(supabase, tenantId, normalizedEmail);
    const role = await resolveRole(supabase, input.role_id, tenantId);
    const workspace = input.workspace || role.workspace || "operation";
    const { data: inserted, error } = await insertClinicUser(supabase, {
      tenant_id: tenantId,
      auth_user_id: null,
      role: role.role_key,
      role_id: role.id,
      role_template_id: role.is_system_role ? role.id : null,
      full_name: input.full_name.trim(),
      email: normalizedEmail,
      phone: input.phone?.trim() || null,
      is_active: false,
      account_status: "pending",
      pending_email: null,
    });
    if (error || !inserted) return { success: false, error: error?.code === "USER_EMAIL_EXISTS" ? "USER_EMAIL_OR_USER_EXISTS" : error?.code === "USER_EMPLOYEE_CODE_EXISTS" ? "USER_EMPLOYEE_CODE_EXISTS" : "USER_CREATE_FAILED" };
    const { error: workspaceError } = await supabase.from("clinic_user_workspaces").insert({ tenant_id: tenantId, user_id: inserted.id, workspace, is_default: true });
    if (workspaceError) {
      await supabase.from("clinic_users").delete().eq("id", inserted.id).eq("tenant_id", tenantId);
      return { success: false, error: "USER_WORKSPACE_SETUP_FAILED" };
    }
    const authResult = await inviteAuthAccount(inserted, tenantId);
    if (!authResult.success || !authResult.userId) {
      await supabase.from("clinic_user_workspaces").delete().eq("user_id", inserted.id).eq("tenant_id", tenantId);
      await supabase.from("clinic_users").delete().eq("id", inserted.id).eq("tenant_id", tenantId);
      return { success: false, error: authResult.error || "AUTH_INVITATION_FAILED" };
    }
    const { error: linkError } = await supabase
      .from("clinic_users")
      .update({ auth_user_id: authResult.userId, is_active: false, account_status: "pending" })
      .eq("id", inserted.id)
      .eq("tenant_id", tenantId)
      .is("auth_user_id", null);
    if (linkError) {
      try { await createAdminClient().auth.admin.deleteUser(authResult.userId); } catch {}
      await supabase.from("clinic_user_workspaces").delete().eq("user_id", inserted.id).eq("tenant_id", tenantId);
      await supabase.from("clinic_users").delete().eq("id", inserted.id).eq("tenant_id", tenantId);
      return { success: false, error: "AUTH_LINK_FAILED" };
    }
    try {
      await applyAccessConfiguration(supabase, inserted.id, tenantId, user.id, input.directPermissionIds, input.revokedPermissionIds);
    } catch (error) {
      try { await createAdminClient().auth.admin.deleteUser(authResult.userId); } catch {}
      await supabase.from("clinic_user_workspaces").delete().eq("user_id", inserted.id).eq("tenant_id", tenantId);
      await supabase.from("clinic_users").delete().eq("id", inserted.id).eq("tenant_id", tenantId);
      return { success: false, error: typeof error === "string" ? error : "USER_ACCESS_SETUP_FAILED" };
    }
    revalidatePath("/settings");
    return { success: true, error: null, userId: inserted.id, emailSent: true };
  } catch (err) {
    return { success: false, error: typeof err === "string" ? err : err instanceof Error ? err.message : "UNKNOWN" };
  }
}

export async function resendClinicUserInvitation(userId: string): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "users:update");
    const target = await loadTarget(supabase, userId, tenantId);
    await assertTargetMutable(target, user.id);
    if (target.account_status !== "pending" || !target.auth_user_id) return { success: false, error: "USER_NOT_PENDING" };
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.inviteUserByEmail(target.email, { redirectTo: `${appUrl()}/activate`, data: { full_name: target.full_name, tenant_id: tenantId, clinic_user_id: target.id } });
    if (error) return { success: false, error: error.message || "AUTH_INVITATION_RESEND_FAILED" };
    revalidatePath("/settings");
    return { success: true, error: null, userId: target.id, emailSent: true };
  } catch (err) {
    return { success: false, error: typeof err === "string" ? err : err instanceof Error ? err.message : "UNKNOWN" };
  }
}

export async function activateClinicUserAccount(userId: string): Promise<UserActionResult> {
  return resendClinicUserInvitation(userId);
}

export async function completeClinicUserActivation(): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "UNAUTHORIZED" };
    const admin = createAdminClient();
    const { data: target, error: targetError } = await admin.from("clinic_users").select("id,tenant_id,account_status,is_active").eq("auth_user_id", user.id).maybeSingle();
    if (targetError || !target) return { success: false, error: "USER_NOT_FOUND" };
    if (target.account_status === "active") return { success: true, error: null, userId: target.id };
    if (target.account_status !== "pending") return { success: false, error: "USER_NOT_PENDING" };
    const { error } = await admin.from("clinic_users").update({ account_status: "active", is_active: true, last_login_at: new Date().toISOString() }).eq("id", target.id).eq("auth_user_id", user.id);
    if (error) return { success: false, error: "USER_ACTIVATION_FAILED" };
    return { success: true, error: null, userId: target.id };
  } catch (err) {
    return { success: false, error: typeof err === "string" ? err : err instanceof Error ? err.message : "UNKNOWN" };
  }
}

export async function updateClinicUser(input: UpdateUserInput): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "users:update");
    const target = await loadTarget(supabase, input.id, tenantId);
    await assertTargetMutable(target, user.id);
    const updatePayload: Record<string, unknown> = {};
    if (input.full_name !== undefined) updatePayload.full_name = input.full_name.trim();
    if (input.phone !== undefined) updatePayload.phone = input.phone.trim() || null;
    if (input.role_id !== undefined) {
      const role = await resolveRole(supabase, input.role_id, tenantId);
      updatePayload.role_id = role.id;
      updatePayload.role = role.role_key;
      updatePayload.role_template_id = role.is_system_role ? role.id : null;
    }
    if (input.email !== undefined) {
      const normalizedEmail = input.email.trim().toLowerCase();
      if (normalizedEmail !== (target.email ?? "").toLowerCase()) {
        await assertEmailAvailable(supabase, tenantId, normalizedEmail, input.id);
        updatePayload.pending_email = normalizedEmail;
      }
    }
    if (Object.keys(updatePayload).length) {
      const { error } = await supabase.from("clinic_users").update(updatePayload).eq("id", input.id).eq("tenant_id", tenantId);
      if (error) return { success: false, error: error.code === "23505" ? "USER_EMAIL_OR_USER_EXISTS" : "USER_UPDATE_FAILED" };
    }
    if (input.workspace) {
      try { await updateWorkspaceAssignment(supabase, tenantId, input.id, input.workspace); }
      catch { return { success: false, error: "USER_WORKSPACE_UPDATE_FAILED" }; }
    }
    if (input.directPermissionIds !== undefined || input.revokedPermissionIds !== undefined) {
      try { await applyAccessConfiguration(supabase, input.id, tenantId, user.id, input.directPermissionIds, input.revokedPermissionIds); }
      catch (error) { return { success: false, error: typeof error === "string" ? error : "USER_ACCESS_UPDATE_FAILED" }; }
    }
    revalidatePath("/settings");
    return { success: true, error: null, userId: input.id, emailSent: false };
  } catch (err) {
    return { success: false, error: typeof err === "string" ? err : err instanceof Error ? err.message : "UNKNOWN" };
  }
}

export async function requestOwnEmailChange(newEmail: string): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    const normalized = newEmail.trim().toLowerCase();
    if (!normalized || normalized === (user.email ?? "").toLowerCase()) return { success: false, error: "EMAIL_CHANGE_NOT_NEW" };
    const { data: clinicUser } = await supabase.from("clinic_users").select("id").eq("auth_user_id", user.id).eq("tenant_id", tenantId).single();
    await assertEmailAvailable(supabase, tenantId, normalized, clinicUser?.id);
    const { error } = await supabase.from("clinic_users").update({ pending_email: normalized }).eq("auth_user_id", user.id).eq("tenant_id", tenantId);
    if (error) return { success: false, error: "EMAIL_CHANGE_REQUEST_FAILED" };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: typeof err === "string" ? err : err instanceof Error ? err.message : "UNKNOWN" };
  }
}

export async function resendOwnEmailChange(): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "UNAUTHORIZED" };
    const { error } = await supabase.auth.resend({ type: "email_change", email: user.email ?? "" });
    if (error) return { success: false, error: "EMAIL_CHANGE_RESEND_FAILED" };
    return { success: true, error: null, emailSent: true };
  } catch (err) {
    return { success: false, error: typeof err === "string" ? err : err instanceof Error ? err.message : "UNKNOWN" };
  }
}

export async function toggleClinicUserActive(userId: string, isActive: boolean): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "users:update");
    const target = await loadTarget(supabase, userId, tenantId);
    await assertTargetMutable(target, user.id);
    if (target.account_status === "pending") return { success: false, error: "USER_PENDING_CANNOT_TOGGLE" };
    if (!target.auth_user_id) return { success: false, error: "USER_AUTH_ACCOUNT_NOT_READY" };
    const { error: authError } = await createAdminClient().auth.admin.updateUserById(target.auth_user_id, { ban_duration: isActive ? "0s" : "876000h" });
    if (authError) return { success: false, error: "AUTH_STATUS_UPDATE_FAILED" };
    const { error } = await supabase.from("clinic_users").update({ is_active: isActive, account_status: isActive ? "active" : "inactive" }).eq("id", userId).eq("tenant_id", tenantId);
    if (error) return { success: false, error: "USER_STATUS_UPDATE_FAILED" };
    revalidatePath("/settings");
    return { success: true, error: null, userId };
  } catch (err) {
    return { success: false, error: typeof err === "string" ? err : err instanceof Error ? err.message : "UNKNOWN" };
  }
}
