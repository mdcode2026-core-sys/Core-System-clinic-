"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/core/i18n/I18nProvider";
import { useWorkspace } from "@/core/workspace/hooks/useWorkspace";
import { getAvailableWorkspaceSurfaces, type WorkspaceSurfaceKey } from "@/core/workspace/workspaceSurfaces";
import { WidgetContainer } from "./WidgetContainer";
import type { WorkspaceContext, ResolvedWidget } from "@/core/workspace/workspace.types";
import { GripVertical, Plus, RotateCcw, Settings2, X } from "lucide-react";

interface WorkspaceRendererProps {
  context?: WorkspaceContext;
  workspaceKey?: WorkspaceSurfaceKey;
}

export function WorkspaceRenderer({ context, workspaceKey = "global" }: WorkspaceRendererProps) {
  const {
    visibleWidgets,
    availableWidgets,
    isLoading,
    hasErrors,
    updateWidgetState,
    addWidget,
    removeWidget,
    reorderWidgets,
    resetLayout,
  } = useWorkspace(workspaceKey);
  const { locale, workspace } = useI18n();
  const [customizing, setCustomizing] = useState(false);
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const surface = getAvailableWorkspaceSurfaces(() => true).find((item) => item.key === workspaceKey);
  const direction = locale === "ar" ? "rtl" : "ltr";

  const selectedKeys = useMemo(() => new Set(visibleWidgets.map((w) => w.definition.key)), [visibleWidgets]);
  const layer2 = visibleWidgets.filter((w) => w.definition.layer === 2);
  const layer3 = visibleWidgets.filter((w) => w.definition.layer === 3);

  const moveWithinLayer = (items: ResolvedWidget[], key: string, delta: -1 | 1) => {
    const index = items.findIndex((item) => item.definition.key === key);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= items.length) return;
    const keys = items.map((item) => item.definition.key);
    [keys[index], keys[target]] = [keys[target], keys[index]];
    reorderWidgets(keys);
  };

  const handleDrop = (targetKey: string, layerItems: ResolvedWidget[]) => {
    if (!draggedKey || draggedKey === targetKey) return;
    const from = layerItems.findIndex((item) => item.definition.key === draggedKey);
    const to = layerItems.findIndex((item) => item.definition.key === targetKey);
    if (from < 0 || to < 0) return;
    const keys = layerItems.map((item) => item.definition.key);
    const [moved] = keys.splice(from, 1);
    keys.splice(to, 0, moved);
    reorderWidgets(keys);
    setDraggedKey(null);
  };

  const renderWidget = (resolved: ResolvedWidget, layerItems: ResolvedWidget[]) => (
    <div
      key={resolved.definition.key}
      draggable
      onDragStart={() => setDraggedKey(resolved.definition.key)}
      onDragEnd={() => setDraggedKey(null)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => handleDrop(resolved.definition.key, layerItems)}
      className="min-w-0"
      title={workspace.dragToReorder}
    >
      <div className="mb-1 flex items-center justify-between px-1 text-gray-400">
        <GripVertical className="hidden h-4 w-4 cursor-grab sm:block" aria-hidden="true" />
        <div className="flex items-center gap-1 text-[11px] sm:hidden">
          <button type="button" className="rounded border px-2 py-1 hover:bg-gray-50" onClick={() => moveWithinLayer(layerItems, resolved.definition.key, -1)} aria-label={workspace.moveUp}>↑</button>
          <button type="button" className="rounded border px-2 py-1 hover:bg-gray-50" onClick={() => moveWithinLayer(layerItems, resolved.definition.key, 1)} aria-label={workspace.moveDown}>↓</button>
        </div>
      </div>
      <WidgetContainer resolved={resolved} context={context} workspaceKey={workspaceKey} onStateChange={updateWidgetState} />
    </div>
  );

  if (isLoading) {
    return <div className="flex min-h-[320px] items-center justify-center" dir={direction} aria-busy="true"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6" dir={direction}>
      <header className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">{workspace.workingSurface}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{surface?.label[locale] ?? (locale === "ar" ? "مساحة العمل" : "Workspace")}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">{surface?.description[locale] ?? (locale === "ar" ? "مساحة العمل المخصصة لك." : "Your working surface.")}</p>
          </div>
          <button type="button" onClick={() => setCustomizing((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50" aria-expanded={customizing}>
            {customizing ? <X className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
            {customizing ? workspace.closeCustomizer : workspace.customize}
          </button>
        </div>
      </header>

      {customizing && (
        <section className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5" aria-label={workspace.widgetLibrary}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">{workspace.widgetLibrary}</h2>
              <p className="mt-1 text-sm text-gray-500">{workspace.customizationHint}</p>
            </div>
            <button type="button" onClick={resetLayout} className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"><RotateCcw className="h-4 w-4" />{workspace.restoreDefaults}</button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {availableWidgets.map((widget) => {
              const selected = selectedKeys.has(widget.key);
              return <div key={widget.key} className="flex items-center justify-between rounded-lg border p-3"><span className="min-w-0 truncate text-sm font-medium text-gray-800">{locale === "ar" ? widget.labelAr : widget.label}</span>{selected ? <button type="button" onClick={() => removeWidget(widget.key)} className="shrink-0 rounded-md border px-2 py-1 text-xs hover:bg-gray-50">{workspace.removeWidget}</button> : <button type="button" onClick={() => addWidget(widget.key)} className="inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-50"><Plus className="h-3 w-3" />{workspace.addWidget}</button>}</div>;
            })}
            {availableWidgets.length === 0 && <p className="text-sm text-gray-500">{workspace.noAvailableWidgets}</p>}
          </div>
        </section>
      )}

      {layer2.length > 0 && <section aria-labelledby="workspace-actions-heading"><h2 id="workspace-actions-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{workspace.layerQuickActions}</h2><div className="grid grid-cols-1 gap-4 md:grid-cols-2">{layer2.map((resolved) => renderWidget(resolved, layer2))}</div></section>}
      {layer3.length > 0 && <section aria-labelledby="workspace-status-heading"><h2 id="workspace-status-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{workspace.layerStatusAnalytics}</h2><div className="grid grid-cols-1 gap-4 xl:grid-cols-3">{layer3.map((resolved) => renderWidget(resolved, layer3))}</div></section>}

      {visibleWidgets.length === 0 && !hasErrors && <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 text-center"><p className="text-lg font-medium text-gray-700">{workspace.noWidgets}</p><p className="mt-1 max-w-md text-sm text-gray-500">{workspace.contactAdmin}</p></div>}
    </div>
  );
}

export default WorkspaceRenderer;
