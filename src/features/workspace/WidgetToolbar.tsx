"use client";

import type { DragEvent } from "react";
import { useI18n } from "@/core/i18n/I18nProvider";
import type { WorkspaceSurfaceKey } from "@/core/workspace/workspaceSurfaces";
import type { WidgetState } from "@/core/workspace/workspace.types";
import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, GripVertical, Pin, PinOff } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface WidgetToolbarProps {
  widgetKey: string;
  currentState: WidgetState;
  workspaceKey?: WorkspaceSurfaceKey;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onStateChange: (state: WidgetState) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDragStart?: (event: DragEvent<HTMLButtonElement>) => void;
  onDragEnd?: () => void;
}

export function WidgetToolbar({
  widgetKey,
  currentState,
  workspaceKey: _workspaceKey,
  canMoveUp = false,
  canMoveDown = false,
  onStateChange,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragEnd,
}: WidgetToolbarProps) {
  const { workspace } = useI18n();
  const isHidden = currentState === "hidden";
  const isCollapsed = currentState === "collapsed";
  const isPinned = currentState === "pinned";

  const handleHide = () => onStateChange(isHidden ? "visible" : "hidden");
  const handleCollapse = () => onStateChange(isCollapsed ? "visible" : "collapsed");
  const handlePin = () => onStateChange(isPinned ? "visible" : "pinned");

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className="hidden cursor-grab rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 sm:inline-flex"
        title={workspace.dragToReorder}
        aria-label={workspace.dragToReorder}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onMoveUp}
        disabled={!canMoveUp}
        className={cn("rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30 sm:hidden")}
        title={workspace.moveUp}
        aria-label={workspace.moveUp}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={!canMoveDown}
        className={cn("rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30 sm:hidden")}
        title={workspace.moveDown}
        aria-label={workspace.moveDown}
      >
        <ArrowDown className="h-4 w-4" />
      </button>

      <button
        type="button"
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
        type="button"
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
        type="button"
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

      <span className="sr-only">{widgetKey}</span>
    </div>
  );
}

export default WidgetToolbar;
