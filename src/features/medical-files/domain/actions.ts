"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type { MedicalFileContext, MedicalFileKind } from "./types";

const BUCKET = "medical-files";
const UPLOAD_URL_TTL = 600;

async function getActor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");
  const { data: clinicUser, error } = await supabase
    .from("clinic_users")
    .select("id, tenant_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (error || !clinicUser) throw new Error("Clinic user not found");
  return { supabase, user, clinicUser };
}

async function requirePermission(permission: Parameters<typeof getEffectivePermissions>[0] extends string ? string : never) {
  const { user, clinicUser } = await getActor();
  const permissions = await getEffectivePermissions(user.id, clinicUser.tenant_id);
  if (!permissions.includes(permission as never)) throw new Error("Forbidden");
  return { user, clinicUser };
}

function kindFromMime(mime: string | null, filename: string): MedicalFileKind {
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  if (mime?.startsWith("image/")) return "image";
  if (mime?.startsWith("video/")) return "video";
  if (mime?.startsWith("audio/")) return "audio";
  if (mime === "application/dicom" || ext === "dcm" || ext === "dicom") return "dicom";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
  if (mime?.includes("pdf") || mime?.includes("document") || mime?.includes("text")) return "document";
  return "other";
}

export async function createMedicalFileUpload(input: {
  filename: string;
  mimeType: string | null;
  sizeBytes: number;
  patientId?: string;
  visitId?: string;
}) {
  const { supabase, clinicUser } = await getActor();
  const permissions = await getEffectivePermissions(clinicUser.id, clinicUser.tenant_id);
  if (!permissions.includes("medical_files:upload")) throw new Error("Forbidden");
  if (!input.filename || input.sizeBytes < 0) throw new Error("Invalid file metadata");
  if (input.patientId) {
    const { data: patient } = await supabase.from("clinic_patients").select("id").eq("id", input.patientId).eq("tenant_id", clinicUser.tenant_id).maybeSingle();
    if (!patient) throw new Error("Patient not found");
  }
  if (input.visitId) {
    const { data: visit } = await supabase.from("clinic_visit_sessions").select("id, patient_id").eq("id", input.visitId).eq("tenant_id", clinicUser.tenant_id).maybeSingle();
    if (!visit) throw new Error("Visit not found");
    if (input.patientId && visit.patient_id !== input.patientId) throw new Error("Visit does not belong to patient");
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("subscription_plans(storage_gb)")
    .eq("tenant_id", clinicUser.tenant_id)
    .in("status", ["trial", "active"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const plan = (subscription?.subscription_plans as { storage_gb?: number | null } | null);
  const quotaBytes = plan?.storage_gb == null ? null : plan.storage_gb * 1024 * 1024 * 1024;
  if (quotaBytes !== null) {
    const { data: usage } = await supabase
      .from("medical_files")
      .select("size_bytes")
      .eq("tenant_id", clinicUser.tenant_id)
      .neq("storage_status", "archived");
    const used = (usage ?? []).reduce((sum, row) => sum + Number(row.size_bytes ?? 0), 0);
    if (used + input.sizeBytes > quotaBytes) throw new Error("Medical file cloud storage quota exceeded");
  }

  const fileId = crypto.randomUUID();
  const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${clinicUser.tenant_id}/${fileId}/${safeName}`;
  const { data: signed, error: signedError } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (signedError || !signed) throw new Error(signedError?.message ?? "Unable to create upload URL");

  const { error: insertError } = await supabase.from("medical_files").insert({
    id: fileId,
    tenant_id: clinicUser.tenant_id,
    patient_id: input.patientId ?? null,
    visit_id: input.visitId ?? null,
    file_kind: kindFromMime(input.mimeType, input.filename),
    original_filename: input.filename,
    mime_type: input.mimeType,
    extension: input.filename.includes(".") ? input.filename.split(".").pop()?.toLowerCase() : null,
    size_bytes: input.sizeBytes,
    storage_provider: "cloud",
    storage_path: path,
    storage_status: "pending",
    availability: { cloud: "pending", local: "unknown" },
    created_by: clinicUser.id,
  });
  if (insertError) throw new Error(insertError.message);
  return { fileId, path, token: signed.token, bucket: BUCKET, expiresIn: UPLOAD_URL_TTL };
}

export async function finalizeMedicalFileUpload(fileId: string) {
  const { supabase, clinicUser } = await getActor();
  const permissions = await getEffectivePermissions(clinicUser.id, clinicUser.tenant_id);
  if (!permissions.includes("medical_files:upload")) throw new Error("Forbidden");
  const { data: file, error } = await supabase.from("medical_files").select("id, tenant_id, storage_path, size_bytes, checksum_sha256").eq("id", fileId).eq("tenant_id", clinicUser.tenant_id).maybeSingle();
  if (error || !file) throw new Error("Medical file not found");
  if (!file.storage_path) throw new Error("Storage path missing");
  const { data: objects } = await supabase.storage.from(BUCKET).list(file.storage_path.split("/").slice(0, 2).join("/"), { limit: 100 });
  if (!objects || objects.length === 0) throw new Error("Uploaded object was not found");
  await supabase.from("medical_files").update({ storage_status: "available", availability: { cloud: "available", local: "unknown" } }).eq("id", fileId).eq("tenant_id", clinicUser.tenant_id);
  await supabase.from("medical_file_storage_locations").upsert({ medical_file_id: fileId, tenant_id: clinicUser.tenant_id, provider: "cloud", object_path: file.storage_path, size_bytes: file.size_bytes, status: "available", last_verified_at: new Date().toISOString() }, { onConflict: "medical_file_id,provider,device_id" });
  await supabase.from("audit_trail").insert({ tenant_id: clinicUser.tenant_id, actor_id: clinicUser.id, actor_role: "clinic_user", action: "medical_file_upload", table_name: "medical_files", record_id: fileId, new_values: { storage_status: "available" } });
  return { ok: true };
}

export async function listMedicalFiles(context: MedicalFileContext = {}) {
  const { supabase, clinicUser } = await getActor();
  const permissions = await getEffectivePermissions(clinicUser.id, clinicUser.tenant_id);
  if (!permissions.includes("medical_files:read")) throw new Error("Forbidden");
  let query = supabase.from("medical_files").select("*").eq("tenant_id", clinicUser.tenant_id).neq("storage_status", "archived").order("created_at", { ascending: false }).limit(100);
  if (context.patientId) query = query.eq("patient_id", context.patientId);
  if (context.visitId) query = query.eq("visit_id", context.visitId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createMedicalFileDownloadUrl(fileId: string) {
  const { supabase, clinicUser } = await getActor();
  const permissions = await getEffectivePermissions(clinicUser.id, clinicUser.tenant_id);
  if (!permissions.includes("medical_files:read")) throw new Error("Forbidden");
  const { data: file, error } = await supabase.from("medical_files").select("id, storage_path, storage_status").eq("id", fileId).eq("tenant_id", clinicUser.tenant_id).maybeSingle();
  if (error || !file || file.storage_status === "archived" || !file.storage_path) throw new Error("Medical file unavailable");
  const { data, error: urlError } = await supabase.storage.from(BUCKET).createSignedUrl(file.storage_path, 300);
  if (urlError || !data?.signedUrl) throw new Error(urlError?.message ?? "Unable to create download URL");
  return data.signedUrl;
}

export async function archiveMedicalFile(fileId: string) {
  const { supabase, clinicUser } = await getActor();
  const permissions = await getEffectivePermissions(clinicUser.id, clinicUser.tenant_id);
  if (!permissions.includes("medical_files:archive")) throw new Error("Forbidden");
  const { error } = await supabase.from("medical_files").update({ storage_status: "archived", archived_at: new Date().toISOString(), archived_by: clinicUser.id }).eq("id", fileId).eq("tenant_id", clinicUser.tenant_id);
  if (error) throw new Error(error.message);
  await supabase.from("audit_trail").insert({ tenant_id: clinicUser.tenant_id, actor_id: clinicUser.id, actor_role: "clinic_user", action: "medical_file_archive", table_name: "medical_files", record_id: fileId });
  return { ok: true };
}
