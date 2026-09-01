// src/core/workspace/widgetRegistry.ts
import type { WidgetDefinition } from "./workspace.types";
import { QuickRegistrationWidget } from "@/features/workspace/widgets/patients/QuickRegistrationWidget";
import { QuickAppointmentWidget } from "@/features/workspace/widgets/agenda/QuickAppointmentWidget";
import { QueueWidget } from "@/features/workspace/widgets/queue/QueueWidget";
import { FollowupWidget } from "@/features/workspace/widgets/followup/FollowupWidget";
import { BillingSummaryWidget } from "@/features/workspace/widgets/billing/BillingSummaryWidget";
import { AnalyticsOverviewWidget } from "@/features/workspace/widgets/analytics/AnalyticsOverviewWidget";
import { MedicalFilesWidget } from "@/features/workspace/widgets/medical-files/MedicalFilesWidget";

export const widgetRegistry: WidgetDefinition[] = [
  { key: "quick-registration", label: "Quick Registration", labelAr: "تسجيل سريع", category: "interactive", layer: 2, defaultSize: { width: "half", height: "standard" }, requiredPermission: "patients:create", moduleKey: "patients", component: QuickRegistrationWidget, defaultWorkspaces: ["operation"] },
  { key: "quick-appointment", label: "Quick Appointment", labelAr: "موعد سريع", category: "interactive", layer: 2, defaultSize: { width: "half", height: "standard" }, requiredPermission: "agenda:create", moduleKey: "agenda", component: QuickAppointmentWidget, defaultWorkspaces: ["operation"] },
  { key: "queue", label: "Queue", labelAr: "الدور", category: "workflow", layer: 2, defaultSize: { width: "half", height: "standard" }, requiredPermission: "sessions:read", moduleKey: "queue", component: QueueWidget, defaultWorkspaces: ["operation", "clinical"] },
  { key: "followup", label: "Follow-up", labelAr: "المتابعة", category: "workflow", layer: 2, defaultSize: { width: "half", height: "standard" }, requiredPermission: "followup:read", moduleKey: "followup", component: FollowupWidget, defaultWorkspaces: ["operation", "clinical"] },
  { key: "medical-files", label: "Medical Files", labelAr: "الملفات الطبية", category: "interactive", layer: 2, defaultSize: { width: "full", height: "tall" }, requiredPermission: "medical_files:read", moduleKey: "medical_files", component: MedicalFilesWidget, defaultWorkspaces: ["clinical"], contextual: true },
  { key: "billing-summary", label: "Billing Summary", labelAr: "ملخص الفواتير", category: "informational", layer: 3, defaultSize: { width: "third", height: "compact" }, requiredPermission: "invoices:read", moduleKey: "billing", component: BillingSummaryWidget, defaultWorkspaces: ["operation", "administration"] },
  { key: "analytics-overview", label: "Analytics Overview", labelAr: "نظرة عامة على التحليلات", category: "analytics", layer: 3, defaultSize: { width: "half", height: "tall" }, requiredPermission: "analytics:read", moduleKey: "analytics", component: AnalyticsOverviewWidget, defaultWorkspaces: ["administration"] },
];

export function getWidgetByKey(key: string): WidgetDefinition | undefined { return widgetRegistry.find((w) => w.key === key); }
export function getWidgetsByLayer(layer: 2 | 3): WidgetDefinition[] { return widgetRegistry.filter((w) => w.layer === layer); }
