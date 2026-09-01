// src/core/navigation/navigationRegistry.ts
// Single source of truth for user-facing Sidebar Modules/Domains and their authorization.

import type { Permission } from "@/core/permissions/types";
import { messages } from "@/core/i18n/messages";
import { LayoutDashboard, Users, CalendarDays, FileText, FileBarChart, BarChart3, PhoneCall, Settings, BriefcaseBusiness, Stethoscope, ClipboardList, CreditCard, WalletCards, ShieldCheck, Boxes, Truck, ShoppingCart, ClipboardCheck, MessageCircle, ListChecks } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavigationLabelKey = keyof typeof messages.en.nav;
export type NavigationLabel = { ar: string; en: string };
export type SurfaceTier = "core" | "advanced" | "addon";
export interface NavItem {
  href: string;
  labelKey: NavigationLabelKey | null;
  label?: NavigationLabel;
  icon: LucideIcon;
  requiredPermission: Permission | null;
  capabilityKey?: string;
  children?: NavItem[];
  surface?: SurfaceTier;
  navigationOnly?: boolean;
}

const clinicalChildren: NavItem[] = [
  { href: "/patients", labelKey: "patients", icon: Users, requiredPermission: "patients:read" },
  { href: "/treatment-plans", labelKey: "treatmentPlans", icon: ClipboardList, requiredPermission: "treatment_plans:read" },
  { href: "/clinical", labelKey: "clinical", icon: Stethoscope, requiredPermission: "workspace:clinical" },
];

const operationalChildren: NavItem[] = [
  { href: "/agenda", labelKey: "agenda", icon: CalendarDays, requiredPermission: "agenda:read" },
  { href: "/workforce", label: { ar: "القوى العاملة والعمليات", en: "Workforce & Operations" }, labelKey: null, icon: BriefcaseBusiness, requiredPermission: "workforce:read", capabilityKey: "workforce.access" },
  { href: "/communications", label: { ar: "الاتصالات", en: "Communications" }, labelKey: null, icon: MessageCircle, requiredPermission: "communications:read", capabilityKey: "communications.access" },
  { href: "/work-center", label: { ar: "مركز العمل", en: "Work Center" }, labelKey: null, icon: ListChecks, requiredPermission: "work:read", capabilityKey: "coordination.work_center" },
  { href: "/operation", labelKey: "operation", icon: BriefcaseBusiness, requiredPermission: "workspace:operation" },
];

const administrationChildren: NavItem[] = [
  { href: "/financial-resources", label: { ar: "المالية والموارد", en: "Financial & Resources" }, labelKey: null, icon: WalletCards, requiredPermission: null, capabilityKey: "financial_resources.access", navigationOnly: true, children: [
    { href: "/financial-resources/overview", label: { ar: "نظرة عامة", en: "Overview" }, labelKey: null, icon: LayoutDashboard, requiredPermission: null, capabilityKey: "financial_resources.overview" },
    { href: "/invoices", label: { ar: "الفواتير", en: "Invoices" }, labelKey: null, icon: FileText, requiredPermission: "invoices:read", capabilityKey: "financial_resources.invoices" },
    { href: "/financial-resources/payments", label: { ar: "المدفوعات", en: "Payments" }, labelKey: null, icon: CreditCard, requiredPermission: "invoices:read", capabilityKey: "financial_resources.payments" },
    { href: "/financial-resources/insurance", label: { ar: "التأمين", en: "Insurance" }, labelKey: null, icon: ShieldCheck, requiredPermission: "insurance:read", capabilityKey: "financial_resources.insurance" },
    { href: "/inventory", label: { ar: "المخزون", en: "Inventory" }, labelKey: null, icon: Boxes, requiredPermission: "inventory:read", capabilityKey: "financial_resources.inventory" },
    { href: "/financial-resources/purchasing", label: { ar: "المشتريات", en: "Purchasing" }, labelKey: null, icon: ShoppingCart, requiredPermission: "purchasing:read", capabilityKey: "financial_resources.purchasing" },
  ] },
  { href: "/follow-up", labelKey: "followUp", icon: PhoneCall, requiredPermission: "followup:read" },
  { href: "/reports", labelKey: "reports", icon: FileBarChart, requiredPermission: "reports:read" },
  { href: "/analytics", labelKey: "analytics", icon: BarChart3, requiredPermission: "analytics:read" },
  { href: "/settings", labelKey: "settings", icon: Settings, requiredPermission: "settings:read" },
];

/**
 * Patient Flow is deliberately absent from this registry. It is an internal
 * workflow, not an ordinary user-facing Module/Domain in the Sidebar.
 */
export const navigationRegistry: NavItem[] = [
  { href: "/clinical", label: { ar: "Clinical", en: "Clinical" }, labelKey: null, icon: Stethoscope, requiredPermission: null, navigationOnly: true, children: clinicalChildren },
  { href: "/operation", label: { ar: "Operational", en: "Operational" }, labelKey: null, icon: BriefcaseBusiness, requiredPermission: null, navigationOnly: true, children: operationalChildren },
  { href: "/administration", label: { ar: "Administration", en: "Administration" }, labelKey: null, icon: LayoutDashboard, requiredPermission: null, navigationOnly: true, children: administrationChildren },
];

function flattenNavigation(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => [item, ...(item.children ? flattenNavigation(item.children) : [])]);
}

export function getRequiredPermission(pathname: string): Permission | null | undefined {
  const normalized = pathname.split("?")[0];
  const exact = flattenNavigation(navigationRegistry).find((item) => item.href.split("?")[0] === normalized);
  if (exact) return exact.requiredPermission;
  const parent = navigationRegistry.find((item) => item.href !== "/" && normalized.startsWith(`${item.href}/`));
  return parent?.requiredPermission;
}

export function getSidebarNavigation(): NavItem[] {
  return navigationRegistry;
}
