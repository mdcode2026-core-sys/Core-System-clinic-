"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { hasEntitlement } from "@/core/entitlements/entitlementEngine";

async function patientContext(tenantId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");
  const { data: identity } = await supabase.from("patient_identities").select("id,status").eq("auth_user_id", user.id).eq("status", "active").maybeSingle();
  if (!identity) throw new Error("Patient identity not found");
  const { data: relationship } = await supabase.from("patient_clinic_relationships").select("tenant_id,clinic_patient_id,status").eq("patient_identity_id", identity.id).eq("tenant_id", tenantId).eq("status", "active").maybeSingle();
  if (!relationship) throw new Error("Patient relationship not found");
  if (!(await hasEntitlement(tenantId, "patient_experience.advanced"))) throw new Error("Advanced Patient Experience is not enabled");
  return { supabase, user, relationship };
}

export async function listPatientMessages(tenantId: string) {
  const { supabase, relationship } = await patientContext(tenantId);
  const { data, error } = await supabase.from("patient_portal_messages").select("id,sender_type,body,status,created_at,read_at").eq("tenant_id", relationship.tenant_id).eq("clinic_patient_id", relationship.clinic_patient_id).order("created_at", { ascending: true }).limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function sendPatientMessage(tenantId: string, body: string) {
  const text = body.trim();
  if (!text || text.length > 10000) throw new Error("Message must be between 1 and 10000 characters");
  const { supabase, user, relationship } = await patientContext(tenantId);
  const { error } = await supabase.from("patient_portal_messages").insert({ tenant_id: relationship.tenant_id, clinic_patient_id: relationship.clinic_patient_id, sender_type: "patient", sender_auth_user_id: user.id, body: text, status: "unread" });
  if (error) throw new Error(error.message);
  return { ok: true };
}
