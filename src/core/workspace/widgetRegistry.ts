// src/core/workspace/widgetRegistry.ts
// Workspace Architecture — Widget Registry
// Per WORKSPACE_ARCHITECTURE_SPECIFICATION.md §7
// Contains exactly the five widgets built in Task 3 this session.

import type { WidgetDefinition } from "./workspace.types";

// Widget components — lazy imports to avoid circular deps
import { QuickRegistrationWidget } from "@/features/workspace/widgets/patients/QuickRegistrationWidget";
import { QuickAppointmentWidget } from "@/features/workspace/widgets/agenda/QuickAppointmentWidget";
import { QueueWidget } from "@/features/workspace/widgets/queue/QueueWidget";
import { BillingSummaryWidget } from "@/features/workspace/widgets/billing/BillingSummaryWidget";
import { AnalyticsOverviewWidget } from "@/features/workspace/widgets/analytics/AnalyticsOverviewWidget";

// ---------------------------------------------------------------------------
// Registry — ordered by layer (2 first, then 3), then by priority
// ---------------------------------------------------------------------------
export const widgetRegistry: WidgetDefinition[] = [
  // ── Layer 2: Interactive / Workflow ──
  {
    key: "quick-registration",
    label: "Quick Registration",
    labelAr: "تسجيل سريع",
    category: "interactive",
    layer: 2,
    defaultSize: { width: "half", height: "standard" },
    requiredPermission: "patients:create",
    moduleKey: "patients",
    component: QuickRegistrationWidget,
  },
  {
    key: "quick-appointment",
    label: "Quick Appointment",
    labelAr: "موعد سريع",
    category: "interactive",
    layer: 2,
    defaultSize: { width: "half", height: "standard" },
    requiredPermission: "agenda:create",
    moduleKey: "agenda",
    component: QuickAppointmentWidget,
  },
  {
    key: "queue",
    label: "Queue",
    labelAr: "الدور",
    category: "workflow",
    layer: 2,
    defaultSize: { width: "half", height: "standard" },
    requiredPermission: "sessions:read",
    moduleKey: "queue",
    component: QueueWidget,
  },

  // ── Layer 3: Informational / Analytics ──
  {
    key: "billing-summary",
    label: "Billing Summary",
    labelAr: "ملخص الفواتير",
    category: "informational",
    layer: 3,
    defaultSize: { width: "third", height: "compact" },
    requiredPermission: "invoices:read",
    moduleKey: "billing",
    component: BillingSummaryWidget,
  },
  {
    key: "analytics-overview",
    label: "Analytics Overview",
    labelAr: "نظرة عامة على التحليلات",
    category: "analytics",
    layer: 3,
    defaultSize: { width: "half", height: "tall" },
    requiredPermission: "analytics:read",
    moduleKey: "analytics",
    component: AnalyticsOverviewWidget,
  },
];

// Helper: lookup by key
export function getWidgetByKey(key: string): WidgetDefinition | undefined {
  return widgetRegistry.find((w) => w.key === key);
}

// Helper: all widgets for a given layer
export function getWidgetsByLayer(layer: 2 | 3): WidgetDefinition[] {
  return widgetRegistry.filter((w) => w.layer === layer);
}
