"use client";

import { useI18n } from "@/core/i18n/I18nProvider";

export function FollowupPageHeader() {
  const { locale, followup } = useI18n();
  return (
    <div className="flex items-center justify-between gap-4" dir={locale === "ar" ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-bold">{followup.title}</h1>
      <p className="text-sm text-muted-foreground">{followup.pageDescription}</p>
    </div>
  );
}
