"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type { SystemPreferencesUpdateInput } from "./system-preferences.types";

export interface UpdateSystemPreferencesResult { success: boolean; error: string | null; }

const VALID_TIMEZONES = ["UTC", "Asia/Riyadh", "Asia/Dubai", "Asia/Kuwait", "Asia/Qatar", "Asia/Bahrain", "Asia/Muscat", "Asia/Amman", "Asia/Beirut", "Asia/Damascus", "Asia/Baghdad", "Asia/Jerusalem", "Africa/Cairo", "Europe/Istanbul", "Europe/London", "America/New_York", "America/Los_Angeles"];
const VALID_CURRENCIES = ["SAR", "AED", "KWD", "QAR", "BHD", "OMR", "JOD", "USD", "EUR", "GBP", "EGP"];
function isValidLanguage(value: unknown): value is "ar" | "en" { return value === "ar" || value === "en"; }
function isValidTimezone(value: unknown): boolean { return typeof value === "string" && VALID_TIMEZONES.includes(value); }
function isValidCurrency(value: unknown): boolean { return typeof value === "string" && VALID_CURRENCIES.includes(value); }

/** Language is the source of truth for direction: ar → rtl, en → ltr. */
export async function updateSystemPreferences(input: SystemPreferencesUpdateInput): Promise<UpdateSystemPreferencesResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Unauthorized" };

  const { data: clinicUser, error: clinicError } = await supabase.from("clinic_users").select("tenant_id").eq("auth_user_id", user.id).limit(1).maybeSingle();
  if (clinicError || !clinicUser?.tenant_id) { console.error("[updateSystemPreferences] tenant resolution failed:", clinicError); return { success: false, error: "Failed to resolve tenant" }; }
  const tenantId = clinicUser.tenant_id;
  const effectivePerms = await getEffectivePermissions(user.id, tenantId);
  if (!effectivePerms.includes("settings:update")) return { success: false, error: "Permission denied: settings:update required" };

  const updates: Record<string, string> = {};
  const errors: string[] = [];
  if (input.language !== undefined) {
    if (!isValidLanguage(input.language)) errors.push("Invalid language. Must be 'ar' or 'en'.");
    else updates.language = input.language;
  }
  if (input.language !== undefined) {
    updates.direction = input.language === "ar" ? "rtl" : "ltr";
    if (input.direction !== undefined && input.direction !== updates.direction) errors.push("Direction must match the selected language.");
  } else if (input.direction !== undefined) {
    errors.push("Direction is derived from language and cannot be changed independently.");
  }
  if (input.timezone !== undefined) {
    if (!isValidTimezone(input.timezone)) errors.push("Invalid timezone.");
    else updates.timezone = input.timezone;
  }
  if (input.currency !== undefined) {
    if (!isValidCurrency(input.currency)) errors.push("Invalid currency.");
    else updates.currency = input.currency;
  }
  if (errors.length > 0) return { success: false, error: errors.join("; ") };
  if (Object.keys(updates).length === 0) return { success: false, error: "No valid fields to update" };

  const { error: updateError } = await supabase.from("master_tenants").update(updates).eq("id", tenantId);
  if (updateError) { console.error("[updateSystemPreferences] update error:", updateError.message); return { success: false, error: "Failed to update system preferences" }; }
  revalidatePath("/settings");
  return { success: true, error: null };
}
