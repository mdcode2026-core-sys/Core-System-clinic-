// src/domain/followup/followup.queries.ts
// Package 3.1.9 — Follow-up Server Actions
// Reads and status updates only. No create/delete/delivery automation.

"use server";

import { createClient } from "@/infrastructure/supabase/server";
import type {
  FollowupRecord,
  FollowupListFilters,
  UpdateFollowupStatusInput,
} from "./followup.types";

// ── Helper: Resolve tenant_id from auth ──────────────────────
async function getTenantId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: clinicUser } = await supabase
    .from("clinic_users")
    .select("tenant_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!clinicUser?.tenant_id) throw new Error("Tenant not resolved");
  return clinicUser.tenant_id;
}

// ── 1. List Follow-ups (all or filtered) ─────────────────────
export async function listFollowups(
  filters: FollowupListFilters = {}
): Promise<{ success: true; data: FollowupRecord[] } | { success: false; error: string }> {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantId();

    let query = supabase
      .from("retention_followups")
      .select(`
        *,
        patient:patient_id(first_name, last_name, phone_primary),
        sender:sent_by(full_name)
      `)
      .eq("tenant_id", tenantId)
      .order("scheduled_for", { ascending: false });

    if (filters.status) {
      query = query.eq("delivery_status", filters.status);
    }
    if (filters.type) {
      query = query.eq("followup_type", filters.type);
    }
    if (filters.patient_id) {
      query = query.eq("patient_id", filters.patient_id);
    }
    if (filters.date_from) {
      query = query.gte("scheduled_for", `${filters.date_from}T00:00:00`);
    }
    if (filters.date_to) {
      query = query.lte("scheduled_for", `${filters.date_to}T23:59:59`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const enriched: FollowupRecord[] = (data ?? []).map((row: any) => ({
      ...row,
      patient_name: row.patient
        ? `${row.patient.first_name} ${row.patient.last_name}`
        : undefined,
      patient_phone: row.patient?.phone_primary ?? null,
      sent_by_name: row.sender?.full_name ?? null,
    }));

    return { success: true, data: enriched };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[followup.queries] listFollowups failed:", msg);
    return { success: false, error: msg };
  }
}

// ── 2. Scheduled Follow-ups (pending + future) ───────────────
export async function getScheduledFollowups(): Promise<{ success: true; data: FollowupRecord[] } | { success: false; error: string }> {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantId();

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("retention_followups")
      .select(`
        *,
        patient:patient_id(first_name, last_name, phone_primary),
        sender:sent_by(full_name)
      `)
      .eq("tenant_id", tenantId)
      .eq("delivery_status", "pending")
      .gte("scheduled_for", now)
      .order("scheduled_for", { ascending: true });

    if (error) throw new Error(error.message);

    const enriched: FollowupRecord[] = (data ?? []).map((row: any) => ({
      ...row,
      patient_name: row.patient
        ? `${row.patient.first_name} ${row.patient.last_name}`
        : undefined,
      patient_phone: row.patient?.phone_primary ?? null,
      sent_by_name: row.sender?.full_name ?? null,
    }));

    return { success: true, data: enriched };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[followup.queries] getScheduledFollowups failed:", msg);
    return { success: false, error: msg };
  }
}

// ── 3. Update Status Only ────────────────────────────────────
// This is the ONLY mutation permitted in Package 3.1.9 scope.
// No automated sending, no message composition, no delivery logic.
export async function updateFollowupStatus(
  input: UpdateFollowupStatusInput
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantId();

    // Verify ownership before update
    const { data: existing } = await supabase
      .from("retention_followups")
      .select("id")
      .eq("id", input.followup_id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (!existing) {
      return { success: false, error: "Follow-up not found or access denied" };
    }

    const updatePayload: Record<string, any> = {
      delivery_status: input.new_status,
      updated_at: new Date().toISOString(),
    };

    // Auto-populate sent_at when moving to 'sent'
    if (input.new_status === "sent") {
      updatePayload.sent_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("retention_followups")
      .update(updatePayload)
      .eq("id", input.followup_id)
      .eq("tenant_id", tenantId);

    if (error) throw new Error(error.message);

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[followup.queries] updateFollowupStatus failed:", msg);
    return { success: false, error: msg };
  }
}
