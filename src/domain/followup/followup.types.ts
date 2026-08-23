// src/domain/followup/followup.types.ts
// PJ Stage 9 — Follow-up Work Management

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

export type FollowupActionType = "call" | "whatsapp" | "sms" | "email" | "appointment" | "review" | "general";
export type FollowupExecutionMode = "manual" | "automated";
export type FollowupStatus = "open" | "in_progress" | "completed" | "cancelled" | "skipped";
export type FollowupChannel = "whatsapp" | "sms" | "email" | "in_app";
export type FollowupDeliveryStatus = "pending" | "sent" | "delivered" | "read" | "failed" | "cancelled";

export interface FollowupRecord {
  id: string;
  tenant_id: string;
  patient_id: string;
  session_id: string | null;
  scheduled_for: string;
  followup_type: FollowupType;
  action_type: FollowupActionType;
  execution_mode: FollowupExecutionMode;
  status: FollowupStatus;
  assigned_to: string | null;
  created_by: string | null;
  updated_by: string | null;
  reason: string | null;
  message_body: string | null;
  result: string | null;
  outcome: string | null;
  next_action_at: string | null;
  next_action_type: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  channel: FollowupChannel | null;
  delivery_status: FollowupDeliveryStatus | null;
  sent_at: string | null;
  delivered_at: string | null;
  response_received: boolean | null;
  sent_by: string | null;
  created_at: string;
  updated_at: string;
  patient_name?: string;
  patient_phone?: string | null;
  assigned_to_name?: string | null;
  created_by_name?: string | null;
}

export interface FollowupPatientOption { id: string; name: string; phone: string; }
export interface CreateFollowupInput {
  patient_id: string;
  session_id?: string | null;
  scheduled_for: string;
  followup_type: FollowupType;
  action_type: FollowupActionType;
  assigned_to?: string | null;
  reason?: string | null;
  channel?: FollowupChannel | null;
  message_body?: string | null;
}
export interface UpdateFollowupInput {
  followup_id: string;
  status?: FollowupStatus;
  assigned_to?: string | null;
  scheduled_for?: string;
  reason?: string | null;
  result?: string | null;
  outcome?: string | null;
  next_action_at?: string | null;
  next_action_type?: string | null;
  message_body?: string | null;
  channel?: FollowupChannel | null;
}
export interface FollowupListFilters {
  status?: FollowupStatus | null;
  type?: FollowupType | null;
  action_type?: FollowupActionType | null;
  patient_id?: string | null;
  date_from?: string | null;
  date_to?: string | null;
}
export type FollowupViewMode = "work" | "list" | "scheduled";
