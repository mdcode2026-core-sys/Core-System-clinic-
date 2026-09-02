"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { getAppUrl } from "@/core/auth/appUrl";

export async function sendUserActivationEmail(userId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user: caller }, error: authError } = await supabase.auth.getUser();
    if (authError || !caller) return { success: false, error: "UNAUTHORIZED" };

    const { data: callerRow, error: callerError } = await supabase
      .from("clinic_users")
      .select("id,tenant_id,role,account_status")
      .eq("auth_user_id", caller.id)
      .eq("account_status", "active")
      .maybeSingle();
    if (callerError || !callerRow?.tenant_id) return { success: false, error: "TENANT_RESOLUTION_FAILED" };

    const permissions = await getEffectivePermissions(caller.id, callerRow.tenant_id);
    if (!permissions.includes("users:update" as any)) return { success: false, error: "PERMISSION_DENIED" };

    const { data: target, error: targetError } = await supabase
      .from("clinic_users")
      .select("id,tenant_id,auth_user_id,email,full_name,role,account_status")
      .eq("id", userId)
      .eq("tenant_id", callerRow.tenant_id)
      .maybeSingle();
    if (targetError || !target) return { success: false, error: "USER_NOT_FOUND" };
    if (target.role === "clinic_admin" || target.auth_user_id === caller.id) return { success: false, error: "CLINIC_ADMIN_ACCOUNT_PROTECTED" };
    if (!target.email) return { success: false, error: "USER_EMAIL_MISSING" };

    const appUrl = getAppUrl();

    // Pending accounts use the original invitation flow. Existing accounts use
    // password recovery so an employee who missed the original invitation can
    // establish a password without changing the clinic user identity.
    if (target.account_status === "pending") {
      if (!target.auth_user_id) return { success: false, error: "USER_AUTH_ACCOUNT_MISSING" };
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: target.email,
        options: { emailRedirectTo: `${appUrl}/activate` },
      });
      if (error) return { success: false, error: "AUTH_INVITATION_RESEND_FAILED" };
    } else if (target.account_status === "active") {
      const { error } = await supabase.auth.resetPasswordForEmail(target.email, {
        redirectTo: `${appUrl}/reset-password`,
      });
      if (error) return { success: false, error: "AUTH_PASSWORD_SETUP_EMAIL_FAILED" };
    } else {
      return { success: false, error: "USER_NOT_ELIGIBLE_FOR_ACTIVATION_EMAIL" };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "UNKNOWN" };
  }
}
