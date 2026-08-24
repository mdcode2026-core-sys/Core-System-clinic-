"use client";

import Link from "next/link";
import type { WidgetComponentProps } from "@/core/workspace/workspace.types";
import { useI18n } from "@/core/i18n/I18nProvider";

export function FollowupWidget({ state, onStateChange }: WidgetComponentProps) {
  const { locale, workspace } = useI18n();
  if (state === "hidden" || state === "disabled") return null;
  const t = workspace.followupWidget;

  return (
    <div className="flex h-full min-w-0 flex-col justify-between rounded-lg border bg-card p-4" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="min-w-0">
        <div className="text-sm font-medium text-muted-foreground">{t.title}</div>
        <div className="mt-1 text-lg font-semibold">{t.patients}</div>
        <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <Link href="/follow-up" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">{t.open}</Link>
        {state === "collapsed" ? <button onClick={() => onStateChange("visible")} className="text-sm text-muted-foreground">{workspace.expand}</button> : <button onClick={() => onStateChange("collapsed")} className="text-sm text-muted-foreground">{workspace.collapse}</button>}
      </div>
    </div>
  );
}
