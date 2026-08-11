"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";

export interface UpdateClinicProfileResult {
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

function validatePhone(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const phoneRegex = /^[+\d\s\-()]{6,20}$/;
  if (!phoneRegex.test(trimmed)) return "Invalid phone format";
  return null;
}

function validateTimezone(value: string | null): string | null {
  if (!value) return null;
  if (!VALID_TIMEZONES.includes(value)) return `Invalid timezone`;
  return null;
}

function validateCurrency(value: string | null): string | null {
  if (!value) return null;
  if (!VALID_CURRENCIES.includes(value)) return `Invalid currency`;
  return null;
}

/**
 * Server Action: Update clinic profile.
 *
 * Enforces: auth → tenant resolution → settings:update permission → validation → RLS update
 */
export async function updateClinicProfile(formData: FormData): Promise<UpdateClinicProfileResult> {
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

  // 3. Verify settings:update permission
  const effectivePerms = await getEffectivePermissions(user.id, tenantId);
  if (!effectivePerms.includes("settings:update")) {
    return { success: false, error: "Permission denied: settings:update required" };
  }

  // 4. Extract and validate fields from FormData
  const clinic_name = String(formData.get("clinic_name") ?? "").trim();
  const clinic_name_ar = String(formData.get("clinic_name_ar") ?? "").trim() || null;
  const primary_phone = String(formData.get("primary_phone") ?? "").trim() || null;
  const whatsapp_number = String(formData.get("whatsapp_number") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const timezone = String(formData.get("timezone") ?? "").trim() || null;
  const currency = String(formData.get("currency") ?? "").trim() || null;
  const logo_url = String(formData.get("logo_url") ?? "").trim() || null;
  const primary_color = String(formData.get("primary_color") ?? "").trim() || null;
  const country_code = String(formData.get("country_code") ?? "").trim() || null;

  const errors: string[] = [];

  if (!clinic_name || clinic_name.length < 2) {
    errors.push("Clinic name is required (min 2 characters)");
  }

  const phoneErr = validatePhone(primary_phone);
  if (phoneErr) errors.push(`Primary phone: ${phoneErr}`);

  const waErr = validatePhone(whatsapp_number);
  if (waErr) errors.push(`WhatsApp: ${waErr}`);

  const tzErr = validateTimezone(timezone);
  if (tzErr) errors.push(tzErr);

  const currErr = validateCurrency(currency);
  if (currErr) errors.push(currErr);

  if (errors.length > 0) {
    return { success: false, error: errors.join("; ") };
  }

  // 5. Build update payload — explicit 10-field whitelist
  // All fields are included, including null values for clearing
  const updatePayload: Record<string, unknown> = {
    clinic_name,
    clinic_name_ar,
    primary_phone,
    whatsapp_number,
    address,
    timezone,
    currency,
    logo_url,
    primary_color,
    country_code,
    updated_at: new Date().toISOString(),
  };

  // 6. Execute update — scoped to current tenant (RLS + explicit eq)
  const { error: updateError } = await supabase
    .from("master_tenants")
    .update(updatePayload)
    .eq("id", tenantId);

  if (updateError) {
    console.error("[updateClinicProfile] update error:", updateError.message);
    return { success: false, error: "Failed to update clinic profile" };
  }

  revalidatePath("/settings");
  return { success: true, error: null };
}
