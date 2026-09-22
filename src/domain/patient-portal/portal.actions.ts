"use server";
import crypto from "node:crypto";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { hasEntitlement } from "@/core/entitlements/entitlementEngine";
export type PortalChannel = "email" | "sms" | "whatsapp";
const channelEntitlement: Record<PortalChannel, string> = { email: "communication.email", sms: "communication.sms", whatsapp: "communication.whatsapp" };
function normalizePhone(value: string | null | undefined) { return (value ?? "").replace(/[^\d+]/g, ""); }
function hashToken(token: string) { return crypto.createHash("sha256").update(token).digest("hex"); }
function appUrl() { const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL; const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL; const url = configured || (vercel ? `https://${vercel}` : ""); if (!url) throw new Error("Application URL is not configured"); return url.replace(/\/$/, ""); }
export async function createPatientPortalInvitation(input: { clinicPatientId: string; channel: PortalChannel; fallbackChannel?: PortalChannel | null }) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return { success: false, error: "unauthorized" };
  const { data: clinicUser } = await supabase.from("clinic_users").select("tenant_id").eq("auth_user_id", user.id).eq("is_active", true).is("deleted_at", null).maybeSingle(); if (!clinicUser?.tenant_id) return { success: false, error: "clinicUserNotFound" };
  const permissions = await getEffectivePermissions(user.id, clinicUser.tenant_id); if (!permissions.includes("patients:read")) return { success: false, error: "permissionDenied" };
  if (!(await hasEntitlement(clinicUser.tenant_id, "patient_portal"))) return { success: false, error: "disabled" };
  if (!(await hasEntitlement(clinicUser.tenant_id, channelEntitlement[input.channel]))) return { success: false, error: "channelDisabled" };
  if (input.fallbackChannel && !(await hasEntitlement(clinicUser.tenant_id, channelEntitlement[input.fallbackChannel]))) return { success: false, error: "fallbackDisabled" };
  if (input.fallbackChannel === input.channel) return { success: false, error: "fallbackSame" };
  const { data: patient, error: patientError } = await supabase.from("clinic_patients").select("id,tenant_id,email,phone_primary,deleted_at").eq("id", input.clinicPatientId).eq("tenant_id", clinicUser.tenant_id).maybeSingle(); if (patientError || !patient || patient.deleted_at) return { success: false, error: "patientNotFound" };
  const destination = input.channel === "email" ? patient.email : patient.phone_primary; if (!destination) return { success: false, error: "noDestination" };
  const token = crypto.randomBytes(32).toString("base64url"); const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); const invitationUrl = `${appUrl()}/portal/activate?token=${encodeURIComponent(token)}&channel=${input.channel}`;
  const { data: invitation, error: invitationError } = await supabase.from("patient_portal_invitations").insert({ tenant_id: clinicUser.tenant_id, clinic_patient_id: patient.id, channel: input.channel, destination, token_hash: hashToken(token), status: "pending", fallback_channel: input.fallbackChannel ?? null, expires_at: expiresAt, created_by: user.id, metadata: { invitation_version: 1 } }).select("id").single(); if (invitationError || !invitation) return { success: false, error: "createFailed" };
  const message = `You have been invited to activate your Patient Portal. Open this secure link to continue: ${invitationUrl}`;
  const { error: queueError } = await supabase.from("notification_queue").insert({ tenant_id: clinicUser.tenant_id, recipient_type: "patient", recipient_id: patient.id, recipient_phone: input.channel === "email" ? null : destination, recipient_email: input.channel === "email" ? destination : null, channel: input.channel, message_body: message, priority: 1, status: "queued", retry_count: 0, max_retries: 3, scheduled_at: new Date().toISOString(), metadata: { type: "patient_portal_invitation", invitation_id: invitation.id, fallback_channel: input.fallbackChannel ?? null } }); if (queueError) { await supabase.from("patient_portal_invitations").update({ status: "failed" }).eq("id", invitation.id); return { success: false, error: "queueFailed" }; }
  return { success: true, invitationId: invitation.id, expiresAt };
}
export async function claimPatientPortalInvitation(token: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "authRequired" };
  if (!token || token.length < 20) return { success: false, error: "invalidInvitation" };

  const { data: invitation, error: invitationError } = await supabase
    .from("patient_portal_invitations")
    .select("id,tenant_id,clinic_patient_id,channel,destination,status,expires_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (invitationError || !invitation) return { success: false, error: "invitationNotFound" };
  if (invitation.status !== "pending" && invitation.status !== "sent") return { success: false, error: "invitationInvalid" };
  if (new Date(invitation.expires_at).getTime() <= Date.now()) {
    await supabase.from("patient_portal_invitations").update({ status: "expired" }).eq("id", invitation.id);
    return { success: false, error: "invitationExpired" };
  }

  const identityValue = invitation.channel === "email" ? (user.email ?? "").toLowerCase() : normalizePhone(user.phone);
  const destination = invitation.channel === "email" ? invitation.destination.toLowerCase() : normalizePhone(invitation.destination);
  if (!identityValue || identityValue !== destination) return { success: false, error: "identityMismatch" };

  const { data: relationship } = await supabase
    .from("patient_clinic_relationships")
    .select("patient_identity_id")
    .eq("tenant_id", invitation.tenant_id)
    .eq("clinic_patient_id", invitation.clinic_patient_id)
    .eq("status", "active")
    .maybeSingle();
  if (!relationship?.patient_identity_id) return { success: false, error: "relationshipNotFound" };

  const { error: portalIdentityError } = await supabase
    .from("patient_portal_identities")
    .upsert({
      patient_identity_id: relationship.patient_identity_id,
      auth_user_id: user.id,
      status: "active",
      verified_at: new Date().toISOString(),
      last_authenticated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "patient_identity_id" });
  if (portalIdentityError) return { success: false, error: "portalIdentityBindFailed" };

  const { error: claimError } = await supabase
    .from("patient_portal_invitations")
    .update({ status: "claimed", claimed_at: new Date().toISOString() })
    .eq("id", invitation.id);
  if (claimError) return { success: false, error: "finalizeFailed" };

  return { success: true, tenantId: invitation.tenant_id, clinicPatientId: invitation.clinic_patient_id };
}
