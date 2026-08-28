import type { Permission } from "@/core/permissions/types";

/**
 * User-facing workspace contexts. Global/Home is the always-available system
 * entry surface; business workspace availability is permission-derived.
 *
 * Workspace is presentation only. These permissions are used to determine
 * which working surface can be offered, never to replace server-side
 * authorization for any action or data.
 */
export type WorkspaceSurfaceKey = "global" | "administration" | "operation" | "clinical";

export interface WorkspaceSurfaceDefinition {
  key: WorkspaceSurfaceKey;
  label: { ar: string; en: string };
  description: { ar: string; en: string };
  href: string;
  requiredPermission: Permission | null;
}

export const WORKSPACE_SURFACES: readonly WorkspaceSurfaceDefinition[] = [
  {
    key: "global",
    label: { ar: "الرئيسية", en: "Home" },
    description: { ar: "الوصول العام والعمل المخصص", en: "Global entry and personalized work" },
    href: "/",
    requiredPermission: null,
  },
  {
    key: "operation",
    label: { ar: "مساحة التشغيل", en: "Operations" },
    description: { ar: "العمل التشغيلي والتنسيق اليومي", en: "Daily operational work and coordination" },
    href: "/operation",
    requiredPermission: "workspace:operation",
  },
  {
    key: "clinical",
    label: { ar: "المساحة الطبية", en: "Clinical" },
    description: { ar: "العمل الطبي والسريري", en: "Clinical and medical work" },
    href: "/clinical",
    requiredPermission: "workspace:clinical",
  },
  {
    key: "administration",
    label: { ar: "مساحة الإدارة", en: "Administration" },
    description: { ar: "إدارة العيادة والإعدادات", en: "Clinic administration and configuration" },
    // Administration Workspace is a declared surface in the approved model.
    // The current repository has no canonical /administration working route;
    // do not create a fake route in Stage 2. It will be surfaced when the
    // Workspace Foundation stage establishes its authoritative implementation.
    href: "/settings",
    requiredPermission: "workspace:administration",
  },
] as const;

export function getAvailableWorkspaceSurfaces(hasPermission: (permission: Permission) => boolean) {
  return WORKSPACE_SURFACES.filter(
    (surface) => surface.requiredPermission === null || hasPermission(surface.requiredPermission),
  );
}

export function canUseWorkspaceSurface(
  key: WorkspaceSurfaceKey,
  hasPermission: (permission: Permission) => boolean,
) {
  const surface = WORKSPACE_SURFACES.find((item) => item.key === key);
  return !!surface && (surface.requiredPermission === null || hasPermission(surface.requiredPermission));
}
