"use client";

import Link from "next/link";
import { Home, BriefcaseBusiness, Stethoscope, ArrowUpRight } from "lucide-react";
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

export function WorkspaceSurfaceSwitcher() {
  const { locale } = useI18n();
  const { hasPermission, isLoading } = usePermissions();
  const ar = locale === "ar";
  const surfaces = getAvailableWorkspaceSurfaces(hasPermission);

  if (isLoading || surfaces.length <= 1) return null;

  return (
    <section aria-label={ar ? "مساحات العمل المتاحة" : "Available workspaces"} className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{ar ? "مساحات العمل" : "Workspaces"}</h2>
          <p className="text-sm text-gray-500">
            {ar ? "اختر بيئة العمل التي تناسب المهمة الحالية." : "Choose the working environment for the task at hand."}
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {surfaces.map((surface) => {
          if (!surface.href) return null;
          const Icon = ICONS[surface.key];
          return (
            <Link
              key={surface.key}
              href={surface.href}
              className={cn(
                "group flex min-w-0 items-center gap-3 rounded-lg border p-3 transition-colors",
                "hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-700">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-gray-900">{surface.label[locale]}</span>
                <span className="block truncate text-xs text-gray-500">{surface.description[locale]}</span>
              </span>
              <ArrowUpRight className={cn("h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:-translate-y-0.5", ar && "rotate-[-90deg]")} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
