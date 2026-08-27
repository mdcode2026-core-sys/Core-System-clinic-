// src/core/navigation/navigationRegistry.ts
// Single source of truth for dashboard navigation, permissions, and product-surface hierarchy.

import type { Permission } from "@/core/permissions/types";
import { messages } from "@/core/i18n/messages";
import {
  LayoutDashboard, Users, CalendarDays, ListOrdered, FileText, FileBarChart, BarChart3,
  PhoneCall, Settings, BriefcaseBusiness, Stethoscope, ClipboardList, CreditCard,
  WalletCards, ShieldCheck, Boxes, Truck, ShoppingCart, ClipboardCheck,
} from "lucide-react";
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
}

const financialResourcesChildren: NavItem[] = [
  { href: "/financial-resources", label: { ar: "نظرة عامة", en: "Overview" }, labelKey: null, icon: LayoutDashboard, requiredPermission: null, capabilityKey: "financial_resources.overview", surface: "core" },
  { href: "/invoices", label: { ar: "الفواتير", en: "Invoices" }, labelKey: null, icon: FileText, requiredPermission: "invoices:read", capabilityKey: "financial_resources.invoices", surface: "core" },
  { href: "/payments", label: { ar: "المدفوعات", en: "Payments" }, labelKey: null, icon: CreditCard, requiredPermission: "invoices:read", capabilityKey: "financial_resources.payments", surface: "core" },
  { href: "/financial-plans", label: { ar: "الخطط المالية", en: "Financial Plans" }, labelKey: null, icon: WalletCards, requiredPermission: "invoices:read", capabilityKey: "financial_resources.financial_plans", surface: "core" },
  { href: "/installments", label: { ar: "الأقساط", en: "Installments" }, labelKey: null, icon: ClipboardList, requiredPermission: "invoices:read", capabilityKey: "financial_resources.installments", surface: "core" },
  {
    href: "/insurance",
    label: { ar: "التأمين", en: "Insurance" },
    labelKey: null,
    icon: ShieldCheck,
    requiredPermission: "insurance:read",
    capabilityKey: "financial_resources.insurance",
    surface: "core",
    children: [
      { href: "/insurance/claims", label: { ar: "المطالبات", en: "Claims" }, labelKey: null, icon: ClipboardCheck, requiredPermission: "insurance:read", capabilityKey: "financial_resources.insurance", surface: "core" },
    ],
  },
  { href: "/inventory", label: { ar: "المخزون", en: "Inventory" }, labelKey: null, icon: Boxes, requiredPermission: "inventory:read", capabilityKey: "financial_resources.inventory", surface: "core" },
  { href: "/consumption", label: { ar: "الاستهلاك", en: "Consumption" }, labelKey: null, icon: ClipboardCheck, requiredPermission: "inventory:read", capabilityKey: "financial_resources.consumption", surface: "core" },
  { href: "/suppliers", label: { ar: "الموردون", en: "Suppliers" }, labelKey: null, icon: Truck, requiredPermission: "purchasing:read", capabilityKey: "financial_resources.suppliers", surface: "core" },
  { href: "/purchasing", label: { ar: "المشتريات", en: "Purchasing" }, labelKey: null, icon: ShoppingCart, requiredPermission: "purchasing:read", capabilityKey: "financial_resources.purchasing", surface: "core" },
  { href: "/receiving", label: { ar: "الاستلام", en: "Receiving" }, labelKey: null, icon: ClipboardCheck, requiredPermission: "purchasing:read", capabilityKey: "financial_resources.receiving", surface: "core" },
];

export const navigationRegistry: NavItem[] = [
  { href: "/", labelKey: "dashboard", icon: LayoutDashboard, requiredPermission: null },
  { href: "/operation", labelKey: "operation", icon: BriefcaseBusiness, requiredPermission: "workspace:operation" },
  { href: "/clinical", labelKey: "clinical", icon: Stethoscope, requiredPermission: "workspace:clinical" },
  { href: "/treatment-plans", labelKey: "treatmentPlans", icon: ClipboardList, requiredPermission: "treatment_plans:read" },
  { href: "/patients", labelKey: "patients", icon: Users, requiredPermission: "patients:read" },
  { href: "/agenda", labelKey: "agenda", icon: CalendarDays, requiredPermission: "agenda:read" },
  { href: "/queue", labelKey: "queue", icon: ListOrdered, requiredPermission: "sessions:read" },
  { href: "/financial-resources", labelKey: null, label: { ar: "المالية والموارد", en: "Financial & Resources" }, icon: WalletCards, requiredPermission: null, capabilityKey: "financial_resources.access", children: financialResourcesChildren },
  { href: "/reports", labelKey: "reports", icon: FileBarChart, requiredPermission: "reports:read" },
  { href: "/analytics", labelKey: "analytics", icon: BarChart3, requiredPermission: "analytics:read" },
  { href: "/follow-up", labelKey: "followUp", icon: PhoneCall, requiredPermission: "followup:read" },
  { href: "/settings", labelKey: "settings", icon: Settings, requiredPermission: "settings:read" },
];

export function getRequiredPermission(pathname: string): Permission | null | undefined {
  const exact = navigationRegistry.flatMap((n) => n.children ?? [n]).find((n) => n.href === pathname);
  if (exact) return exact.requiredPermission;
  const parent = navigationRegistry.find((n) => n.href !== "/" && pathname.startsWith(n.href + "/"));
  if (parent) return parent.requiredPermission;
  return undefined;
}
