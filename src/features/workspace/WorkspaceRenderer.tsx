"use client";

import { useI18n } from "@/core/i18n/I18nProvider";
import { useWorkspace } from "@/core/workspace/hooks/useWorkspace";
import { getAvailableWorkspaceSurfaces, type WorkspaceSurfaceKey } from "@/core/workspace/workspaceSurfaces";
import { WidgetContainer } from "./WidgetContainer";
import type { WorkspaceContext } from "@/core/workspace/workspace.types";

interface WorkspaceRendererProps {
  context?: WorkspaceContext;
  workspaceKey?: WorkspaceSurfaceKey;
}

/**
 * Canonical renderer for the reusable Workspace surface.
 * It provides the working-surface chrome and delegates business work to the
 * existing permission-aware Widget registry. It is deliberately not a new
 * authorization or Domain engine.
 */
export function WorkspaceRenderer({ context, workspaceKey = "global" }: WorkspaceRendererProps) {
  const { visibleWidgets, isLoading, hasErrors } = useWorkspace(workspaceKey);
  const { locale, workspace } = useI18n();
  const surface = getAvailableWorkspaceSurfaces(() => true).find((item) => item.key === workspaceKey);
  const direction = locale === "ar" ? "rtl" : "ltr";

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center" dir={direction} aria-busy="true">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  const layer2 = visibleWidgets.filter((w) => w.definition.layer === 2);
  const layer3 = visibleWidgets.filter((w) => w.definition.layer === 3);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6" dir={direction}>
      <header className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">{workspace.workingSurface}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {surface?.label[locale] ?? (locale === "ar" ? "مساحة العمل" : "Workspace")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              {surface?.description[locale] ?? (locale === "ar" ? "مساحة العمل المخصصة لك." : "Your working surface.")}
            </p>
          </div>
          <span className="w-fit rounded-full border bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
            {locale === "ar" ? "مساحة عمل" : "Working surface"}
          </span>
        </div>
      </header>

      {layer2.length > 0 && (
        <section aria-labelledby="workspace-actions-heading">
          <h2 id="workspace-actions-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {workspace.layerQuickActions}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {layer2.map((resolved) => (
              <WidgetContainer key={resolved.definition.key} resolved={resolved} context={context} workspaceKey={workspaceKey} />
            ))}
          </div>
        </section>
      )}

      {layer3.length > 0 && (
        <section aria-labelledby="workspace-status-heading">
          <h2 id="workspace-status-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {workspace.layerStatusAnalytics}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {layer3.map((resolved) => (
              <WidgetContainer key={resolved.definition.key} resolved={resolved} context={context} workspaceKey={workspaceKey} />
            ))}
          </div>
        </section>
      )}

      {visibleWidgets.length === 0 && !hasErrors && (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 text-center">
          <p className="text-lg font-medium text-gray-700">{workspace.noWidgets}</p>
          <p className="mt-1 max-w-md text-sm text-gray-500">{workspace.contactAdmin}</p>
        </div>
      )}
    </div>
  );
}

export default WorkspaceRenderer;
