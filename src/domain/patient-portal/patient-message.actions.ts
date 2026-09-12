"use server";

import { createClient } from "@/infrastructure/supabase/server";

async function patientContext(tenantId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");
  const { data: identity } = await supabase
    .from("patient_identities")
    .select("id,status")
    .eq("auth_user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (!identity) throw new Error("Patient identity not found");
  const { data: relationship } = await supabase
    .from("patient_clinic_relationships")
    .select("tenant_id,clinic_patient_id,status")
    .eq("patient_identity_id", identity.id)
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .maybeSingle();
  if (!relationship) throw new Error("Patient relationship not found");
  return { supabase, user, identity, relationship };
}

async function getOrCreatePatientConversation(tenantId: string) {
  const { supabase, identity, relationship } = await patientContext(tenantId);
  const existing = await supabase
    .from("communication_conversations")
    .select("id")
    .eq("tenant_id", relationship.tenant_id)
    .eq("clinic_patient_id", relationship.clinic_patient_id)
    .eq("kind", "patient")
    .neq("status", "archived")
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return { supabase, identity, relationship, conversationId: existing.data.id };

  const created = await supabase
    .from("communication_conversations")
    .insert({
      tenant_id: relationship.tenant_id,
      kind: "patient",
      subject: "Patient communication",
      clinic_patient_id: relationship.clinic_patient_id,
      created_by: null,
      status: "open",
    })
    .select("id")
    .single();
  if (created.error || !created.data) throw new Error(created.error?.message || "Unable to create conversation");
  return { supabase, identity, relationship, conversationId: created.data.id };
}

export async function listPatientMessages(tenantId: string) {
  const { supabase, relationship } = await patientContext(tenantId);
  const { data: conversation } = await supabase
    .from("communication_conversations")
    .select("id")
    .eq("tenant_id", relationship.tenant_id)
    .eq("clinic_patient_id", relationship.clinic_patient_id)
    .eq("kind", "patient")
    .neq("status", "archived")
    .maybeSingle();
  if (!conversation) return [];

  const { data, error } = await supabase
    .from("communication_messages")
    .select("id,body,sender_type,created_at")
    .eq("tenant_id", relationship.tenant_id)
    .eq("conversation_id", conversation.id)
    .eq("message_kind", "message")
    .order("created_at", { ascending: true })
    .limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function sendPatientMessage(tenantId: string, body: string) {
  const text = body.trim();
  if (!text || text.length > 10000) throw new Error("Message must be between 1 and 10000 characters");
  const { supabase, identity, relationship, conversationId } = await getOrCreatePatientConversation(tenantId);
  const { error } = await supabase.from("communication_messages").insert({
    tenant_id: relationship.tenant_id,
    conversation_id: conversationId,
    sender_clinic_user_id: null,
    sender_patient_identity_id: identity.id,
    sender_type: "patient",
    body: text,
    message_kind: "message",
  });
  if (error) throw new Error(error.message);
  return { ok: true };
}
