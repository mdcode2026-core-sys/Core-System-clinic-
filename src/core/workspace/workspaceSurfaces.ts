import type { Permission } from "@/core/permissions/types";

/**
 * The three business Workspaces are user-level working environments.
 * Workspace assignment is stored per clinic user in clinic_user_workspaces.
 * Permissions remain independent and control capabilities inside the assigned Workspace.
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
  { key: "global", label: { ar: "الرئيسية", en: "Home" }, description: { ar: "واجهة دخول عامة وليست مساحة عمل تشغيلية", en: "Global entry surface, not a business Workspace" }, href: "/", requiredPermission: null, implemented: true },
  { key: "operation", label: { ar: "مساحة التشغيل", en: "Operations" }, description: { ar: "العمل التشغيلي والتنسيق اليومي", en: "Daily operational work and coordination" }, href: "/operation", requiredPermission: null, implemented: true },
  { key: "clinical", label: { ar: "المساحة الطبية", en: "Clinical" }, description: { ar: "العمل الطبي والسريري", en: "Clinical and medical work" }, href: "/clinical", requiredPermission: null, implemented: true },
  { key: "administration", label: { ar: "مساحة الإدارة", en: "Administration" }, description: { ar: "إدارة العيادة والإعدادات", en: "Clinic administration and configuration" }, href: "/administration", requiredPermission: null, implemented: true },
] as const;

export function getAvailableWorkspaceSurfaces(_hasPermission?: (permission: Permission) => boolean) {
  return WORKSPACE_SURFACES.filter((surface) => surface.implemented && surface.key !== "global");
}

export function canUseWorkspaceSurface(key: WorkspaceSurfaceKey, _hasPermission?: (permission: Permission) => boolean) {
  const surface = WORKSPACE_SURFACES.find((item) => item.key === key);
  return !!surface && surface.implemented && surface.key !== "global";
}
