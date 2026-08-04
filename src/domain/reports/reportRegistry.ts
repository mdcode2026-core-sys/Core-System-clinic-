import type { Permission } from "@/core/permissions/types";

export type DataSource =
  | "count_patients_total"
  | "count_patients_new"
  | "count_patients_active"
  | "count_agenda_total"
  | "count_agenda_cancelled"
  | "rate_agenda_attendance"
  | "count_queue_waiting"
  | "avg_queue_waiting_time"
  | "count_queue_completed"
  | "sum_billing_revenue"
  | "count_billing_paid"
  | "count_sum_billing_outstanding"
  | "list_inventory_low_stock"
  | "list_inventory_movements"
  | "list_inventory_most_consumed"
  | "count_followup_scheduled"
  | "count_followup_completed"
  | "count_followup_overdue";

export interface ReportDefinition {
  key: string;
  moduleKey: string;
  label: string;
  labelAr: string;
  dataSource: DataSource;
  needsDateRange: boolean;
}

/**
 * Canonical report registry — 18 reports, 3 per module.
 * Per Package 3.1.7 — exact data sources, no substitutions.
 */
export const reportRegistry: ReportDefinition[] = [
  // ── Patients (3) ──
  {
    key: "patients_total",
    moduleKey: "patients",
    label: "Total Patients",
    labelAr: "إجمالي المرضى",
    dataSource: "count_patients_total",
    needsDateRange: false,
  },
  {
    key: "patients_new",
    moduleKey: "patients",
    label: "New Patients",
    labelAr: "مرضى جدد",
    dataSource: "count_patients_new",
    needsDateRange: true,
  },
  {
    key: "patients_active",
    moduleKey: "patients",
    label: "Active Patients",
    labelAr: "مرضى نشطون",
    dataSource: "count_patients_active",
    needsDateRange: false,
  },

  // ── Agenda (3) ──
  {
    key: "agenda_total",
    moduleKey: "agenda",
    label: "Total Appointments",
    labelAr: "إجمالي المواعيد",
    dataSource: "count_agenda_total",
    needsDateRange: true,
  },
  {
    key: "agenda_cancelled",
    moduleKey: "agenda",
    label: "Cancelled Appointments",
    labelAr: "مواعيد ملغاة",
    dataSource: "count_agenda_cancelled",
    needsDateRange: true,
  },
  {
    key: "agenda_attendance_rate",
    moduleKey: "agenda",
    label: "Attendance Rate",
    labelAr: "معدل الحضور",
    dataSource: "rate_agenda_attendance",
    needsDateRange: true,
  },

  // ── Queue (3) ──
  {
    key: "queue_waiting",
    moduleKey: "queue",
    label: "Waiting Patients",
    labelAr: "مرضى في الانتظار",
    dataSource: "count_queue_waiting",
    needsDateRange: false,
  },
  {
    key: "queue_avg_wait",
    moduleKey: "queue",
    label: "Average Waiting Time",
    labelAr: "متوسط وقت الانتظار",
    dataSource: "avg_queue_waiting_time",
    needsDateRange: true,
  },
  {
    key: "queue_completed",
    moduleKey: "queue",
    label: "Completed Queue",
    labelAr: "طابور منجز",
    dataSource: "count_queue_completed",
    needsDateRange: true,
  },

  // ── Billing (3) ──
  {
    key: "billing_revenue",
    moduleKey: "billing",
    label: "Revenue Summary",
    labelAr: "ملخص الإيرادات",
    dataSource: "sum_billing_revenue",
    needsDateRange: true,
  },
  {
    key: "billing_paid",
    moduleKey: "billing",
    label: "Paid Invoices",
    labelAr: "فواتير مدفوعة",
    dataSource: "count_billing_paid",
    needsDateRange: true,
  },
  {
    key: "billing_outstanding",
    moduleKey: "billing",
    label: "Outstanding Invoices",
    labelAr: "فواتير مستحقة",
    dataSource: "count_sum_billing_outstanding",
    needsDateRange: false,
  },

  // ── Inventory (3) ──
  {
    key: "inventory_low_stock",
    moduleKey: "inventory",
    label: "Low Stock Items",
    labelAr: "عناصر منخفضة المخزون",
    dataSource: "list_inventory_low_stock",
    needsDateRange: false,
  },
  {
    key: "inventory_movements",
    moduleKey: "inventory",
    label: "Inventory Movements",
    labelAr: "حركات المخزون",
    dataSource: "list_inventory_movements",
    needsDateRange: true,
  },
  {
    key: "inventory_most_consumed",
    moduleKey: "inventory",
    label: "Most Consumed Items",
    labelAr: "أكثر العناصر استهلاكاً",
    dataSource: "list_inventory_most_consumed",
    needsDateRange: true,
  },

  // ── Follow-up (3) ──
  {
    key: "followup_scheduled",
    moduleKey: "followup",
    label: "Scheduled Follow-ups",
    labelAr: "متابعات مجدولة",
    dataSource: "count_followup_scheduled",
    needsDateRange: false,
  },
  {
    key: "followup_completed",
    moduleKey: "followup",
    label: "Completed Follow-ups",
    labelAr: "متابعات منجزة",
    dataSource: "count_followup_completed",
    needsDateRange: true,
  },
  {
    key: "followup_overdue",
    moduleKey: "followup",
    label: "Overdue Follow-ups",
    labelAr: "متابعات متأخرة",
    dataSource: "count_followup_overdue",
    needsDateRange: false,
  },
];

/**
 * Get all reports for a given module key.
 */
export function getReportsByModule(moduleKey: string): ReportDefinition[] {
  return reportRegistry.filter((r) => r.moduleKey === moduleKey);
}
