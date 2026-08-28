"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BriefcaseBusiness, Stethoscope } from "lucide-react";
import { useI18n } from "@/core/i18n/I18nProvider";
import { usePermissions } from "@/core/permissions/usePermissions";
import { getAvailableWorkspaceSurfaces, type WorkspaceSurfaceKey } from "@/core/workspace/workspaceSurfaces";
import { cn } from "@/shared/utils/cn";

const ICONS: Record<WorkspaceSurfaceKey, typeof Home> = {
  global: Home,
  administration: BriefcaseBusiness,
  operation: BriefcaseBusiness,
  clinical: Stethoscope,
};

export function WorkspaceSurfaceNav() {
  const pathname = usePathname();
  const { locale } = useI18n();
  const { hasPermission, isLoading } = usePermissions();
  const surfaces = getAvailableWorkspaceSurfaces(hasPermission);

  if (isLoading || surfaces.length <= 1) return null;

  return (
    <nav aria-label={locale === "ar" ? "مساحات العمل" : "Workspaces"} className="flex min-w-0 max-w-full items-center gap-1 overflow-x-auto rounded-lg border bg-gray-50 p-1">
      {surfaces.map((surface) => {
        if (!surface.href) return null;
        const Icon = ICONS[surface.key];
        const active = surface.href === "/" ? pathname === "/" : pathname === surface.href || pathname.startsWith(`${surface.href}/`);
        return (
          <Link
            key={surface.key}
            href={surface.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              active ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:bg-white hover:text-gray-900",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{surface.label[locale]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
