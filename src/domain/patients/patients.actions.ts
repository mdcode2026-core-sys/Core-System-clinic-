"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import type { PatientInsert, PatientUpdate } from "@/domain/patients/patients.types";

export async function createPatient(formData: FormData) {
  const supabase = await createClient();
  
  const dateOfBirth = formData.get("date_of_birth");
  const firstVisitDate = formData.get("first_visit_date");

  const patient: PatientInsert = {
    tenant_id: String(formData.get("tenant_id")),
    first_name: String(formData.get("first_name")),
    last_name: String(formData.get("last_name")),
    first_name_ar: String(formData.get("first_name_ar") || ""),
    last_name_ar: String(formData.get("last_name_ar") || ""),
    date_of_birth: dateOfBirth ? String(dateOfBirth) : null,
    gender: String(formData.get("gender") || "") as "male" | "female" | "other" | null,
    phone_primary: String(formData.get("phone_primary")),
    phone_secondary: String(formData.get("phone_secondary") || ""),
    email: String(formData.get("email") || ""),
    preferred_channel: String(formData.get("preferred_channel") || "whatsapp") as "whatsapp" | "sms" | "email" | "phone",
    first_visit_date: firstVisitDate ? String(firstVisitDate) : null,
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
  
  const id = String(formData.get("id"));
  const dateOfBirth = formData.get("date_of_birth");
  const firstVisitDate = formData.get("first_visit_date");

  const update: PatientUpdate = {
    first_name: String(formData.get("first_name") || ""),
    last_name: String(formData.get("last_name") || ""),
    first_name_ar: String(formData.get("first_name_ar") || ""),
    last_name_ar: String(formData.get("last_name_ar") || ""),
    date_of_birth: dateOfBirth ? String(dateOfBirth) : null,
    gender: String(formData.get("gender") || "") as "male" | "female" | "other" | null,
    phone_primary: String(formData.get("phone_primary") || ""),
    phone_secondary: String(formData.get("phone_secondary") || ""),
    email: String(formData.get("email") || ""),
    preferred_channel: String(formData.get("preferred_channel") || "") as "whatsapp" | "sms" | "email" | "phone",
    first_visit_date: firstVisitDate ? String(firstVisitDate) : null,
    referral_source: String(formData.get("referral_source") || ""),
    patient_status: String(formData.get("patient_status") || "") as "active" | "inactive" | "archived" | "blocked",
    notes: String(formData.get("notes") || ""),
  };

  // إزالة الحقول الفارغة
  Object.keys(update).forEach((key) => {
    if (update[key as keyof PatientUpdate] === "") {
      delete update[key as keyof PatientUpdate];
    }
  });

  const { data, error } = await supabase
    .from("clinic_patients")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("id", id)
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
  
  const id = String(formData.get("id"));
  const tenantId = String(formData.get("tenant_id"));

  const { data, error } = await supabase
    .from("clinic_patients")
    .update({ 
      deleted_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    })
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/patients");
  return { data };
}
