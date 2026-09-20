"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import type { EnrichedSession } from "./queue.types";

export type D3CommandResult = {
  command: string;
  tenant_id: string;
  visit_id: string;
  previous_status: string;
  new_status: string;
  work_session_id: string | null;
  queue_entry_id: string | null;
  event_id: string;
  correlation_id: string;
};

type D3Context = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  tenantId: string;
};

async function getD3Context(): Promise<D3Context> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Not authenticated");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) throw new Error("No tenant assigned");
  return { supabase, tenantId };
}

function ensureResult(data: unknown, command: string): D3CommandResult {
  if (!data || typeof data !== "object") throw new Error(`${command} returned no command result`);
  const result = data as Partial<D3CommandResult>;
  if (result.command !== command || !result.visit_id || !result.event_id || !result.correlation_id) {
    throw new Error(`${command} returned an invalid command result`);
  }
  return result as D3CommandResult;
}

async function loadSession(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tenantId: string,
  visitId: string,
): Promise<EnrichedSession> {
  const { data, error } = await supabase
    .from("clinic_visit_sessions")
    .select("*")
    .eq("id", visitId)
    .eq("tenant_id", tenantId)
    .single();
  if (error || !data) throw new Error(error?.message ?? "Session not found");
  return data as EnrichedSession;
}

function correlationId(input?: string) {
  return input ?? crypto.randomUUID();
}

export async function d3EnterWaiting(input: {
  visitId: string;
  laneKey?: string;
  priorityClass?: string;
  entryReason?: string;
  routingTarget?: string | null;
  correlationId?: string;
}): Promise<EnrichedSession> {
  const { supabase, tenantId } = await getD3Context();
  const id = correlationId(input.correlationId);
  const { data, error } = await supabase.rpc("csapi_d3_enter_waiting", {
    p_visit_id: input.visitId,
    p_lane_key: input.laneKey ?? "general",
    p_priority_class: input.priorityClass ?? "normal",
    p_entry_reason: input.entryReason ?? "arrival",
    p_routing_target: input.routingTarget ?? null,
    p_correlation_id: id,
  });
  if (error) throw new Error(error.message);
  const result = ensureResult(data, "csapi_d3_enter_waiting");
  return loadSession(supabase, tenantId, result.visit_id);
}

export async function d3ReorderWaiting(input: {
  queueEntryId: string;
  targetPosition: number;
  targetLaneKey?: string | null;
  routingTarget?: string | null;
  correlationId?: string;
}): Promise<EnrichedSession> {
  const { supabase, tenantId } = await getD3Context();
  const id = correlationId(input.correlationId);
  const { data, error } = await supabase.rpc("csapi_d3_reorder_waiting", {
    p_queue_entry_id: input.queueEntryId,
    p_target_position: input.targetPosition,
    p_target_lane_key: input.targetLaneKey ?? null,
    p_routing_target: input.routingTarget ?? null,
    p_correlation_id: id,
  });
  if (error) throw new Error(error.message);
  const result = ensureResult(data, "csapi_d3_reorder_waiting");
  return loadSession(supabase, tenantId, result.visit_id);
}

export async function d3StartClinicalWork(visitId: string, correlationId?: string): Promise<EnrichedSession> {
  const { supabase, tenantId } = await getD3Context();
  const id = correlationId ?? crypto.randomUUID();
  const { data, error } = await supabase.rpc("csapi_d3_start_clinical_work", {
    p_visit_id: visitId,
    p_correlation_id: id,
  });
  if (error) throw new Error(error.message);
  const result = ensureResult(data, "csapi_d3_start_clinical_work");
  return loadSession(supabase, tenantId, result.visit_id);
}

export async function d3FinishClinicalWork(visitId: string, correlationId?: string): Promise<EnrichedSession> {
  const { supabase, tenantId } = await getD3Context();
  const id = correlationId ?? crypto.randomUUID();
  const { data, error } = await supabase.rpc("csapi_d3_finish_clinical_work", {
    p_visit_id: visitId,
    p_correlation_id: id,
  });
  if (error) throw new Error(error.message);
  const result = ensureResult(data, "csapi_d3_finish_clinical_work");
  return loadSession(supabase, tenantId, result.visit_id);
}

export async function d3CompleteReception(visitId: string, correlationId?: string): Promise<EnrichedSession> {
  const { supabase, tenantId } = await getD3Context();
  const id = correlationId ?? crypto.randomUUID();
  const { data, error } = await supabase.rpc("csapi_d3_complete_reception", {
    p_visit_id: visitId,
    p_correlation_id: id,
  });
  if (error) throw new Error(error.message);
  const result = ensureResult(data, "csapi_d3_complete_reception");
  return loadSession(supabase, tenantId, result.visit_id);
}

export async function d3CancelPatientFlow(
  visitId: string,
  reason?: string | null,
  correlationId?: string,
): Promise<EnrichedSession> {
  const { supabase, tenantId } = await getD3Context();
  const id = correlationId ?? crypto.randomUUID();
  const { data, error } = await supabase.rpc("csapi_d3_cancel_patient_flow", {
    p_visit_id: visitId,
    p_reason: reason ?? null,
    p_correlation_id: id,
  });
  if (error) throw new Error(error.message);
  const result = ensureResult(data, "csapi_d3_cancel_patient_flow");
  return loadSession(supabase, tenantId, result.visit_id);
}

export async function d3MarkNoShow(
  visitId: string,
  reason?: string | null,
  correlationId?: string,
): Promise<EnrichedSession> {
  const { supabase, tenantId } = await getD3Context();
  const id = correlationId ?? crypto.randomUUID();
  const { data, error } = await supabase.rpc("csapi_d3_mark_no_show", {
    p_visit_id: visitId,
    p_reason: reason ?? null,
    p_correlation_id: id,
  });
  if (error) throw new Error(error.message);
  const result = ensureResult(data, "csapi_d3_mark_no_show");
  return loadSession(supabase, tenantId, result.visit_id);
}
