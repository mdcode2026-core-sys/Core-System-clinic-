// src/core/navigation/navigationRegistry.ts
// Navigation Registry: single source of truth for dashboard routes, permissions, and terminology keys.

import type { Permission } from "@/core/permissions/types";
import { messages } from "@/core/i18n/messages";
import {
  LayoutDashboard, Users, CalendarDays, ListOrdered, FileText, Package,
  FileBarChart, BarChart3, PhoneCall, Settings, BriefcaseBusiness,
  Stethoscope, ClipboardList,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavigationLabelKey = keyof typeof messages.en.nav;
export type NavigationLabel = { ar: string; en: string };

export interface NavItem {
  href: string;
  labelKey: NavigationLabelKey | null;
  label?: NavigationLabel;
  icon: LucideIcon;
  requiredPermission: Permission | null;
}

export const navigationRegistry: NavItem[] = [
  { href: "/", labelKey: "dashboard", icon: LayoutDashboard, requiredPermission: null },
  { href: "/operation", labelKey: "operation", icon: BriefcaseBusiness, requiredPermission: "workspace:operation" },
  { href: "/clinical", labelKey: "clinical", icon: Stethoscope, requiredPermission: "workspace:clinical" },
  { href: "/treatment-plans", labelKey: "treatmentPlans", icon: ClipboardList, requiredPermission: "treatment_plans:read" },
  { href: "/patients", labelKey: "patients", icon: Users, requiredPermission: "patients:read" },
  { href: "/agenda", labelKey: "agenda", icon: CalendarDays, requiredPermission: "agenda:read" },
  { href: "/queue", labelKey: "queue", icon: ListOrdered, requiredPermission: "sessions:read" },
  { href: "/invoices", labelKey: null, label: { ar: "الفواتير والمالية", en: "Billing & Financial" }, icon: FileText, requiredPermission: "invoices:read" },
  { href: "/inventory", labelKey: null, label: { ar: "المخزون والمشتريات", en: "Inventory & Purchasing" }, icon: Package, requiredPermission: "inventory:read" },
  { href: "/reports", labelKey: "reports", icon: FileBarChart, requiredPermission: "reports:read" },
  { href: "/analytics", labelKey: "analytics", icon: BarChart3, requiredPermission: "analytics:read" },
  { href: "/follow-up", labelKey: "followUp", icon: PhoneCall, requiredPermission: "followup:read" },
  { href: "/settings", labelKey: "settings", icon: Settings, requiredPermission: "settings:read" },
];

export function getRequiredPermission(pathname: string): Permission | null | undefined {
  const exact = navigationRegistry.find((n) => n.href === pathname);
  if (exact) return exact.requiredPermission;
  const parent = navigationRegistry.find((n) => n.href !== "/" && pathname.startsWith(n.href + "/"));
  if (parent) return parent.requiredPermission;
  return undefined;
}
