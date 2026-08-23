"use server";

import { createHash, randomBytes } from "node:crypto";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";

function sha256(value: string) { return createHash("sha256").update(value).digest("hex"); }

export async function registerMedicalFileAgent(input: { deviceName: string; deviceType?: string; osInfo?: string; agentVersion?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");
  const { data: clinicUser } = await supabase.from("clinic_users").select("id, tenant_id").eq("auth_user_id", user.id).maybeSingle();
  if (!clinicUser) throw new Error("Clinic user not found");
  const permissions = await getEffectivePermissions(user.id, clinicUser.tenant_id);
  if (!permissions.includes("medical_files:manage")) throw new Error("Forbidden");
  const token = `mfa_${randomBytes(32).toString("hex")}`;
  const fingerprint = sha256(`${clinicUser.tenant_id}:${input.deviceName}:${randomBytes(16).toString("hex")}`);
  const { data: device, error } = await supabase.from("tenant_devices").insert({ tenant_id: clinicUser.tenant_id, device_fingerprint: fingerprint, device_name: input.deviceName, device_type: input.deviceType ?? "clinic_storage_agent", os_info: input.osInfo ?? null, agent_version: input.agentVersion ?? null, capabilities: { medical_files: true, local_storage: true, sync: true }, health_status: "registered", agent_token_hash: sha256(token) }).select("id, device_name, registered_at").single();
  if (error || !device) throw new Error(error?.message ?? "Unable to register agent");
  return { device, token };
}
