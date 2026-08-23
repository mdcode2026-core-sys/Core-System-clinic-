"use server";

import { hasEntitlement } from "@/core/entitlements/entitlementEngine";

export type PortalAvailability = { portal: boolean; email: boolean; sms: boolean; whatsapp: boolean };

export async function getPatientPortalAvailability(tenantId: string): Promise<PortalAvailability> {
  const portal = await hasEntitlement(tenantId, "patient_portal");
  if (!portal) return { portal: false, email: false, sms: false, whatsapp: false };
  const [email, sms, whatsapp] = await Promise.all([
    hasEntitlement(tenantId, "communication.email"),
    hasEntitlement(tenantId, "communication.sms"),
    hasEntitlement(tenantId, "communication.whatsapp"),
  ]);
  return { portal: true, email, sms, whatsapp };
}
