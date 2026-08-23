"use client";

import { Languages } from "lucide-react";
import { useI18n } from "./I18nProvider";
import type { Locale } from "./messages";

export function LanguageSwitcher() {
  const { locale, messages, setLocale } = useI18n();

  function changeLocale(next: Locale) {
    if (next === locale) return;
    setLocale(next);
    // Refresh server-rendered content that may read the locale cookie.
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-1 rounded-md border bg-background p-1" aria-label={messages.language.label}>
      <Languages className="mx-1 h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <button
        type="button"
        aria-pressed={locale === "ar"}
        onClick={() => changeLocale("ar")}
        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${locale === "ar" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
      >
        {messages.language.arabic}
      </button>
      <button
        type="button"
        aria-pressed={locale === "en"}
        onClick={() => changeLocale("en")}
        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${locale === "en" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
      >
        {messages.language.english}
      </button>
    </div>
  );
}
