"use client";

import { useI18n } from "@/core/i18n/I18nProvider";
import { useWorkspace } from "@/core/workspace/hooks/useWorkspace";
import { WidgetContainer } from "./WidgetContainer";
import type { WorkspaceContext } from "@/core/workspace/workspace.types";

export function WorkspaceRenderer({ context }: { context?: WorkspaceContext }) {
  const { visibleWidgets, isLoading, hasErrors } = useWorkspace();
  const { workspace } = useI18n();
  if (isLoading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;
  const layer2 = visibleWidgets.filter((w) => w.definition.layer === 2);
  const layer3 = visibleWidgets.filter((w) => w.definition.layer === 3);
  return (
    <div className="space-y-6">
      {layer2.length > 0 && <section><h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{workspace.layerQuickActions}</h2><div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">{layer2.map((resolved) => <WidgetContainer key={resolved.definition.key} resolved={resolved} context={context} />)}</div></section>}
      {layer3.length > 0 && <section><h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{workspace.layerStatusAnalytics}</h2><div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{layer3.map((resolved) => <WidgetContainer key={resolved.definition.key} resolved={resolved} context={context} />)}</div></section>}
      {visibleWidgets.length === 0 && !hasErrors && <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white text-gray-400"><p className="text-lg font-medium">{workspace.noWidgets}</p><p className="text-sm">{workspace.contactAdmin}</p></div>}
    </div>
  );
}

export default WorkspaceRenderer;
