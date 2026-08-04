"use server";

import { createClient } from "@/infrastructure/supabase/server";
import type { DataSource } from "./reportRegistry";

// ── Shared helper: resolve tenant_id from auth context ──
async function getTenantId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const tenantId = user?.app_metadata?.tenant_id || user?.user_metadata?.tenant_id;
  return tenantId ?? null;
}

// ── Type-safe report result shape ──
export interface ReportResult {
  columns: string[];
  rows: Record<string, unknown>[];
  summary?: Record<string, unknown>;
}

// ── 1. Patients ──

/** Total Patients — COUNT(*) FROM clinic_patients WHERE tenant_id=$1 AND deleted_at IS NULL */
export async function getTotalPatients(): Promise<ReportResult> {
  const tenantId = await getTenantId();
  if (!tenantId) return { columns: ["total_patients"], rows: [] };

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("clinic_patients")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .is("deleted_at", null);

  if (error) throw new Error(`getTotalPatients: ${error.message}`);
  return {
    columns: ["total_patients"],
    rows: [{ total_patients: count ?? 0 }],
  };
}

/** New Patients — same + created_at within selected date range */
export async function getNewPatients(
  startDate: string,
  endDate: string
): Promise<ReportResult> {
  const tenantId = await getTenantId();
  if (!tenantId) return { columns: ["new_patients"], rows: [] };

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("clinic_patients")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .is("deleted_at", null)
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (error) throw new Error(`getNewPatients: ${error.message}`);
  return {
    columns: ["new_patients"],
    rows: [{ new_patients: count ?? 0 }],
  };
}

/** Active Patients — same + patient_status='active' */
export async function getActivePatients(): Promise<ReportResult> {
  const tenantId = await getTenantId();
  if (!tenantId) return { columns: ["active_patients"], rows: [] };

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("clinic_patients")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .is("deleted_at", null)
    .eq("patient_status", "active");

  if (error) throw new Error(`getActivePatients: ${error.message}`);
  return {
    columns: ["active_patients"],
    rows: [{ active_patients: count ?? 0 }],
  };
}

// ── 2. Agenda ──

/** Total Appointments — COUNT(*) FROM master_agenda_events WHERE tenant_id=$1 AND scheduled_start within range */
export async function getTotalAppointments(
  startDate: string,
  endDate: string
): Promise<ReportResult> {
  const tenantId = await getTenantId();
  if (!tenantId) return { columns: ["total_appointments"], rows: [] };

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("master_agenda_events")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .gte("scheduled_start", startDate)
    .lte("scheduled_start", endDate);

  if (error) throw new Error(`getTotalAppointments: ${error.message}`);
  return {
    columns: ["total_appointments"],
    rows: [{ total_appointments: count ?? 0 }],
  };
}

/** Cancelled Appointments — same + status='cancelled' */
export async function getCancelledAppointments(
  startDate: string,
  endDate: string
): Promise<ReportResult> {
  const tenantId = await getTenantId();
  if (!tenantId) return { columns: ["cancelled_appointments"], rows: [] };

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("master_agenda_events")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("status", "cancelled")
    .gte("scheduled_start", startDate)
    .lte("scheduled_start", endDate);

  if (error) throw new Error(`getCancelledAppointments: ${error.message}`);
  return {
    columns: ["cancelled_appointments"],
    rows: [{ cancelled_appointments: count ?? 0 }],
  };
}

/**
 * Attendance Rate — completed / (total - cancelled - rescheduled) within range.
 * Returns a percentage (0–100).
 */
export async function getAttendanceRate(
  startDate: string,
  endDate: string
): Promise<ReportResult> {
  const tenantId = await getTenantId();
  if (!tenantId) return { columns: ["attendance_rate"], rows: [] };

  const supabase = await createClient();

  const { count: total, error: tErr } = await supabase
    .from("master_agenda_events")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .gte("scheduled_start", startDate)
    .lte("scheduled_start", endDate);

  if (tErr) throw new Error(`getAttendanceRate (total): ${tErr.message}`);

  const { count: cancelled, error: cErr } = await supabase
    .from("master_agenda_events")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("status", "cancelled")
    .gte("scheduled_start", startDate)
    .lte("scheduled_start", endDate);

  if (cErr) throw new Error(`getAttendanceRate (cancelled): ${cErr.message}`);

  const { count: rescheduled, error: rErr } = await supabase
    .from("master_agenda_events")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("status", "rescheduled")
    .gte("scheduled_start", startDate)
    .lte("scheduled_start", endDate);

  if (rErr) throw new Error(`getAttendanceRate (rescheduled): ${rErr.message}`);

  const denominator = (total ?? 0) - (cancelled ?? 0) - (rescheduled ?? 0);
  const rate = denominator > 0 ? Math.round(((total ?? 0) / denominator) * 100) : 0;

  return {
    columns: ["attendance_rate"],
    rows: [{ attendance_rate: `${rate}%` }],
  };
}

