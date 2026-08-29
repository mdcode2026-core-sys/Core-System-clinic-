"use server";

import { createClient } from "@/infrastructure/supabase/server";

export type AccessDecision = {
  allowed: boolean;
  reason:
    | "granted"
    | "entitlement_missing"
    | "entitlement_inactive"
    | "capability_missing"
    | "tenant_missing";
};

function isEffective(row: { status: string; effective_from: string; effective_until: string | null }) {
  const now = Date.now();
  return (
    row.status === "active" &&
    new Date(row.effective_from).getTime() <= now &&
    (!row.effective_until || new Date(row.effective_until).getTime() > now)
  );
}

async function isClinicAdmin(tenantId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clinic_users")
    .select("roles!clinic_users_role_id_fkey(role_key)")
    .eq("tenant_id", tenantId)
    .eq("auth_user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) return false;
  const role = Array.isArray(data.roles) ? data.roles[0] : data.roles;
  return (role as { role_key?: string } | null)?.role_key === "clinic_admin";
}

export async function hasEntitlement(tenantId: string, entitlementKey: string): Promise<boolean> {
  if (await isClinicAdmin(tenantId)) return true;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tenant_entitlements")
    .select("status,effective_from,effective_until")
    .eq("tenant_id", tenantId)
    .eq("entitlement_key", entitlementKey)
    .maybeSingle();

  if (error || !data) return false;
  return isEffective(data);
}

export async function hasCapability(tenantId: string, capabilityKey: string): Promise<boolean> {
  if (await isClinicAdmin(tenantId)) return true;
  const supabase = await createClient();
  const { data: mapping, error: mappingError } = await supabase
    .from("entitlement_capabilities")
    .select("entitlement_key")
    .eq("capability_key", capabilityKey);

  if (mappingError || !mapping?.length) return false;

  const entitlementKeys = mapping.map((row) => row.entitlement_key);
  const { data: grants, error: grantsError } = await supabase
    .from("tenant_entitlements")
    .select("status,effective_from,effective_until")
    .eq("tenant_id", tenantId)
    .in("entitlement_key", entitlementKeys);

  if (grantsError || !grants) return false;
  return grants.some(isEffective);
}

export async function canAccessCapability(
  tenantId: string | null,
  capabilityKey: string,
): Promise<AccessDecision> {
  if (!tenantId) return { allowed: false, reason: "tenant_missing" };

  const allowed = await hasCapability(tenantId, capabilityKey);
  return { allowed, reason: allowed ? "granted" : "capability_missing" };
}
