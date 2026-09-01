import type { BusinessWorkspaceKey } from "./currentWorkspace";

export type WorkspaceSurfaceKey = BusinessWorkspaceKey;

export interface WorkspaceSurfaceDefinition {
  key: WorkspaceSurfaceKey;
  label: { ar: string; en: string };
  description: { ar: string; en: string };
  href: string;
  implemented: boolean;
}

export const WORKSPACE_SURFACES: readonly WorkspaceSurfaceDefinition[] = [
  { key: "operation", label: { ar: "مساحة التشغيل", en: "Operational" }, description: { ar: "العمل التشغيلي والتنسيق اليومي", en: "Daily operational work and coordination" }, href: "/operation", implemented: true },
  { key: "clinical", label: { ar: "المساحة الطبية", en: "Clinical" }, description: { ar: "العمل الطبي والسريري", en: "Clinical and medical work" }, href: "/clinical", implemented: true },
  { key: "administration", label: { ar: "مساحة الإدارة", en: "Administration" }, description: { ar: "إدارة العيادة والإدارة والموارد", en: "Clinic administration and management" }, href: "/administration", implemented: true },
] as const;

export function getAvailableWorkspaceSurfaces() { return WORKSPACE_SURFACES.filter((surface) => surface.implemented); }
export function canUseWorkspaceSurface(key: WorkspaceSurfaceKey) { return WORKSPACE_SURFACES.some((surface) => surface.implemented && surface.key === key); }
