"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";

async function actor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");
  const { data: clinicUser } = await supabase.from("clinic_users").select("id, tenant_id").eq("auth_user_id", user.id).maybeSingle();
  if (!clinicUser) throw new Error("Clinic user not found");
  const permissions = await getEffectivePermissions(user.id, clinicUser.tenant_id);
  if (!permissions.includes("medical_files:update")) throw new Error("Forbidden");
  return { supabase, clinicUser };
}

export async function saveMedicalAnnotation(input: { fileId: string; annotationType: string; payload: Record<string, unknown> }) {
  const { supabase, clinicUser } = await actor();
  const { data: file } = await supabase.from("medical_files").select("id").eq("id", input.fileId).eq("tenant_id", clinicUser.tenant_id).maybeSingle();
  if (!file) throw new Error("Medical file not found");
  const { data, error } = await supabase.from("medical_file_annotations").insert({ medical_file_id: input.fileId, tenant_id: clinicUser.tenant_id, created_by: clinicUser.id, annotation_type: input.annotationType, payload: input.payload }).select("id").single();
  if (error) throw new Error(error.message);
  if (input.annotationType.toLowerCase().includes("length") || input.annotationType.toLowerCase().includes("measurement")) {
    await supabase.from("medical_file_measurements").insert({ medical_file_id: input.fileId, tenant_id: clinicUser.tenant_id, created_by: clinicUser.id, measurement_type: input.annotationType, payload: input.payload });
  }
  return data;
}

export async function saveMedicalAiResult(input: { fileId: string; provider: string; model?: string; status?: string; result: Record<string, unknown> }) {
  const { supabase, clinicUser } = await actor();
  const { data: file } = await supabase.from("medical_files").select("id").eq("id", input.fileId).eq("tenant_id", clinicUser.tenant_id).maybeSingle();
  if (!file) throw new Error("Medical file not found");
  const { data, error } = await supabase.from("medical_file_ai_results").insert({ medical_file_id: input.fileId, tenant_id: clinicUser.tenant_id, provider: input.provider, model: input.model ?? null, status: input.status ?? "completed", result: input.result }).select("id").single();
  if (error) throw new Error(error.message);
  return data;
}