// ── 3. Queue ──

/** Waiting Patients — COUNT(*) FROM clinic_visit_sessions WHERE session_status='waiting' (current snapshot, no date range) */
export async function getWaitingPatients(): Promise<ReportResult> {
  const tenantId = await getTenantId();
  if (!tenantId) return { columns: ["waiting_patients"], rows: [] };

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("clinic_visit_sessions")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("session_status", "waiting");

  if (error) throw new Error(`getWaitingPatients: ${error.message}`);
  return {
    columns: ["waiting_patients"],
    rows: [{ waiting_patients: count ?? 0 }],
  };
}

/** Average Waiting Time — AVG(waiting_time_minutes) within range */
export async function getAverageWaitingTime(
  startDate: string,
  endDate: string
): Promise<ReportResult> {
  const tenantId = await getTenantId();
  if (!tenantId) return { columns: ["avg_waiting_time_minutes"], rows: [] };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clinic_visit_sessions")
    .select("waiting_time_minutes")
    .eq("tenant_id", tenantId)
    .not("waiting_time_minutes", "is", null)
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (error) throw new Error(`getAverageWaitingTime: ${error.message}`);

  const values = (data ?? []).map((r) => r.waiting_time_minutes as number);
  const avg = values.length > 0
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : 0;

  return {
    columns: ["avg_waiting_time_minutes"],
    rows: [{ avg_waiting_time_minutes: avg }],
  };
}

/** Completed Queue — COUNT(*) WHERE session_status='completed' within range */
export async function getCompletedQueue(
  startDate: string,
  endDate: string
): Promise<ReportResult> {
  const tenantId = await getTenantId();
  if (!tenantId) return { columns: ["completed_queue"], rows: [] };

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("clinic_visit_sessions")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("session_status", "completed")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (error) throw new Error(`getCompletedQueue: ${error.message}`);
  return {
    columns: ["completed_queue"],
    rows: [{ completed_queue: count ?? 0 }],
  };
}

// ── 4. Billing ──

/** Revenue Summary — SUM(amount_paid_subunits) FROM clinic_invoices within range */
export async function getRevenueSummary(
  startDate: string,
  endDate: string
): Promise<ReportResult> {
  const tenantId = await getTenantId();
  if (!tenantId) return { columns: ["revenue_subunits", "revenue_formatted"], rows: [] };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clinic_invoices")
    .select("amount_paid_subunits")
    .eq("tenant_id", tenantId)
    .gte("invoice_date", startDate)
    .lte("invoice_date", endDate);

  if (error) throw new Error(`getRevenueSummary: ${error.message}`);

  const total = (data ?? []).reduce((sum, r) => sum + (r.amount_paid_subunits ?? 0), 0);

  return {
    columns: ["revenue_subunits", "revenue_formatted"],
    rows: [{ revenue_subunits: total, revenue_formatted: `${(total / 100).toFixed(2)}` }],
  };
}

/** Paid Invoices — COUNT(*) WHERE invoice_status='paid' within range */
export async function getPaidInvoices(
  startDate: string,
  endDate: string
): Promise<ReportResult> {
  const tenantId = await getTenantId();
  if (!tenantId) return { columns: ["paid_invoices"], rows: [] };

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("clinic_invoices")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("invoice_status", "paid")
    .gte("invoice_date", startDate)
    .lte("invoice_date", endDate);

  if (error) throw new Error(`getPaidInvoices: ${error.message}`);
  return {
    columns: ["paid_invoices"],
    rows: [{ paid_invoices: count ?? 0 }],
  };
}

/**
 * Outstanding Invoices — COUNT(*), SUM(amount_due_subunits) WHERE invoice_status IN ('issued','partial')
 */
