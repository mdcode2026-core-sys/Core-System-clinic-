"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale } from "./messages";
import { getMessages } from "./messages";

export interface I18nContextValue {
  locale: Locale;
  messages: ReturnType<typeof getMessages>;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const LOCALE_COOKIE = "core-system-locale";
const DIRECTION_COOKIE = "core-system-direction";
const LOCALE_STORAGE_KEY = "core-system-locale";

function isLocale(value: string | null | undefined): value is Locale {
  return value === "ar" || value === "en";
}

function applyDocumentLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  const direction = locale === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = locale;
  document.documentElement.dir = direction;
  document.documentElement.dataset.locale = locale;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  document.cookie = `${DIRECTION_COOKIE}=${direction}; path=/; max-age=31536000; SameSite=Lax`;
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    const nextLocale = isLocale(stored) ? stored : initialLocale;
    setLocaleState(nextLocale);
    applyDocumentLocale(nextLocale);
  }, [initialLocale]);

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    applyDocumentLocale(nextLocale);
  }, []);

  const value = useMemo(
    () => ({ locale, messages: getMessages(locale), setLocale }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
