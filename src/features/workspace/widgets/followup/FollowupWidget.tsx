"use client";

import Link from "next/link";
import type { WidgetComponentProps } from "@/core/workspace/workspace.types";

export function FollowupWidget({ state, onStateChange }: WidgetComponentProps) {
  if (state === "hidden" || state === "disabled") return null;
  return (
    <div className="flex h-full flex-col justify-between rounded-lg border bg-card p-4" dir="rtl">
      <div>
        <div className="text-sm font-medium text-muted-foreground">المتابعة</div>
        <div className="mt-1 text-lg font-semibold">متابعات المرضى</div>
        <p className="mt-1 text-sm text-muted-foreground">اعرف ما يحتاج إلى متابعة اليوم وافتح قائمة العمل.</p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <Link href="/follow-up" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">فتح المتابعة</Link>
        {state === "collapsed" ? <button onClick={() => onStateChange("visible")} className="text-sm text-muted-foreground">توسيع</button> : <button onClick={() => onStateChange("collapsed")} className="text-sm text-muted-foreground">طي</button>}
      </div>
    </div>
  );
}