export async function getOutstandingInvoices(): Promise<ReportResult> {
  const tenantId = await getTenantId();
  if (!tenantId) return { columns: ["count", "amount_due_subunits", "amount_due_formatted"], rows: [] };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clinic_invoices")
    .select("amount_due_subunits")
    .eq("tenant_id", tenantId)
    .in("invoice_status", ["issued", "partial"]);

  if (error) throw new Error(`getOutstandingInvoices: ${error.message}`);

  const count = (data ?? []).length;
  const totalDue = (data ?? []).reduce((sum, r) => sum + (r.amount_due_subunits ?? 0), 0);

  return {
    columns: ["count", "amount_due_subunits", "amount_due_formatted"],
    rows: [{
      count,
      amount_due_subunits: totalDue,
      amount_due_formatted: `${(totalDue / 100).toFixed(2)}`,
    }],
  };
}

// ── 5. Inventory ──

/** Low Stock Items — SELECT * FROM inventory_items WHERE current_stock <= reorder_threshold AND is_active (current snapshot) */
export async function getLowStockItems(): Promise<ReportResult> {
  const tenantId = await getTenantId();
  if (!tenantId) return { columns: [], rows: [] };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .select("name, name_ar, unit, current_stock, reorder_threshold")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .lte("current_stock", "reorder_threshold");

  if (error) {
    // Fallback: use raw RPC if column comparison fails in Supabase JS
    const { data: rawData, error: rawErr } = await supabase.rpc("get_low_stock_items", {
      p_tenant_id: tenantId,
    });
    if (rawErr) throw new Error(`getLowStockItems: ${rawErr.message}`);
    return {
      columns: ["name", "name_ar", "unit", "current_stock", "reorder_threshold"],
      rows: (rawData ?? []) as Record<string, unknown>[],
    };
  }

  return {
    columns: ["name", "name_ar", "unit", "current_stock", "reorder_threshold"],
    rows: (data ?? []) as Record<string, unknown>[],
  };
}

