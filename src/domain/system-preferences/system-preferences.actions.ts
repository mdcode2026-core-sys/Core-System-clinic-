"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type { SystemPreferencesUpdateInput } from "./system-preferences.types";

export interface UpdateSystemPreferencesResult {
  success: boolean;
  error: string | null;
}

const VALID_TIMEZONES = [
  "UTC", "Asia/Riyadh", "Asia/Dubai", "Asia/Kuwait", "Asia/Qatar",
  "Asia/Bahrain", "Asia/Muscat", "Asia/Amman", "Asia/Beirut",
  "Asia/Damascus", "Asia/Baghdad", "Asia/Jerusalem", "Africa/Cairo",
  "Europe/Istanbul", "Europe/London", "America/New_York", "America/Los_Angeles",
];

const VALID_CURRENCIES = ["SAR", "AED", "KWD", "QAR", "BHD", "OMR", "JOD", "USD", "EUR", "GBP", "EGP"];

function isValidLanguage(value: unknown): value is "ar" | "en" {
  return value === "ar" || value === "en";
}

function isValidDirection(value: unknown): value is "rtl" | "ltr" {
  return value === "rtl" || value === "ltr";
}

function isValidTimezone(value: unknown): boolean {
  return typeof value === "string" && VALID_TIMEZONES.includes(value);
}

function isValidCurrency(value: unknown): boolean {
  return typeof value === "string" && VALID_CURRENCIES.includes(value);
}

/**
 * Server Action: Update system preferences.
 *
 * Enforces: auth → tenant resolution → settings:update permission → validation → RLS update
 */
export async function updateSystemPreferences(
  input: SystemPreferencesUpdateInput
): Promise<UpdateSystemPreferencesResult> {
  const supabase = await createClient();

  // 1. Authenticate
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  // 2. Resolve tenant_id from clinic_users (canonical pattern — NOT client-supplied)
  const { data: clinicUser, error: clinicError } = await supabase
    .from("clinic_users")
    .select("tenant_id")
    .eq("auth_user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (clinicError || !clinicUser?.tenant_id) {
    console.error("[updateSystemPreferences] tenant resolution failed:", clinicError);
    return { success: false, error: "Failed to resolve tenant" };
  }

  const tenantId = clinicUser.tenant_id;

  // 3. Verify settings:update permission
  const effectivePerms = await getEffectivePermissions(user.id, tenantId);
  if (!effectivePerms.includes("settings:update")) {
    return { success: false, error: "Permission denied: settings:update required" };
  }

  // 4. Validate input fields
  const updates: Record<string, string> = {};
  const errors: string[] = [];

  if (input.language !== undefined) {
    if (!isValidLanguage(input.language)) {
      errors.push("Invalid language. Must be 'ar' or 'en'.");
    } else {
      updates.language = input.language;
    }
  }

  if (input.direction !== undefined) {
    if (!isValidDirection(input.direction)) {
      errors.push("Invalid direction. Must be 'rtl' or 'ltr'.");
    } else {
      updates.direction = input.direction;
    }
  }

  if (input.timezone !== undefined) {
    if (!isValidTimezone(input.timezone)) {
      errors.push("Invalid timezone.");
    } else {
      updates.timezone = input.timezone;
    }
  }

  if (input.currency !== undefined) {
    if (!isValidCurrency(input.currency)) {
      errors.push("Invalid currency.");
    } else {
      updates.currency = input.currency;
    }
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join("; ") };
  }

  if (Object.keys(updates).length === 0) {
    return { success: false, error: "No valid fields to update" };
  }

  // 5. Execute update — scoped to current tenant (RLS + explicit eq)
  const { error: updateError } = await supabase
    .from("master_tenants")
    .update(updates)
    .eq("id", tenantId);

  if (updateError) {
    console.error("[updateSystemPreferences] update error:", updateError.message);
    return { success: false, error: "Failed to update system preferences" };
  }

  revalidatePath("/settings");
  return { success: true, error: null };
}
