"use client";

import { useState, Suspense } from "react";
import type { ResolvedWidget } from "@/core/workspace/workspace.types";
import { WidgetToolbar } from "./WidgetToolbar";
import { AlertCircle, Loader2, ChevronDown, Pin } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface WidgetContainerProps {
  resolved: ResolvedWidget;
}

function WidgetErrorBoundary({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
      <AlertCircle className="h-8 w-8" />
      <p className="text-sm font-medium">{error.message || "حدث خطأ غير متوقع"}</p>
      <button
        onClick={onRetry}
        className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium hover:bg-red-200"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}

function WidgetLoading() {
  return (
    <div className="flex h-32 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
    </div>
  );
}

export function WidgetContainer({ resolved }: WidgetContainerProps) {
  const { definition, layout } = resolved;
  const [error, setError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const isCollapsed = layout.state === "collapsed";
  const isPinned = layout.state === "pinned";

  const handleRetry = () => {
    setError(null);
    setRetryKey((k) => k + 1);
  };

  const handleError = (err: Error) => {
    setError(err);
  };

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border bg-white shadow-sm transition-shadow",
        isPinned && "ring-2 ring-blue-100 shadow-md",
        !isCollapsed && "hover:shadow-md"
      )}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          {isPinned && <Pin className="h-4 w-4 text-blue-500" />}
          <h3 className="text-sm font-semibold text-gray-800">
            {definition.labelAr}
          </h3>
        </div>
        <WidgetToolbar widgetKey={definition.key} currentState={layout.state} />
      </div>

      {isCollapsed ? (
        <div className="flex items-center justify-center py-4 text-gray-400">
          <ChevronDown className="h-5 w-5" />
          <span className="mr-1 text-xs">مطوي</span>
        </div>
      ) : error ? (
        <WidgetErrorBoundary error={error} onRetry={handleRetry} />
      ) : (
        <div className="p-4">
          <Suspense fallback={<WidgetLoading />}>
            <WidgetContent
              key={retryKey}
              definition={definition}
              onError={handleError}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}

function WidgetContent({
  definition,
  onError,
}: {
  definition: ResolvedWidget["definition"];
  onError: (err: Error) => void;
}) {
  try {
    const Component = definition.component;
    return (
      <Component
        widget={definition}
        state="visible"
        onStateChange={() => {}}
      />
    );
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
    return null;
  }
}

export default WidgetContainer;
