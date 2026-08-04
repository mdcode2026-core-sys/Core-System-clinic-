import type { Permission } from "@/core/permissions/types";

export interface ReportModule {
  key: string;
  label: string;
  labelAr: string;
  requiredPermission: Permission;
}

/**
 * Canonical module registry for Reports.
 * 6 modules, each mapped to its required permission.
 * Per Package 3.1.7 — no substitutions.
 */
export const reportModules: ReportModule[] = [
  {
    key: "patients",
    label: "Patients",
    labelAr: "المرضى",
    requiredPermission: "patients:read",
  },
  {
    key: "agenda",
    label: "Agenda",
    labelAr: "الأجندة",
    requiredPermission: "agenda:read",
  },
  {
    key: "queue",
    label: "Queue",
    labelAr: "الطابور",
    requiredPermission: "sessions:read",
  },
  {
    key: "billing",
    label: "Billing",
    labelAr: "الفواتير",
    requiredPermission: "invoices:read",
  },
  {
    key: "inventory",
    label: "Inventory",
    labelAr: "المخزون",
    requiredPermission: "inventory:read",
  },
  {
    key: "followup",
    label: "Follow-up",
    labelAr: "المتابعة",
    requiredPermission: "followup:read",
  },
];
