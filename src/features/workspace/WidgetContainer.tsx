"use client";

import { useState, Suspense, Component as ReactComponent, type ReactNode } from "react";
import type { ResolvedWidget, WorkspaceContext } from "@/core/workspace/workspace.types";
import { WidgetToolbar } from "./WidgetToolbar";
import { AlertCircle, Loader2, ChevronDown, Pin } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface WidgetContainerProps { resolved: ResolvedWidget; context?: WorkspaceContext; }

function WidgetErrorBoundary({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-red-700"><AlertCircle className="h-8 w-8" /><p className="text-sm font-medium">{error.message || "حدث خطأ غير متوقع"}</p><button onClick={onRetry} className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium hover:bg-red-200">إعادة المحاولة</button></div>;
}
function WidgetLoading() { return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>; }

class WidgetRenderBoundary extends ReactComponent<{ onError: (err: Error) => void; children: ReactNode }, { hasError: boolean }> {
  constructor(props: { onError: (err: Error) => void; children: ReactNode }) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: unknown) { this.props.onError(error instanceof Error ? error : new Error(String(error))); }
  render() { return this.state.hasError ? null : this.props.children; }
}

export function WidgetContainer({ resolved, context }: WidgetContainerProps) {
  const { definition, layout } = resolved;
  const [error, setError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const isCollapsed = layout.state === "collapsed";
  const isPinned = layout.state === "pinned";
  const handleRetry = () => { setError(null); setRetryKey((k) => k + 1); };
  return <div className={cn("relative flex flex-col rounded-xl border bg-white shadow-sm transition-shadow", isPinned && "ring-2 ring-blue-100 shadow-md", !isCollapsed && "hover:shadow-md")}>
    <div className="flex items-center justify-between border-b px-4 py-3"><div className="flex items-center gap-2">{isPinned && <Pin className="h-4 w-4 text-blue-500" />}<h3 className="text-sm font-semibold text-gray-800">{definition.labelAr}</h3></div><WidgetToolbar widgetKey={definition.key} currentState={layout.state} /></div>
    {isCollapsed ? <div className="flex items-center justify-center py-4 text-gray-400"><ChevronDown className="h-5 w-5" /><span className="mr-1 text-xs">مطوي</span></div> : error ? <WidgetErrorBoundary error={error} onRetry={handleRetry} /> : <div className="p-4"><WidgetRenderBoundary key={retryKey} onError={(err) => setError(err)}><Suspense fallback={<WidgetLoading />}><WidgetContent definition={definition} context={context} /></Suspense></WidgetRenderBoundary></div>}
  </div>;
}

function WidgetContent({ definition, context }: { definition: ResolvedWidget["definition"]; context?: WorkspaceContext }) {
  const Component = definition.component;
  return <Component widget={definition} state="visible" onStateChange={() => {}} context={context} />;
}

export default WidgetContainer;
