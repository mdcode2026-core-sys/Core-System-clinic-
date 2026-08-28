"use client";

import { useState, Suspense, Component as ReactComponent, type ReactNode } from "react";
import type { ResolvedWidget, WorkspaceContext, WidgetState } from "@/core/workspace/workspace.types";
import type { WorkspaceSurfaceKey } from "@/core/workspace/workspaceSurfaces";
import { WidgetToolbar } from "./WidgetToolbar";
import { AlertCircle, Loader2, ChevronDown, Pin } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useI18n } from "@/core/i18n/I18nProvider";

interface WidgetContainerProps {
  resolved: ResolvedWidget;
  context?: WorkspaceContext;
  workspaceKey?: WorkspaceSurfaceKey;
  onStateChange?: (widgetKey: string, state: WidgetState) => void;
}

function WidgetErrorBoundary({ onRetry, labels, direction }: { onRetry: () => void; labels: { error: string; retry: string }; direction: "rtl" | "ltr" }) {
  return <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-red-700" dir={direction}><AlertCircle className="h-8 w-8" /><p className="text-sm font-medium">{labels.error}</p><button type="button" onClick={onRetry} className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium hover:bg-red-200">{labels.retry}</button></div>;
}
function WidgetLoading() { return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>; }

export function WidgetContainer({ resolved, context, workspaceKey = "global", onStateChange }: WidgetContainerProps) {
  const { definition, layout } = resolved;
  const { locale, workspace } = useI18n();
  const [error, setError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const isCollapsed = layout.state === "collapsed";
  const isPinned = layout.state === "pinned";
  const handleRetry = () => { setError(null); setRetryKey((k) => k + 1); };
  const widgetLabel = locale === "ar" ? definition.labelAr : definition.label;
  const direction = locale === "ar" ? "rtl" : "ltr";

  return <div className={cn("relative flex min-w-0 flex-col rounded-xl border bg-white shadow-sm transition-shadow", isPinned && "ring-2 ring-blue-100 shadow-md", !isCollapsed && "hover:shadow-md")} dir={direction}>
    <div className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        {isPinned && <Pin className="h-4 w-4 shrink-0 text-blue-500" />}
        <h3 className="break-words text-sm font-semibold text-gray-800">{widgetLabel}</h3>
      </div>
      <WidgetToolbar widgetKey={definition.key} currentState={layout.state} workspaceKey={workspaceKey} onStateChange={onStateChange} />
    </div>
    {isCollapsed ? <div className="flex items-center justify-center py-4 text-gray-400"><ChevronDown className="h-5 w-5" /><span className="me-1 text-xs">{workspace.collapsed}</span></div> : error ? <WidgetErrorBoundary onRetry={handleRetry} labels={{ error: workspace.widgetError, retry: workspace.retry }} direction={direction} /> : <div className="min-w-0 p-4"><WidgetRenderBoundary key={retryKey} onError={(err) => setError(err)}><Suspense fallback={<WidgetLoading />}><WidgetContent definition={definition} context={context} /></Suspense></WidgetRenderBoundary></div>}
  </div>;
}

function WidgetRenderBoundary({ onError, children }: { onError: (err: Error) => void; children: ReactNode }) {
  return <WidgetRenderErrorBoundary onError={onError}>{children}</WidgetRenderErrorBoundary>;
}

class WidgetRenderErrorBoundary extends ReactComponent<{ onError: (err: Error) => void; children: ReactNode }, { hasError: boolean }> {
  constructor(props: { onError: (err: Error) => void; children: ReactNode }) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: unknown) { this.props.onError(error instanceof Error ? error : new Error(String(error))); }
  render() { return this.state.hasError ? null : this.props.children; }
}

function WidgetContent({ definition, context }: { definition: ResolvedWidget["definition"]; context?: WorkspaceContext }) {
  const Component = definition.component;
  return <Component widget={definition} state="visible" onStateChange={() => {}} context={context} />;
}

export default WidgetContainer;
