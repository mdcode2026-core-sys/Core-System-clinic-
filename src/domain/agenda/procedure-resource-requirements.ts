import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Read-only contract consumed by Agenda. Service/Procedure owns these requirements;
 * Agenda must never infer hidden requirements from selected UI resources.
 */
export interface BookingRequirementSet {
  provider: { required: boolean; providerType: string | null };
  room: { required: boolean };
  operationalResources: Array<{
    resourceType: string;
    required: boolean;
    quantity: number;
  }>;
  resourceRequirementsSource: "not-configured";
}

export function isProviderRequired(providerType: string | null | undefined) {
  const normalized = typeof providerType === "string" ? providerType.trim().toLowerCase() : "";
  return normalized.length > 0 && !["none", "optional", "not_required", "no_provider"].includes(normalized);
}

export interface ResourceConcurrencyPolicy {
  mode: "exclusive" | "capacity";
  capacity: number;
  simultaneous: boolean;
  /** Undefined until the owning domain publishes a canonical movement policy. */
  movable?: boolean;
  source: "default" | "owning-domain";
}

/**
 * In the absence of an authoritative owning-domain policy, the current exclusive
 * PostgreSQL constraint remains the defense-in-depth rule. This resolver does not
 * activate a capacity engine or fabricate a resource configuration record.
 */
export function resolveResourceConcurrencyPolicy(
  policy?: Partial<ResourceConcurrencyPolicy> | null,
): ResourceConcurrencyPolicy {
  if (!policy || policy.source !== "owning-domain") {
    return {
      mode: "exclusive",
      capacity: 1,
      simultaneous: false,
      source: "default",
    };
  }

  const capacity = Number(policy.capacity);
  if (policy.mode !== "capacity" || !Number.isInteger(capacity) || capacity < 1) {
    return {
      mode: "exclusive",
      capacity: 1,
      simultaneous: false,
      source: "default",
    };
  }

  return {
    mode: capacity > 1 ? "capacity" : "exclusive",
    capacity,
    simultaneous: capacity > 1 && policy.simultaneous === true,
    movable: policy.movable,
    source: "owning-domain",
  };
}

/**
 * Transitional Service/Procedure adapter:
 * - a configured provider_type means a provider is required;
 * - an empty/null or explicitly optional value means no hidden provider requirement;
 * - no live canonical procedure→resource requirements table exists, so resource
 *   requirements remain empty rather than reviving the historical inactive model.
 */
export async function resolveBookingRequirements(
  supabase: SupabaseClient,
  tenantId: string,
  procedureId: string | null,
): Promise<BookingRequirementSet> {
  if (!procedureId) {
    return {
      provider: { required: false, providerType: null },
      room: { required: false },
      operationalResources: [],
      resourceRequirementsSource: "not-configured",
    };
  }

  const { data, error } = await (supabase as any)
    .from("clinic_procedures")
    .select("id,tenant_id,provider_type")
    .eq("id", procedureId)
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw new Error("AGENDA_BOOKING_REQUIREMENTS_UNAVAILABLE");
  if (!data) throw new Error("AGENDA_PROCEDURE_NOT_AVAILABLE");

  const rawProviderType =
    typeof data.provider_type === "string" ? data.provider_type.trim() : "";

  return {
    provider: {
      required: isProviderRequired(rawProviderType),
      providerType: rawProviderType || null,
    },
    // No explicit canonical room-required fact exists in the current Service/Procedure source.
    room: { required: false },
    // Live schema reconciliation confirmed no active canonical requirement source.
    operationalResources: [],
    resourceRequirementsSource: "not-configured",
  };
}
