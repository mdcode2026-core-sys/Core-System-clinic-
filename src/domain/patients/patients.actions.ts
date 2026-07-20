"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import type { PatientInsert, PatientUpdate } from "@/domain/patients/patients.types";

export async function createPatient(formData: FormData) {
  const supabase = await createClient();
  
  // الحصول على المستخدم الحالي
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "غير مصرح" };
  }

  // قراءة tenant_id من user_metadata
  const tenantId = user.user_metadata?.tenant_id as string | undefined;
  if (!tenantId) {
    return { error: "لم يتم التعرف على العيادة" };
  }

  const dateOfBirth = formData.get("date_of_birth");
  const firstVisitDate = formData.get("first_visit_date");

  const patient: PatientInsert = {
    tenant_id: tenantId, // استخدام tenant_id من المستخدم
    first_name: String(formData.get("first_name")),
    last_name: String(formData.get("last_name")),
    first_name_ar: String(formData.get("first_name_ar") || ""),
    last_name_ar: String(formData.get("last_name_ar") || ""),
    date_of_birth: dateOfBirth ? String(dateOfBirth) : undefined,
    gender: String(formData.get("gender") || "") as "male" | "female" | "other" | undefined,
    phone_primary: String(formData.get("phone_primary")),
    phone_secondary: String(formData.get("phone_secondary") || ""),
    email: String(formData.get("email") || ""),
    preferred_channel: String(formData.get("preferred_channel") || "whatsapp") as "whatsapp" | "sms" | "email" | "phone",
    first_visit_date: firstVisitDate ? String(firstVisitDate) : undefined,
    referral_source: String(formData.get("referral_source") || ""),
    patient_status: String(formData.get("patient_status") || "active") as "active" | "inactive" | "archived" | "blocked",
    notes: String(formData.get("notes") || ""),
  };

  const { data, error } = await supabase
    .from("clinic_patients")
    .insert(patient)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/patients");
  return { data };
}

export async function updatePatient(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "غير مصرح" };
  }

  const tenantId = user.user_metadata?.tenant_id as string | undefined;
  if (!tenantId) {
    return { error: "لم يتم التعرف على العيادة" };
  }

  const id = String(formData.get("id"));
  const dateOfBirth = formData.get("date_of_birth");
  const firstVisitDate = formData.get("first_visit_date");

  const update: PatientUpdate = {
    first_name: String(formData.get("first_name") || ""),
    last_name: String(formData.get("last_name") || ""),
    first_name_ar: String(formData.get("first_name_ar") || ""),
    last_name_ar: String(formData.get("last_name_ar") || ""),
    date_of_birth: dateOfBirth ? String(dateOfBirth) : undefined,
    gender: String(formData.get("gender") || "") as "male" | "female" | "other" | undefined,
    phone_primary: String(formData.get("phone_primary") || ""),
    phone_secondary: String(formData.get("phone_secondary") || ""),
    email: String(formData.get("email") || ""),
    preferred_channel: String(formData.get("preferred_channel") || "") as "whatsapp" | "sms" | "email" | "phone",
    first_visit_date: firstVisitDate ? String(firstVisitDate) : undefined,
    referral_source: String(formData.get("referral_source") || ""),
    patient_status: String(formData.get("patient_status") || "") as "active" | "inactive" | "archived" | "blocked",
    notes: String(formData.get("notes") || ""),
  };

  Object.keys(update).forEach((key) => {
    if (update[key as keyof PatientUpdate] === "") {
      delete update[key as keyof PatientUpdate];
    }
  });

  const { data, error } = await supabase
    .from("clinic_patients")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("tenant_id", tenantId) // التحقق من tenant_id
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/patients");
  return { data };
}

export async function deletePatient(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "غير مصرح" };
  }

  const tenantId = user.user_metadata?.tenant_id as string | undefined;
  if (!tenantId) {
    return { error: "لم يتم التعرف على العيادة" };
  }

  const id = String(formData.get("id"));

  const { data, error } = await supabase
    .from("clinic_patients")
    .update({ 
      deleted_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    })
    .eq("id", id)
    .eq("tenant_id", tenantId) // التحقق من tenant_id
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/patients");
  return { data };
}
