import type { Permission } from "@/core/permissions/types";

/**
 * User-facing workspace contexts. Global/Home is the always-available system
 * entry surface; implemented business workspace availability is permission-derived.
 *
 * Workspace is presentation only. These permissions determine which working
 * surface can be offered; they never replace server-side authorization.
 */
export type WorkspaceSurfaceKey = "global" | "administration" | "operation" | "clinical";

export interface WorkspaceSurfaceDefinition {
  key: WorkspaceSurfaceKey;
  label: { ar: string; en: string };
  description: { ar: string; en: string };
  href: string | null;
  requiredPermission: Permission | null;
  implemented: boolean;
}

export const WORKSPACE_SURFACES: readonly WorkspaceSurfaceDefinition[] = [
  {
    key: "global",
    label: { ar: "الرئيسية", en: "Home" },
    description: { ar: "الوصول العام والعمل المخصص", en: "Global entry and personalized work" },
    href: "/",
    requiredPermission: null,
    implemented: true,
  },
  {
    key: "operation",
    label: { ar: "مساحة التشغيل", en: "Operations" },
    description: { ar: "العمل التشغيلي والتنسيق اليومي", en: "Daily operational work and coordination" },
    href: "/operation",
    requiredPermission: "workspace:operation",
    implemented: true,
  },
  {
    key: "clinical",
    label: { ar: "المساحة الطبية", en: "Clinical" },
    description: { ar: "العمل الطبي والسريري", en: "Clinical and medical work" },
    href: "/clinical",
    requiredPermission: "workspace:clinical",
    implemented: true,
  },
  {
    key: "administration",
    label: { ar: "مساحة الإدارة", en: "Administration" },
    description: { ar: "إدارة العيادة والإعدادات", en: "Clinic administration and configuration" },
    // Declared by the approved model, but there is currently no canonical
    // Administration Workspace route. Stage 2 must not manufacture one.
    href: null,
    requiredPermission: "workspace:administration",
    implemented: false,
  },
] as const;

export function getAvailableWorkspaceSurfaces(hasPermission: (permission: Permission) => boolean) {
  return WORKSPACE_SURFACES.filter(
    (surface) => surface.implemented &&
      (surface.requiredPermission === null || hasPermission(surface.requiredPermission)),
  );
}

export function canUseWorkspaceSurface(
  key: WorkspaceSurfaceKey,
  hasPermission: (permission: Permission) => boolean,
) {
  const surface = WORKSPACE_SURFACES.find((item) => item.key === key);
  return !!surface && surface.implemented &&
    (surface.requiredPermission === null || hasPermission(surface.requiredPermission));
}
