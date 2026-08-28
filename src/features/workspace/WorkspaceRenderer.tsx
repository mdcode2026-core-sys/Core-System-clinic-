"use client";

import { useCallback, useMemo, useState, type DragEvent } from "react";
import { RotateCcw, Settings2 } from "lucide-react";
import { useI18n } from "@/core/i18n/I18nProvider";
import { useWorkspace } from "@/core/workspace/hooks/useWorkspace";
import { getAvailableWorkspaceSurfaces, type WorkspaceSurfaceKey } from "@/core/workspace/workspaceSurfaces";
import { WidgetContainer } from "./WidgetContainer";
import { WidgetLibrary } from "./WidgetLibrary";
import type { WorkspaceContext } from "@/core/workspace/workspace.types";

interface WorkspaceRendererProps {
  context?: WorkspaceContext;
  workspaceKey?: WorkspaceSurfaceKey;
}

/**
 * Canonical renderer for the reusable Workspace surface.
 * Stage 4 adds presentation personalization without introducing another
 * Workspace engine or authorization layer.
 */
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
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const [dropTargetKey, setDropTargetKey] = useState<string | null>(null);
  const surface = getAvailableWorkspaceSurfaces(() => true).find((item) => item.key === workspaceKey);
  const direction = locale === "ar" ? "rtl" : "ltr";

  const activeKeys = useMemo(() => new Set(visibleWidgets.map((widget) => widget.definition.key)), [visibleWidgets]);
  const layer2 = visibleWidgets.filter((w) => w.definition.layer === 2);
  const layer3 = visibleWidgets.filter((w) => w.definition.layer === 3);

  const moveWithinLayer = useCallback(
    (key: string, directionStep: -1 | 1) => {
      const widget = visibleWidgets.find((item) => item.definition.key === key);
      if (!widget) return;
      const layer = visibleWidgets.filter((item) => item.definition.layer === widget.definition.layer);
      const index = layer.findIndex((item) => item.definition.key === key);
      const targetIndex = index + directionStep;
      if (index < 0 || targetIndex < 0 || targetIndex >= layer.length) return;
      const orderedKeys = layer.map((item) => item.definition.key);
      [orderedKeys[index], orderedKeys[targetIndex]] = [orderedKeys[targetIndex], orderedKeys[index]];
      reorderWidgets(orderedKeys);
    },
    [reorderWidgets, visibleWidgets],
  );

  const handleDragStart = useCallback((key: string, event: DragEvent<HTMLButtonElement>) => {
    setDraggedKey(key);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", key);
  }, []);

  const handleDrop = useCallback(
    (targetKey: string, event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const sourceKey = event.dataTransfer.getData("text/plain") || draggedKey;
      setDropTargetKey(null);
      setDraggedKey(null);
      if (!sourceKey || sourceKey === targetKey) return;

      const source = visibleWidgets.find((item) => item.definition.key === sourceKey);
      const target = visibleWidgets.find((item) => item.definition.key === targetKey);
      if (!source || !target || source.definition.layer !== target.definition.layer) return;

      const orderedKeys = visibleWidgets
        .filter((item) => item.definition.layer === source.definition.layer)
        .map((item) => item.definition.key);
      const sourceIndex = orderedKeys.indexOf(sourceKey);
      const targetIndex = orderedKeys.indexOf(targetKey);
      if (sourceIndex < 0 || targetIndex < 0) return;
      orderedKeys.splice(sourceIndex, 1);
      orderedKeys.splice(targetIndex, 0, sourceKey);
      reorderWidgets(orderedKeys);
    },
    [draggedKey, reorderWidgets, visibleWidgets],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center" dir={direction} aria-busy="true">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  const renderWidget = (resolvedWidget: typeof visibleWidgets[number], siblings: typeof visibleWidgets) => {
    const index = siblings.findIndex((item) => item.definition.key === resolvedWidget.definition.key);
    return (
      <WidgetContainer
        key={resolvedWidget.definition.key}
        resolved={resolvedWidget}
        context={context}
        workspaceKey={workspaceKey}
        canMoveUp={index > 0}
        canMoveDown={index >= 0 && index < siblings.length - 1}
        onStateChange={(state) => {
          if (state === "hidden") removeWidget(resolvedWidget.definition.key);
          else updateWidgetState(resolvedWidget.definition.key, state);
        }}
        onMoveUp={() => moveWithinLayer(resolvedWidget.definition.key, -1)}
        onMoveDown={() => moveWithinLayer(resolvedWidget.definition.key, 1)}
        onDragStart={(event) => handleDragStart(resolvedWidget.definition.key, event)}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          if (draggedKey && draggedKey !== resolvedWidget.definition.key) setDropTargetKey(resolvedWidget.definition.key);
        }}
        onDrop={(event) => handleDrop(resolvedWidget.definition.key, event)}
        isDropTarget={dropTargetKey === resolvedWidget.definition.key}
      />
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6" dir={direction}>
      <header className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">{workspace.workingSurface}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {surface?.label[locale] ?? (locale === "ar" ? "مساحة العمل" : "Workspace")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              {surface?.description[locale] ?? (locale === "ar" ? "مساحة العمل المخصصة لك." : "Your working surface.")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCustomizing((open) => !open)}
            className="inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            aria-expanded={customizing}
          >
            <Settings2 className="h-4 w-4" />
            {customizing ? workspace.closeCustomizer : workspace.customize}
          </button>
        </div>

        {customizing && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600">{workspace.customizeDescription}</p>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => setLibraryOpen(true)} className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50">
                {workspace.addWidgets}
              </button>
              <button type="button" onClick={resetLayout} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50">
                <RotateCcw className="h-4 w-4" />
                {workspace.resetWorkspace}
              </button>
            </div>
          </div>
        )}
      </header>

      {layer2.length > 0 && (
        <section aria-labelledby="workspace-actions-heading">
          <h2 id="workspace-actions-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{workspace.layerQuickActions}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {layer2.map((widget) => renderWidget(widget, layer2))}
          </div>
        </section>
      )}

      {layer3.length > 0 && (
        <section aria-labelledby="workspace-status-heading">
          <h2 id="workspace-status-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{workspace.layerStatusAnalytics}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {layer3.map((widget) => renderWidget(widget, layer3))}
          </div>
        </section>
      )}

      {visibleWidgets.length === 0 && !hasErrors && (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 text-center">
          <p className="text-lg font-medium text-gray-700">{workspace.noWidgets}</p>
          <p className="mt-1 max-w-md text-sm text-gray-500">{workspace.contactAdmin}</p>
        </div>
      )}

      {libraryOpen && (
        <WidgetLibrary
          widgets={availableWidgets}
          activeKeys={activeKeys}
          onAdd={addWidget}
          onClose={() => setLibraryOpen(false)}
        />
      )}
    </div>
  );
}

export default WorkspaceRenderer;
