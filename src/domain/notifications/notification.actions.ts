"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type {
  UpdateChannelPreferenceInput,
  NotificationPreferenceActionResult,
  NotificationChannel,
} from "./notification.types";

const VALID_CHANNELS: NotificationChannel[] = ["whatsapp", "sms", "email", "in_app"];

function isValidChannel(value: unknown): value is NotificationChannel {
  return typeof value === "string" && VALID_CHANNELS.includes(value as NotificationChannel);
}

/**
 * Server Action: Update a notification channel preference (enable/disable).
 *
 * Enforces: auth → tenant resolution → notifications:manage permission → validation → upsert
 */
export async function updateNotificationChannelPreference(
  input: UpdateChannelPreferenceInput
): Promise<NotificationPreferenceActionResult> {
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
    console.error("[updateNotificationChannelPreference] tenant resolution failed:", clinicError);
    return { success: false, error: "Failed to resolve tenant" };
  }

  const tenantId = clinicUser.tenant_id;

  // 3. Verify notifications:manage permission
  const effectivePerms = await getEffectivePermissions(user.id, tenantId);
  if (!effectivePerms.includes("notifications:manage")) {
    return { success: false, error: "Permission denied: notifications:manage required" };
  }

  // 4. Validate input
  if (!isValidChannel(input.channel)) {
    return { success: false, error: "Invalid notification channel" };
  }
  if (typeof input.is_enabled !== "boolean") {
    return { success: false, error: "is_enabled must be a boolean" };
  }

  // 5. Upsert into tenant_notification_channel_prefs
  const { error: upsertError } = await supabase
    .from("tenant_notification_channel_prefs")
    .upsert(
      {
        tenant_id: tenantId,
        channel: input.channel,
        is_enabled: input.is_enabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id,channel" }
    );

  if (upsertError) {
    console.error("[updateNotificationChannelPreference] upsert error:", upsertError.message);
    return { success: false, error: "Failed to update notification preference" };
  }

  revalidatePath("/settings");
  return { success: true, error: null };
}