/** Inventory Movements — inventory_ledger joined to inventory_items within range */
export async function getInventoryMovements(
  startDate: string,
  endDate: string
): Promise<ReportResult> {
  const tenantId = await getTenantId();
  if (!tenantId) return { columns: [], rows: [] };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_ledger")
    .select(`
      id,
      material_name,
      quantity_consumed,
      consumption_type,
      created_at,
      inventory_items (name, name_ar, unit)
    `)
    .eq("tenant_id", tenantId)
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getInventoryMovements: ${error.message}`);

  return {
    columns: ["material_name", "quantity_consumed", "consumption_type", "created_at", "item_name", "item_name_ar", "unit"],
    rows: (data ?? []).map((r) => ({
      material_name: r.material_name,
      quantity_consumed: r.quantity_consumed,
      consumption_type: r.consumption_type,
      created_at: r.created_at,
      item_name: (r.inventory_items as Record<string, unknown> | null)?.name ?? null,
      item_name_ar: (r.inventory_items as Record<string, unknown> | null)?.name_ar ?? null,
      unit: (r.inventory_items as Record<string, unknown> | null)?.unit ?? null,
    })),
  };
}

/** Most Consumed Items — GROUP BY item_id, SUM(quantity_consumed) ORDER BY DESC within range */
export async function getMostConsumedItems(
  startDate: string,
  endDate: string
): Promise<ReportResult> {
  const tenantId = await getTenantId();
  if (!tenantId) return { columns: [], rows: [] };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_ledger")
    .select("material_name, quantity_consumed")
    .eq("tenant_id", tenantId)
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (error) throw new Error(`getMostConsumedItems: ${error.message}`);

  // Aggregate in JS (no GROUP BY in Supabase JS without RPC)
  const agg = new Map<string, number>();
  for (const r of data ?? []) {
    const name = r.material_name as string;
    const qty = Math.abs(r.quantity_consumed as number);
    agg.set(name, (agg.get(name) ?? 0) + qty);
  }

  const rows = Array.from(agg.entries())
    .map(([material_name, total_consumed]) => ({ material_name, total_consumed }))
    .sort((a, b) => b.total_consumed - a.total_consumed);

  return {
    columns: ["material_name", "total_consumed"],
    rows: rows as Record<string, unknown>[],
  };
}

// ── 6. Follow-up ──

/** Scheduled Follow-ups — COUNT(*) FROM retention_followups WHERE delivery_status='pending' AND scheduled_for >= now() */
export async function getScheduledFollowups(): Promise<ReportResult> {
  const tenantId = await getTenantId();
  if (!tenantId) return { columns: ["scheduled_followups"], rows: [] };

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { count, error } = await supabase
    .from("retention_followups")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("delivery_status", "pending")
    .gte("scheduled_for", now);

  if (error) throw new Error(`getScheduledFollowups: ${error.message}`);
  return {
    columns: ["scheduled_followups"],
    rows: [{ scheduled_followups: count ?? 0 }],
  };
}

/** Completed Follow-ups — COUNT(*) WHERE delivery_status IN ('sent','delivered') within range */
export async function getCompletedFollowups(
  startDate: string,
  endDate: string
): Promise<ReportResult> {
  const tenantId = await getTenantId();
  if (!tenantId) return { columns: ["completed_followups"], rows: [] };

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("retention_followups")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .in("delivery_status", ["sent", "delivered"])
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (error) throw new Error(`getCompletedFollowups: ${error.message}`);
  return {
    columns: ["completed_followups"],
    rows: [{ completed_followups: count ?? 0 }],
  };
}

/** Overdue Follow-ups — COUNT(*) WHERE delivery_status='pending' AND scheduled_for < now() */
export async function getOverdueFollowups(): Promise<ReportResult> {
  const tenantId = await getTenantId();
  if (!tenantId) return { columns: ["overdue_followups"], rows: [] };

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { count, error } = await supabase
    .from("retention_followups")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("delivery_status", "pending")
    .lt("scheduled_for", now);

  if (error) throw new Error(`getOverdueFollowups: ${error.message}`);
  return {
    columns: ["overdue_followups"],
    rows: [{ overdue_followups: count ?? 0 }],
  };
}

// ── Dispatcher ──

export async function runReport(
  dataSource: DataSource,
  startDate?: string,
  endDate?: string
): Promise<ReportResult> {
  switch (dataSource) {
    // Patients
    case "count_patients_total":
      return getTotalPatients();
    case "count_patients_new":
      if (!startDate || !endDate) throw new Error("Date range required");
      return getNewPatients(startDate, endDate);
    case "count_patients_active":
      return getActivePatients();

    // Agenda
    case "count_agenda_total":
      if (!startDate || !endDate) throw new Error("Date range required");
      return getTotalAppointments(startDate, endDate);
    case "count_agenda_cancelled":
      if (!startDate || !endDate) throw new Error("Date range required");
      return getCancelledAppointments(startDate, endDate);
    case "rate_agenda_attendance":
      if (!startDate || !endDate) throw new Error("Date range required");
      return getAttendanceRate(startDate, endDate);

    // Queue
    case "count_queue_waiting":
      return getWaitingPatients();
    case "avg_queue_waiting_time":
      if (!startDate || !endDate) throw new Error("Date range required");
      return getAverageWaitingTime(startDate, endDate);
    case "count_queue_completed":
      if (!startDate || !endDate) throw new Error("Date range required");
      return getCompletedQueue(startDate, endDate);

    // Billing
    case "sum_billing_revenue":
      if (!startDate || !endDate) throw new Error("Date range required");
      return getRevenueSummary(startDate, endDate);
    case "count_billing_paid":
      if (!startDate || !endDate) throw new Error("Date range required");
      return getPaidInvoices(startDate, endDate);
    case "count_sum_billing_outstanding":
      return getOutstandingInvoices();

    // Inventory
    case "list_inventory_low_stock":
      return getLowStockItems();
    case "list_inventory_movements":
      if (!startDate || !endDate) throw new Error("Date range required");
      return getInventoryMovements(startDate, endDate);
    case "list_inventory_most_consumed":
      if (!startDate || !endDate) throw new Error("Date range required");
      return getMostConsumedItems(startDate, endDate);

    // Follow-up
    case "count_followup_scheduled":
      return getScheduledFollowups();
    case "count_followup_completed":
      if (!startDate || !endDate) throw new Error("Date range required");
      return getCompletedFollowups(startDate, endDate);
    case "count_followup_overdue":
      return getOverdueFollowups();

    default:
      throw new Error(`Unknown dataSource: ${dataSource}`);
  }
}
