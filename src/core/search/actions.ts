"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";

export type GlobalSearchResult = {
  id: string;
  type: "patient" | "staff" | "invoice" | "appointment" | "treatment" | "procedure" | "inventory" | "supplier" | "purchase_order" | "communication";
  title: string;
  subtitle?: string;
  href: string;
};

const MAX_PER_TYPE = 5;

function ilike(value: string): string {
  return `%${value.replace(/[%_\\]/g, "\\$&").replace(/,/g, " ").trim()}%`;
}

export async function globalSearch(query: string): Promise<GlobalSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return [];

  const { data: tenantId, error: tenantError } = await supabase.rpc("get_current_tenant_id");
  if (tenantError || !tenantId) return [];

  const permissions = new Set(await getEffectivePermissions(authData.user.id, tenantId));
  const results: GlobalSearchResult[] = [];
  const pattern = ilike(q);

  if (permissions.has("patients:read")) {
    const { data } = await supabase
      .from("clinic_patients")
      .select("id, first_name, last_name, first_name_ar, last_name_ar, phone_primary, email, file_number")
      .eq("tenant_id", tenantId)
      .is("deleted_at", null)
      .or(`first_name.ilike.${pattern},last_name.ilike.${pattern},first_name_ar.ilike.${pattern},last_name_ar.ilike.${pattern},phone_primary.ilike.${pattern},phone_secondary.ilike.${pattern},email.ilike.${pattern},file_number.ilike.${pattern}`)
      .limit(MAX_PER_TYPE);
    for (const row of data ?? []) {
      const name = [row.first_name, row.last_name].filter(Boolean).join(" ");
      const arabicName = [row.first_name_ar, row.last_name_ar].filter(Boolean).join(" ");
      results.push({ id: row.id, type: "patient", title: arabicName || name || row.file_number || "Patient", subtitle: [row.file_number, row.phone_primary, row.email].filter(Boolean).join(" · "), href: `/patients/${row.id}` });
    }
  }

  if (permissions.has("users:read")) {
    const { data } = await supabase
      .from("clinic_users")
      .select("id, full_name, full_name_ar, email, phone, employee_code, specialization")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .or(`full_name.ilike.${pattern},full_name_ar.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern},employee_code.ilike.${pattern},specialization.ilike.${pattern}`)
      .limit(MAX_PER_TYPE);
    for (const row of data ?? []) {
      results.push({ id: row.id, type: "staff", title: row.full_name_ar || row.full_name || row.employee_code || "Staff", subtitle: [row.employee_code, row.specialization, row.email].filter(Boolean).join(" · "), href: "/settings" });
    }
  }

  if (permissions.has("invoices:read")) {
    const { data } = await supabase
      .from("clinic_invoices")
      .select("id, invoice_number, invoice_status, invoice_date, patient_id")
      .eq("tenant_id", tenantId)
      .or(`invoice_number.ilike.${pattern},invoice_status.ilike.${pattern},notes.ilike.${pattern}`)
      .order("invoice_date", { ascending: false })
      .limit(MAX_PER_TYPE);
    for (const row of data ?? []) {
      results.push({ id: row.id, type: "invoice", title: row.invoice_number || "Invoice", subtitle: [row.invoice_status, row.invoice_date].filter(Boolean).join(" · "), href: row.patient_id ? `/invoices?patientId=${row.patient_id}` : "/invoices" });
    }
  }

  if (permissions.has("agenda:read")) {
    const { data } = await supabase
      .from("master_agenda_events")
      .select("id, patient_id, scheduled_start, event_type, visit_type, status, booking_notes")
      .eq("tenant_id", tenantId)
      .or(`event_type.ilike.${pattern},visit_type.ilike.${pattern},status.ilike.${pattern},booking_notes.ilike.${pattern}`)
      .order("scheduled_start", { ascending: false })
      .limit(MAX_PER_TYPE);
    for (const row of data ?? []) {
      results.push({ id: row.id, type: "appointment", title: row.visit_type || row.event_type || "Appointment", subtitle: [row.status, row.scheduled_start ? new Date(row.scheduled_start).toLocaleString() : ""].filter(Boolean).join(" · "), href: row.patient_id ? `/agenda?patientId=${row.patient_id}` : "/agenda" });
    }
  }

  if (permissions.has("treatment_plans:read")) {
    const { data } = await supabase
      .from("clinic_treatment_plans")
      .select("id, patient_id, title, diagnosis_summary, status")
      .eq("tenant_id", tenantId)
      .or(`title.ilike.${pattern},diagnosis_summary.ilike.${pattern},goals.ilike.${pattern},status.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(MAX_PER_TYPE);
    for (const row of data ?? []) {
      results.push({ id: row.id, type: "treatment", title: row.title || "Treatment plan", subtitle: [row.status, row.diagnosis_summary].filter(Boolean).join(" · "), href: row.patient_id ? `/treatment-plans?patientId=${row.patient_id}` : "/treatment-plans" });
    }
  }

  if (permissions.has("procedures:read")) {
    const { data } = await supabase
      .from("clinic_procedures")
      .select("id, procedure_name, procedure_name_ar, procedure_code, category, specialty, service_type")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .or(`procedure_name.ilike.${pattern},procedure_name_ar.ilike.${pattern},procedure_code.ilike.${pattern},category.ilike.${pattern},specialty.ilike.${pattern},service_type.ilike.${pattern}`)
      .limit(MAX_PER_TYPE);
    for (const row of data ?? []) {
      results.push({ id: row.id, type: "procedure", title: row.procedure_name_ar || row.procedure_name || row.procedure_code || "Service", subtitle: [row.procedure_code, row.category, row.specialty].filter(Boolean).join(" · "), href: "/settings" });
    }
  }

  if (permissions.has("inventory:read")) {
    const { data } = await supabase
      .from("inventory_items")
      .select("id, name, name_ar, unit, current_stock, reorder_threshold")
      .eq("tenant_id", tenantId)
      .is("deleted_at", null)
      .or(`name.ilike.${pattern},name_ar.ilike.${pattern},unit.ilike.${pattern}`)
      .limit(MAX_PER_TYPE);
    for (const row of data ?? []) {
      results.push({ id: row.id, type: "inventory", title: row.name_ar || row.name || "Inventory item", subtitle: `${row.current_stock ?? 0} ${row.unit ?? ""}`.trim(), href: "/inventory" });
    }
  }

  if (permissions.has("purchasing:read")) {
    const { data: suppliers } = await supabase
      .from("suppliers")
      .select("id, name, name_ar, contact_name, phone, email")
      .eq("tenant_id", tenantId)
      .or(`name.ilike.${pattern},name_ar.ilike.${pattern},contact_name.ilike.${pattern},phone.ilike.${pattern},email.ilike.${pattern}`)
      .limit(MAX_PER_TYPE);
    for (const row of suppliers ?? []) {
      results.push({ id: row.id, type: "supplier", title: row.name_ar || row.name || "Supplier", subtitle: [row.contact_name, row.phone, row.email].filter(Boolean).join(" · "), href: "/financial-resources/purchasing/suppliers" });
    }

    const { data: orders } = await supabase
      .from("purchase_orders")
      .select("id, order_number, status, order_date, supplier_id")
      .eq("tenant_id", tenantId)
      .or(`order_number.ilike.${pattern},status.ilike.${pattern},notes.ilike.${pattern}`)
      .order("order_date", { ascending: false })
      .limit(MAX_PER_TYPE);
    for (const row of orders ?? []) {
      results.push({ id: row.id, type: "purchase_order", title: row.order_number || "Purchase order", subtitle: [row.status, row.order_date].filter(Boolean).join(" · "), href: "/financial-resources/purchasing" });
    }
  }

  if (permissions.has("patients:read")) {
    const { data } = await supabase
      .from("patient_portal_messages")
      .select("id, clinic_patient_id, body, sender_type, status, created_at")
      .eq("tenant_id", tenantId)
      .ilike("body", pattern)
      .order("created_at", { ascending: false })
      .limit(MAX_PER_TYPE);
    for (const row of data ?? []) {
      results.push({ id: row.id, type: "communication", title: row.body?.slice(0, 80) || "Communication", subtitle: [row.sender_type, row.status].filter(Boolean).join(" · "), href: row.clinic_patient_id ? `/patients/${row.clinic_patient_id}` : "/patients" });
    }
  }

  return results.slice(0, 30);
}
