// src/core/navigation/navigationRegistry.ts
// Package 3.0.2 — Navigation Registry: single source of truth for all dashboard routes
// and their required permissions. Additive only; does not replace permissionMatrix.ts.

import type { Permission } from "@/core/permissions/types";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ListOrdered,
  FileText,
  Package,
  FileBarChart,
  BarChart3,
  PhoneCall,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  labelAr: string;
  icon: LucideIcon;
  requiredPermission: Permission | null; // null = always visible to any authenticated user
}

/**
 * Canonical navigation registry for the Unified Workspace.
 * Order determines display order in both desktop sidebar and mobile Sheet drawer.
 *
 * New modules (Inventory, Reports, Follow-up) are registered here now
 * but will remain hidden for roles lacking their permissions until
 * their Phase 3.1 packages ship.
 */
export const navigationRegistry: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    labelAr: "لوحة التحكم",
    icon: LayoutDashboard,
    requiredPermission: null, // always visible
  },
  {
    href: "/patients",
    label: "Patients",
    labelAr: "المرضى",
    icon: Users,
    requiredPermission: "patients:read",
  },
  {
    href: "/agenda",
    label: "Agenda",
    labelAr: "الأجندة",
    icon: CalendarDays,
    requiredPermission: "agenda:read",
  },
  {
    href: "/queue",
    label: "Queue",
    labelAr: "الطابور",
    icon: ListOrdered,
    requiredPermission: "sessions:read",
  },
  {
    href: "/invoices",
    label: "Invoices",
    labelAr: "الفواتير",
    icon: FileText,
    requiredPermission: "invoices:read",
  },
  {
    href: "/inventory",
    label: "Inventory",
    labelAr: "المخزون",
    icon: Package,
    requiredPermission: "inventory:read",
  },
  {
    href: "/reports",
    label: "Reports",
    labelAr: "التقارير",
    icon: FileBarChart,
    requiredPermission: "reports:read",
  },
  {
    href: "/analytics",
    label: "Analytics",
    labelAr: "التحليلات",
    icon: BarChart3,
    requiredPermission: "analytics:read",
  },
  {
    href: "/follow-up",
    label: "Follow-up",
    labelAr: "المتابعة",
    icon: PhoneCall,
    requiredPermission: "followup:read",
  },
  {
    href: "/settings",
    label: "Settings",
    labelAr: "الإعدادات",
    icon: Settings,
    requiredPermission: "settings:read",
  },
];

/**
 * Helper: resolve the required permission for a given pathname.
 * Returns undefined if the route is not registered (should not happen for valid routes).
 */
export function getRequiredPermission(pathname: string): Permission | null | undefined {
  // Exact match first
  const exact = navigationRegistry.find((n) => n.href === pathname);
  if (exact) return exact.requiredPermission;

  // Sub-route fallback: e.g. /invoices/123 → /invoices
  const parent = navigationRegistry.find(
    (n) => n.href !== "/" && pathname.startsWith(n.href + "/")
  );
  if (parent) return parent.requiredPermission;

  return undefined;
}
