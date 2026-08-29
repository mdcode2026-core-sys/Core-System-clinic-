"use client";

import { useI18n } from "@/core/i18n/I18nProvider";
import type { WorkspaceSurfaceKey } from "@/core/workspace/workspaceSurfaces";
import type { WidgetState } from "@/core/workspace/workspace.types";
import { Eye, EyeOff, ChevronDown, Pin, PinOff } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface WidgetToolbarProps {
  widgetKey: string;
  currentState: WidgetState;
  workspaceKey?: WorkspaceSurfaceKey;
  onStateChange?: (widgetKey: string, state: WidgetState) => void;
}

export function WidgetToolbar({ widgetKey, currentState, onStateChange }: WidgetToolbarProps) {
  const { workspace } = useI18n();

  const isHidden = currentState === "hidden";
  const isCollapsed = currentState === "collapsed";
  const isPinned = currentState === "pinned";

  const handleHide = () => onStateChange?.(widgetKey, isHidden ? "visible" : "hidden");
  const handleCollapse = () => onStateChange?.(widgetKey, isCollapsed ? "visible" : "collapsed");
  const handlePin = () => onStateChange?.(widgetKey, isPinned ? "visible" : "pinned");

  const controlClass = "min-h-9 min-w-9 sm:min-h-8 sm:min-w-8 rounded p-1 transition-colors";

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleCollapse}
        className={cn(
          controlClass,
          isCollapsed ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600",
        )}
        title={isCollapsed ? workspace.expand : workspace.collapse}
        aria-label={isCollapsed ? workspace.expand : workspace.collapse}
      >
        <ChevronDown className={cn("mx-auto h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
      </button>

      <button
        type="button"
        onClick={handlePin}
        className={cn(
          controlClass,
          isPinned ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600",
        )}
        title={isPinned ? workspace.unpin : workspace.pin}
        aria-label={isPinned ? workspace.unpin : workspace.pin}
      >
        {isPinned ? <Pin className="mx-auto h-4 w-4" /> : <PinOff className="mx-auto h-4 w-4" />}
      </button>

      <button
        type="button"
        onClick={handleHide}
        className={cn(
          controlClass,
          isHidden ? "bg-red-50 text-red-600" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600",
        )}
        title={isHidden ? workspace.show : workspace.hide}
        aria-label={isHidden ? workspace.show : workspace.hide}
      >
        {isHidden ? <Eye className="mx-auto h-4 w-4" /> : <EyeOff className="mx-auto h-4 w-4" />}
      </button>
    </div>
  );
}

export default WidgetToolbar;
