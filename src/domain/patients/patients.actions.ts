"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { getAuthorizedTenantId } from "@/domain/patients/patients.authorization";
import type { PatientInsert, PatientUpdate } from "@/domain/patients/patients.types";

const TENANT_MISSING = "PATIENT_TENANT_MISSING";
const DATABASE_ERROR = "PATIENT_DATABASE_ERROR";
type PatientMutationResult = { data?: { id: string }; error?: string };
function getFormValue(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}
function logDatabaseError(operation: string, error: { message: string; code?: string; details?: string; hint?: string }) {
  console.error(`[${operation}] database error`, { message: error.message, code: error.code, details: error.details, hint: error.hint });
}
function success(id: string): PatientMutationResult { return { data: { id } }; }
function failure(error: string): PatientMutationResult { return { error }; }

export async function createPatient(formData: FormData): Promise<PatientMutationResult> {
  const supabase = await createClient();
  const tenantId = await getAuthorizedTenantId(supabase);
  if (!tenantId) return failure(TENANT_MISSING);
  const registration = {
    first_name: getFormValue(formData, "first_name") ?? "",
    father_name: getFormValue(formData, "father_name") ?? "",
    family_name: getFormValue(formData, "family_name") ?? getFormValue(formData, "last_name") ?? "",
    mother_name: getFormValue(formData, "mother_name"),
    national_id: getFormValue(formData, "national_id"),
    phone_primary: getFormValue(formData, "phone_primary") ?? "",
    email: getFormValue(formData, "email"),
    gender: getFormValue(formData, "gender"),
    date_of_birth: getFormValue(formData, "date_of_birth"),
    age_at_registration: getFormValue(formData, "age_at_registration") ? Number(getFormValue(formData, "age_at_registration")) : null,
    age_reference_date: getFormValue(formData, "age_reference_date"),
    patient_status: getFormValue(formData, "patient_status") ?? "active",
  };
  const { data, error } = await supabase.rpc("register_patient_identity", { p_tenant_id: tenantId, p_registration: registration });
  if (error) {
    logDatabaseError("createPatient", error);
    return failure(DATABASE_ERROR);
  }
  if (!data?.success) return failure(data?.outcome === "REVIEW_REQUIRED" ? "PATIENT_REVIEW_REQUIRED" : data?.error ?? DATABASE_ERROR);
  return success(data.patient_id);
}

export async function createPatientFromObject(patientData: PatientInsert): Promise<PatientMutationResult> {
  const supabase = await createClient();
  const tenantId = await getAuthorizedTenantId(supabase);
  if (!tenantId) return failure(TENANT_MISSING);
  const registration = {
    first_name: patientData.first_name,
    father_name: patientData.father_name ?? "",
    family_name: patientData.family_name ?? patientData.last_name,
    mother_name: patientData.mother_name,
    national_id: patientData.national_id,
    phone_primary: patientData.phone_primary,
    email: patientData.email,
    gender: patientData.gender,
    date_of_birth: patientData.date_of_birth,
    age_at_registration: patientData.age_at_registration ?? null,
    age_reference_date: patientData.age_reference_date ?? null,
    patient_status: patientData.patient_status ?? "active",
  };
  const { data, error } = await supabase.rpc("register_patient_identity", { p_tenant_id: tenantId, p_registration: registration });
  if (error) {
    logDatabaseError("createPatientFromObject", error);
    return failure(DATABASE_ERROR);
  }
  if (!data?.success) return failure(data?.outcome === "REVIEW_REQUIRED" ? "PATIENT_REVIEW_REQUIRED" : data?.error ?? DATABASE_ERROR);
  return success(data.patient_id);
}

export async function updatePatient(formData: FormData): Promise<PatientMutationResult> {
  const supabase = await createClient();
  const tenantId = await getAuthorizedTenantId(supabase);
  if (!tenantId) return failure(TENANT_MISSING);
  const id = getFormValue(formData, "id");
  if (!id) return failure(DATABASE_ERROR);
  const registration = {
    first_name: getFormValue(formData, "first_name"),
    father_name: getFormValue(formData, "father_name"),
    family_name: getFormValue(formData, "family_name") ?? getFormValue(formData, "last_name"),
    mother_name: getFormValue(formData, "mother_name"),
    national_id: getFormValue(formData, "national_id"),
    phone_primary: getFormValue(formData, "phone_primary"),
    email: getFormValue(formData, "email"),
    gender: getFormValue(formData, "gender"),
    date_of_birth: getFormValue(formData, "date_of_birth"),
    age_at_registration: getFormValue(formData, "age_at_registration") ? Number(getFormValue(formData, "age_at_registration")) : null,
    age_reference_date: getFormValue(formData, "age_reference_date"),
  };
  const { data, error } = await supabase.rpc("update_patient_identity", { p_tenant_id: tenantId, p_patient_id: id, p_registration: registration });
  if (error) {
    logDatabaseError("updatePatient", error);
    return failure(DATABASE_ERROR);
  }
  if (!data?.success) return failure(data?.error ?? DATABASE_ERROR);
  return success(id);
}

export async function deletePatient(formData: FormData): Promise<PatientMutationResult> {
  const supabase = await createClient();
  const tenantId = await getAuthorizedTenantId(supabase);
  if (!tenantId) return failure(TENANT_MISSING);
  const id = getFormValue(formData, "id");
  if (!id) return failure(DATABASE_ERROR);
  const now = new Date().toISOString();
  const { error } = await supabase.from("clinic_patients").update({ deleted_at: now, updated_at: now }).eq("id", id).eq("tenant_id", tenantId);
  if (error) {
    logDatabaseError("deletePatient", error);
    return failure(DATABASE_ERROR);
  }
  return success(id);
}
