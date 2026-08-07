"use client";

import { useWorkspace } from "@/core/workspace/hooks/useWorkspace";
import { WidgetContainer } from "./WidgetContainer";
import { LAYER_LABELS_AR } from "@/core/workspace/workspace.constants";

export function WorkspaceRenderer() {
  const { visibleWidgets, isLoading, hasErrors } = useWorkspace();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  const layer2 = visibleWidgets.filter((w) => w.definition.layer === 2);
  const layer3 = visibleWidgets.filter((w) => w.definition.layer === 3);

  return (
    <div className="space-y-6">
      {layer2.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {LAYER_LABELS_AR[2]}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
            {layer2.map((resolved) => (
              <WidgetContainer
                key={resolved.definition.key}
                resolved={resolved}
              />
            ))}
          </div>
        </section>
      )}

      {layer3.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {LAYER_LABELS_AR[3]}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {layer3.map((resolved) => (
              <WidgetContainer
                key={resolved.definition.key}
                resolved={resolved}
              />
            ))}
          </div>
        </section>
      )}

      {visibleWidgets.length === 0 && !hasErrors && (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white text-gray-400">
          <p className="text-lg font-medium">لا توجد أدوات متاحة</p>
          <p className="text-sm">اتصل بالمسؤول لتمكين الوحدات</p>
        </div>
      )}
    </div>
  );
}

export default WorkspaceRenderer;
