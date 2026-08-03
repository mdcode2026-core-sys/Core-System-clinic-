// src/domain/followup/followup.types.ts
// Package 3.1.9 — Follow-up Module Types
// Explicitly scoped to list view, scheduled view, and status update only.
// No delivery/automation logic — out of scope per milestone directive.

export type FollowupType =
  | "post_visit_24h"
  | "post_visit_7d"
  | "reactivation_30d"
  | "reactivation_60d"
  | "reactivation_90d"
  | "appointment_reminder_24h"
  | "appointment_reminder_2h"
  | "birthday"
  | "custom";

export type FollowupChannel = "whatsapp" | "sms" | "email" | "in_app";

export type FollowupDeliveryStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "cancelled";

// ── Database Row (enriched for UI) ───────────────────────────
export interface FollowupRecord {
  id: string;
  tenant_id: string;
  patient_id: string;
  session_id: string | null;
  scheduled_for: string; // ISO datetime
  followup_type: FollowupType;
  channel: FollowupChannel | null;
  message_body: string | null;
  delivery_status: FollowupDeliveryStatus | null;
  sent_at: string | null;
  delivered_at: string | null;
  response_received: boolean | null;
  sent_by: string | null; // clinic_user id
  created_at: string;
  updated_at: string;

  // Enriched fields (joined)
  patient_name?: string;
  patient_phone?: string | null;
  sent_by_name?: string | null;
}

// ── Status Update Input (the only mutation in scope) ─────────
export interface UpdateFollowupStatusInput {
  followup_id: string;
  new_status: FollowupDeliveryStatus;
}

// ── Filter Types ─────────────────────────────────────────────
export interface FollowupListFilters {
  status?: FollowupDeliveryStatus | null;
  type?: FollowupType | null;
  patient_id?: string | null;
  date_from?: string | null; // YYYY-MM-DD
  date_to?: string | null;   // YYYY-MM-DD
}

// ── View Modes ───────────────────────────────────────────────
export type FollowupViewMode = "list" | "scheduled";
