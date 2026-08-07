// src/features/workspace/WidgetToolbar.tsx
// Workspace Architecture — Per-widget controls
// Hide / Collapse / Pin — persisted per-user via useWorkspace.
// Per §11: controls are UI-only; persistence is handled by useWorkspace hook.

"use client";

import { useWorkspace } from "@/core/workspace/hooks/useWorkspace";
import type { WidgetState } from "@/core/workspace/workspace.types";
import { Eye, EyeOff, ChevronDown, Pin, PinOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetToolbarProps {
  widgetKey: string;
  currentState: WidgetState;
}

export function WidgetToolbar({ widgetKey, currentState }: WidgetToolbarProps) {
  const { updateWidgetState } = useWorkspace();

  const isHidden = currentState === "hidden";
  const isCollapsed = currentState === "collapsed";
  const isPinned = currentState === "pinned";

  const handleHide = () => {
    updateWidgetState(widgetKey, isHidden ? "visible" : "hidden");
  };

  const handleCollapse = () => {
    updateWidgetState(widgetKey, isCollapsed ? "visible" : "collapsed");
  };

  const handlePin = () => {
    updateWidgetState(widgetKey, isPinned ? "visible" : "pinned");
  };

  return (
    <div className="flex items-center gap-1">
      {/* Collapse / Expand */}
      <button
        onClick={handleCollapse}
        className={cn(
          "rounded p-1 transition-colors",
          isCollapsed
            ? "bg-blue-50 text-blue-600"
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        )}
        title={isCollapsed ? "توسيع" : "طي"}
        aria-label={isCollapsed ? "توسيع" : "طي"}
      >
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")}
        />
      </button>

      {/* Pin / Unpin */}
      <button
        onClick={handlePin}
        className={cn(
          "rounded p-1 transition-colors",
          isPinned
            ? "bg-blue-50 text-blue-600"
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        )}
        title={isPinned ? "إلغاء التثبيت" : "تثبيت"}
        aria-label={isPinned ? "إلغاء التثبيت" : "تثبيت"}
      >
        {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
      </button>

      {/* Hide / Show */}
      <button
        onClick={handleHide}
        className={cn(
          "rounded p-1 transition-colors",
          isHidden
            ? "bg-red-50 text-red-600"
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        )}
        title={isHidden ? "إظهار" : "إخفاء"}
        aria-label={isHidden ? "إظهار" : "إخفاء"}
      >
        {isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default WidgetToolbar;
