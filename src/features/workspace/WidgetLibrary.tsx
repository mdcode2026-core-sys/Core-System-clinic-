"use client";

import type { WidgetDefinition } from "@/core/workspace/workspace.types";
import { Check, Plus, X } from "lucide-react";
import { useI18n } from "@/core/i18n/I18nProvider";
import { cn } from "@/shared/utils/cn";

interface WidgetLibraryProps {
  widgets: WidgetDefinition[];
  activeKeys: Set<string>;
  onAdd: (key: string) => void;
  onClose: () => void;
}

export function WidgetLibrary({ widgets, activeKeys, onAdd, onClose }: WidgetLibraryProps) {
  const { locale, workspace } = useI18n();
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="workspace-widget-library-title"
    >
      <div className="max-h-[90vh] w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl" dir={direction}>
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 id="workspace-widget-library-title" className="text-lg font-semibold text-gray-900">
              {workspace.widgetLibraryTitle}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{workspace.widgetLibraryDescription}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label={workspace.close}
            title={workspace.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-4">
          {widgets.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-500">
              {workspace.noAvailableWidgets}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {widgets.map((widget) => {
                const active = activeKeys.has(widget.key);
                const label = locale === "ar" ? widget.labelAr : widget.label;
                return (
                  <div
                    key={widget.key}
                    className={cn("flex items-center justify-between gap-3 rounded-xl border p-4", active && "bg-gray-50")}
                  >
                    <p className="min-w-0 font-medium text-gray-900">{label}</p>
                    <button
                      type="button"
                      onClick={() => onAdd(widget.key)}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold",
                        active ? "bg-gray-100 text-gray-500" : "bg-gray-900 text-white hover:bg-gray-800",
                      )}
                      aria-label={active ? workspace.added : `${workspace.add} ${label}`}
                      disabled={active}
                    >
                      {active ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      {active ? workspace.added : workspace.add}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WidgetLibrary;
