"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import type { PatientInsert, PatientUpdate } from "@/domain/patients/patients.types";

const TENANT_MISSING = "PATIENT_TENANT_MISSING";
const DATABASE_ERROR = "PATIENT_DATABASE_ERROR";

function getFormValue(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

async function getAuthorizedTenantId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data, error } = await supabase
    .from("clinic_users")
    .select("tenant_id")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[patients] tenant lookup failed", { message: error.message, code: error.code });
    return null;
  }

  return data?.tenant_id ?? null;
}

function logDatabaseError(operation: string, error: { message: string; code?: string; details?: string; hint?: string }) {
  console.error(`[${operation}] database error`, { message: error.message, code: error.code, details: error.details, hint: error.hint });
}

export async function createPatient(formData: FormData) {
  const supabase = await createClient();
  const tenantId = await getAuthorizedTenantId(supabase);
  if (!tenantId) return { error: TENANT_MISSING };

  const patient: PatientInsert = {
    tenant_id: tenantId,
    first_name: getFormValue(formData, "first_name") ?? "",
    last_name: getFormValue(formData, "last_name") ?? "",
    first_name_ar: getFormValue(formData, "first_name_ar"),
    last_name_ar: getFormValue(formData, "last_name_ar"),
    date_of_birth: getFormValue(formData, "date_of_birth"),
    gender: getFormValue(formData, "gender") as "male" | "female" | "other" | undefined,
    phone_primary: getFormValue(formData, "phone_primary") ?? "",
    phone_secondary: getFormValue(formData, "phone_secondary"),
    email: getFormValue(formData, "email"),
    preferred_channel: (getFormValue(formData, "preferred_channel") ?? "whatsapp") as "whatsapp" | "sms" | "email" | "phone",
    first_visit_date: getFormValue(formData, "first_visit_date"),
    referral_source: getFormValue(formData, "referral_source"),
    patient_status: (getFormValue(formData, "patient_status") ?? "active") as "active" | "inactive" | "archived" | "blocked",
    notes: getFormValue(formData, "notes"),
  };

  const { data, error } = await supabase.from("clinic_patients").insert(patient).select().single();
  if (error) { logDatabaseError("createPatient", error); return { error: DATABASE_ERROR }; }
  revalidatePath("/patients");
  return { data };
}

export async function createPatientFromObject(patientData: PatientInsert) {
  const supabase = await createClient();
  const tenantId = await getAuthorizedTenantId(supabase);
  if (!tenantId) return { error: TENANT_MISSING };
  const patient: PatientInsert = { ...patientData, tenant_id: tenantId };
  const { data, error } = await supabase.from("clinic_patients").insert(patient).select().single();
  if (error) { logDatabaseError("createPatientFromObject", error); return { error: DATABASE_ERROR }; }
  revalidatePath("/patients");
  return { data };
}

export async function updatePatient(formData: FormData) {
  const supabase = await createClient();
  const tenantId = await getAuthorizedTenantId(supabase);
  if (!tenantId) return { error: TENANT_MISSING };
  const id = getFormValue(formData, "id");
  if (!id) return { error: DATABASE_ERROR };
  const update: PatientUpdate = {
    first_name: getFormValue(formData, "first_name"), last_name: getFormValue(formData, "last_name"),
    first_name_ar: getFormValue(formData, "first_name_ar"), last_name_ar: getFormValue(formData, "last_name_ar"),
    date_of_birth: getFormValue(formData, "date_of_birth"), gender: getFormValue(formData, "gender") as "male" | "female" | "other" | undefined,
    phone_primary: getFormValue(formData, "phone_primary"), phone_secondary: getFormValue(formData, "phone_secondary"), email: getFormValue(formData, "email"),
    preferred_channel: getFormValue(formData, "preferred_channel") as "whatsapp" | "sms" | "email" | "phone" | undefined,
    first_visit_date: getFormValue(formData, "first_visit_date"), referral_source: getFormValue(formData, "referral_source"),
    patient_status: getFormValue(formData, "patient_status") as "active" | "inactive" | "archived" | "blocked" | undefined, notes: getFormValue(formData, "notes"),
  };
  const { data, error } = await supabase.from("clinic_patients").update({ ...update, updated_at: new Date().toISOString() }).eq("id", id).eq("tenant_id", tenantId).select().single();
  if (error) { logDatabaseError("updatePatient", error); return { error: DATABASE_ERROR }; }
  revalidatePath("/patients");
  return { data };
}

export async function deletePatient(formData: FormData) {
  const supabase = await createClient();
  const tenantId = await getAuthorizedTenantId(supabase);
  if (!tenantId) return { error: TENANT_MISSING };
  const id = getFormValue(formData, "id");
  if (!id) return { error: DATABASE_ERROR };
  const { data, error } = await supabase.from("clinic_patients").update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", id).eq("tenant_id", tenantId).select().single();
  if (error) { logDatabaseError("deletePatient", error); return { error: DATABASE_ERROR }; }
  revalidatePath("/patients");
  return { data };
}
