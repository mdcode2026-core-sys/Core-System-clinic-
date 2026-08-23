"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale } from "./messages";
import { getMessages } from "./messages";

interface I18nContextValue {
  locale: Locale;
  messages: ReturnType<typeof getMessages>;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function applyLocale(locale: Locale) {
  const direction = locale === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = locale;
  document.documentElement.dir = direction;
  document.cookie = `core-system-locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  document.cookie = `core-system-direction=${direction}; path=/; max-age=31536000; SameSite=Lax`;
  window.localStorage.setItem("core-system-locale", locale);
}

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    setLocaleState(initialLocale);
  }, [initialLocale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    applyLocale(nextLocale);
  }, []);

  const value = useMemo(() => ({ locale, messages: getMessages(locale), setLocale }), [locale, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
