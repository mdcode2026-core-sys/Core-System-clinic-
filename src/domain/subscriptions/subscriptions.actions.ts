"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type { ActivationCodeResult } from "./subscriptions.types";

/**
 * Server Action: Validate and apply an activation code.
 *
 * Enforces: auth → tenant resolution → subscription:read permission → validation
 *
 * IMPORTANT: This is a UI/domain boundary for the future activation-code backend.
 * The actual secure validation/update mechanism does not yet exist.
 * This action returns an honest "not yet implemented" response.
 */
export async function applyActivationCode(
  code: string
): Promise<ActivationCodeResult> {
  const supabase = await createClient();

  // 1. Authenticate
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  // 2. Resolve tenant_id from clinic_users (canonical pattern)
  const { data: clinicUser, error: clinicError } = await supabase
    .from("clinic_users")
    .select("tenant_id")
    .eq("auth_user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (clinicError || !clinicUser?.tenant_id) {
    return { success: false, error: "Failed to resolve tenant" };
  }

  const tenantId = clinicUser.tenant_id;

  // 3. Verify subscription:read permission (minimum to access subscription center)
  const effectivePerms = await getEffectivePermissions(user.id, tenantId);
  if (!effectivePerms.includes("subscription:read")) {
    return { success: false, error: "Permission denied: subscription:read required" };
  }

  // 4. Validate input
  const trimmedCode = code.trim();
  if (!trimmedCode || trimmedCode.length < 4) {
    return { success: false, error: "Invalid code format" };
  }

  // 5. HONEST BOUNDARY: The activation-code backend does not yet exist.
  //    This is documented in MASTER_ROADMAP.md and ARCHITECTURE_DECISIONS.md.
  //    The UI handles this gracefully with a "coming soon" state.
  return {
    success: false,
    error: "Activation code backend is not yet implemented. This feature will be available once the License Engine (Milestone 5) is built.",
    message: "Pending backend implementation",
  };
}
