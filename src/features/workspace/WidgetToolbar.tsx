"use client";

import { useI18n } from "@/core/i18n/I18nProvider";
import { useWorkspace } from "@/core/workspace/hooks/useWorkspace";
import type { WorkspaceSurfaceKey } from "@/core/workspace/workspaceSurfaces";
import type { WidgetState } from "@/core/workspace/workspace.types";
import { Eye, EyeOff, ChevronDown, Pin, PinOff } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface WidgetToolbarProps {
  widgetKey: string;
  currentState: WidgetState;
  workspaceKey?: WorkspaceSurfaceKey;
}

export function WidgetToolbar({ widgetKey, currentState, workspaceKey = "global" }: WidgetToolbarProps) {
  const { updateWidgetState } = useWorkspace(workspaceKey);
  const { workspace } = useI18n();

  const isHidden = currentState === "hidden";
  const isCollapsed = currentState === "collapsed";
  const isPinned = currentState === "pinned";

  const handleHide = () => updateWidgetState(widgetKey, isHidden ? "visible" : "hidden");
  const handleCollapse = () => updateWidgetState(widgetKey, isCollapsed ? "visible" : "collapsed");
  const handlePin = () => updateWidgetState(widgetKey, isPinned ? "visible" : "pinned");

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleCollapse}
        className={cn(
          "rounded p-1 transition-colors",
          isCollapsed ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600",
        )}
        title={isCollapsed ? workspace.expand : workspace.collapse}
        aria-label={isCollapsed ? workspace.expand : workspace.collapse}
      >
        <ChevronDown className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
      </button>

      <button
        onClick={handlePin}
        className={cn(
          "rounded p-1 transition-colors",
          isPinned ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600",
        )}
        title={isPinned ? workspace.unpin : workspace.pin}
        aria-label={isPinned ? workspace.unpin : workspace.pin}
      >
        {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
      </button>

      <button
        onClick={handleHide}
        className={cn(
          "rounded p-1 transition-colors",
          isHidden ? "bg-red-50 text-red-600" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600",
        )}
        title={isHidden ? workspace.show : workspace.hide}
        aria-label={isHidden ? workspace.show : workspace.hide}
      >
        {isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default WidgetToolbar;
