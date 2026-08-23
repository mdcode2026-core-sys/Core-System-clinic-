"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { hasEntitlement } from "@/core/entitlements/entitlementEngine";

const BUCKET = "medical-files";

async function clinicActor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");
  const { data: clinicUser } = await supabase.from("clinic_users").select("id,tenant_id").eq("auth_user_id", user.id).eq("is_active", true).is("deleted_at", null).maybeSingle();
  if (!clinicUser) throw new Error("Clinic user not found");
  return { supabase, user, clinicUser };
}

export async function releaseMedicalFileToPatient(input: { medicalFileId: string; patientId: string; expiresAt?: string | null; note?: string | null }) {
  const { supabase, user, clinicUser } = await clinicActor();
  const permissions = await getEffectivePermissions(user.id, clinicUser.tenant_id);
  if (!permissions.includes("medical_files:read") || !permissions.includes("patients:read")) throw new Error("Forbidden");
  if (!(await hasEntitlement(clinicUser.tenant_id, "patient_portal"))) throw new Error("Patient Portal is not enabled");

  const { data: file } = await supabase.from("medical_files").select("id,patient_id,tenant_id,storage_status,storage_path").eq("id", input.medicalFileId).eq("tenant_id", clinicUser.tenant_id).maybeSingle();
  if (!file || file.patient_id !== input.patientId || file.storage_status === "archived" || !file.storage_path) throw new Error("Medical file is not eligible for release");

  const { data: patient } = await supabase.from("clinic_patients").select("id").eq("id", input.patientId).eq("tenant_id", clinicUser.tenant_id).maybeSingle();
  if (!patient) throw new Error("Patient not found");

  const { error } = await supabase.from("patient_portal_medical_file_releases").upsert({
    tenant_id: clinicUser.tenant_id,
    clinic_patient_id: input.patientId,
    medical_file_id: input.medicalFileId,
    status: "active",
    released_at: new Date().toISOString(),
    released_by: user.id,
    expires_at: input.expiresAt ?? null,
    note: input.note ?? null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "clinic_patient_id,medical_file_id" });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function revokeMedicalFilePatientRelease(medicalFileId: string, patientId: string) {
  const { supabase, user, clinicUser } = await clinicActor();
  const permissions = await getEffectivePermissions(user.id, clinicUser.tenant_id);
  if (!permissions.includes("medical_files:read")) throw new Error("Forbidden");
  const { error } = await supabase.from("patient_portal_medical_file_releases").update({ status: "revoked", updated_at: new Date().toISOString() }).eq("medical_file_id", medicalFileId).eq("clinic_patient_id", patientId).eq("tenant_id", clinicUser.tenant_id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function createPatientMedicalFileDownloadUrl(tenantId: string, medicalFileId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const { data: identity } = await supabase.from("patient_identities").select("id,status").eq("auth_user_id", user.id).eq("status", "active").maybeSingle();
  if (!identity) throw new Error("Patient identity not found");
  if (!(await hasEntitlement(tenantId, "patient_portal"))) throw new Error("Patient Portal is not enabled");

  const { data: relationship } = await supabase.from("patient_clinic_relationships").select("tenant_id,clinic_patient_id,status").eq("patient_identity_id", identity.id).eq("tenant_id", tenantId).eq("status", "active").maybeSingle();
  if (!relationship) throw new Error("Patient relationship not found");

  const { data: release } = await supabase.from("patient_portal_medical_file_releases").select("medical_file_id,clinic_patient_id,expires_at").eq("medical_file_id", medicalFileId).eq("clinic_patient_id", relationship.clinic_patient_id).eq("tenant_id", tenantId).eq("status", "active").maybeSingle();
  if (!release || (release.expires_at && new Date(release.expires_at).getTime() <= Date.now())) throw new Error("Medical file has not been released to the patient");

  const { data: file } = await supabase.from("medical_files").select("storage_path,storage_status").eq("id", medicalFileId).eq("patient_id", relationship.clinic_patient_id).eq("tenant_id", tenantId).maybeSingle();
  if (!file?.storage_path || file.storage_status === "archived") throw new Error("Medical file is unavailable");
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(file.storage_path, 300);
  if (error || !data?.signedUrl) throw new Error(error?.message ?? "Unable to create secure file URL");
  return data.signedUrl;
}
