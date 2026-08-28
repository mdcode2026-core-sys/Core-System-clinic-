import type { WidgetCategory, WidgetDefinition } from "./workspace.types";

/**
 * Stage 5 — Widget Library classification contract.
 *
 * This is presentation metadata only. Authorization remains owned by the
 * existing permission/feature engines on WidgetDefinition.
 */
export type WidgetSurfaceKind =
  | "information"
  | "action"
  | "operational"
  | "contextual"
  | "quick_action"
  | "full_page"
  | "sidebar_capability"
  | "none";

export type WidgetContext =
  | "global"
  | "operation"
  | "clinical"
  | "patient"
  | "visit"
  | "agenda"
  | "financial"
  | "followup"
  | "analytics";

export interface WidgetCatalogClassification {
  surfaceKind: WidgetSurfaceKind;
  domainOwner: string;
  purpose: string;
  purposeAr: string;
  contexts: readonly WidgetContext[];
  naturalSize: WidgetDefinition["defaultSize"];
  sidebarCapability: boolean;
  quickAction: boolean;
  rationale: string;
}

export const WIDGET_CATALOG_CLASSIFICATION: Record<string, WidgetCatalogClassification> = {
  "quick-registration": {
    surfaceKind: "quick_action",
    domainOwner: "Patients",
    purpose: "Register a patient without leaving the working surface.",
    purposeAr: "تسجيل المريض مباشرة دون مغادرة مساحة العمل.",
    contexts: ["global", "operation"],
    naturalSize: { width: "half", height: "standard" },
    sidebarCapability: false,
    quickAction: true,
    rationale: "High-frequency patient intake action; a compact Workspace entry point is more useful than duplicating the full Patients page.",
  },
  "quick-appointment": {
    surfaceKind: "quick_action",
    domainOwner: "Agenda",
    purpose: "Create an appointment from the working surface.",
    purposeAr: "إنشاء موعد مباشرة من مساحة العمل.",
    contexts: ["global", "operation", "agenda"],
    naturalSize: { width: "half", height: "standard" },
    sidebarCapability: false,
    quickAction: true,
    rationale: "High-frequency booking action; the full Agenda remains the authoritative scheduling surface.",
  },
  queue: {
    surfaceKind: "contextual",
    domainOwner: "Patient Flow",
    purpose: "Provide a fast view into the existing patient-flow queue.",
    purposeAr: "توفير وصول سريع إلى قائمة دور نظام رحلة المريض الحالية.",
    contexts: ["global", "operation", "clinical", "patient", "visit"],
    naturalSize: { width: "half", height: "standard" },
    sidebarCapability: false,
    quickAction: false,
    rationale: "Contextual surface of the existing Patient Flow/Queue capability; it must never replace or recreate Patient Flow.",
  },
  followup: {
    surfaceKind: "operational",
    domainOwner: "Follow-up",
    purpose: "Expose follow-up work requiring attention and open the authoritative worklist.",
    purposeAr: "إظهار أعمال المتابعة التي تحتاج إلى إجراء وفتح قائمة العمل الأصلية.",
    contexts: ["global", "operation", "clinical", "patient", "followup"],
    naturalSize: { width: "half", height: "standard" },
    sidebarCapability: true,
    quickAction: false,
    rationale: "Follow-up is actionable operational work; the Sidebar remains the full-domain entry point.",
  },
  "medical-files": {
    surfaceKind: "contextual",
    domainOwner: "Medical Files",
    purpose: "Surface relevant medical files in a clinical/patient context.",
    purposeAr: "إظهار الملفات الطبية ذات الصلة ضمن السياق السريري أو سياق المريض.",
    contexts: ["global", "clinical", "patient", "visit"],
    naturalSize: { width: "full", height: "tall" },
    sidebarCapability: false,
    quickAction: false,
    rationale: "Medical files benefit from patient/clinical context and should not become a miniature replacement for the full record experience.",
  },
  "billing-summary": {
    surfaceKind: "information",
    domainOwner: "Financial & Resources",
    purpose: "Provide concise billing status while keeping full financial work in Financial & Resources.",
    purposeAr: "تقديم ملخص موجز لحالة الفوترة مع إبقاء العمل المالي الكامل ضمن المالية والموارد.",
    contexts: ["global", "operation", "financial"],
    naturalSize: { width: "third", height: "compact" },
    sidebarCapability: true,
    quickAction: false,
    rationale: "A summary is useful in Workspace; invoices, payments and plans remain full-domain capabilities.",
  },
  "analytics-overview": {
    surfaceKind: "information",
    domainOwner: "Analytics",
    purpose: "Provide management-oriented analytics context without replacing the Analytics domain.",
    purposeAr: "توفير سياق تحليلي إداري دون استبدال نطاق التحليلات الكامل.",
    contexts: ["global", "analytics"],
    naturalSize: { width: "half", height: "tall" },
    sidebarCapability: true,
    quickAction: false,
    rationale: "Analytics is primarily a management/monitoring capability; the Widget is supporting context rather than a duplicate domain.",
  },
};

export function getWidgetClassification(key: string): WidgetCatalogClassification | undefined {
  return WIDGET_CATALOG_CLASSIFICATION[key];
}

export function getClassifiedWidgetCategory(key: string): WidgetCategory | undefined {
  const classification = getWidgetClassification(key);
  if (!classification) return undefined;
  if (classification.surfaceKind === "information") return "informational";
  if (classification.surfaceKind === "action" || classification.surfaceKind === "quick_action") return "interactive";
  if (classification.surfaceKind === "operational" || classification.surfaceKind === "contextual") return "workflow";
  return undefined;
}
