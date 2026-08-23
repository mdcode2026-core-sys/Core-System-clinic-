"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale } from "./messages";
import { flattenMessages, getMessages, messages } from "./messages";

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
  document.documentElement.dataset.locale = locale;
  document.cookie = `core-system-locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  document.cookie = `core-system-direction=${direction}; path=/; max-age=31536000; SameSite=Lax`;
  window.localStorage.setItem("core-system-locale", locale);
}

function createTranslationMaps() {
  const ar = flattenMessages(messages.ar);
  const en = flattenMessages(messages.en);
  const arToEn: Record<string, string> = {};
  const enToAr: Record<string, string> = {};
  for (const key of Object.keys(ar)) {
    const source = ar[key];
    const target = en[key];
    if (source && target && source !== target) {
      arToEn[source] = target;
      enToAr[target] = source;
    }
  }
  return { arToEn, enToAr };
}

const translationMaps = createTranslationMaps();
const TRANSLATABLE_ATTRIBUTES = ["placeholder", "title", "aria-label", "aria-description"] as const;

function translateDocument(locale: Locale) {
  if (typeof document === "undefined") return;
  const map = locale === "en" ? translationMaps.arToEn : translationMaps.enToAr;
  const root = document.body;
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) nodes.push(node as Text);
  for (const textNode of nodes) {
    const parent = textNode.parentElement;
    if (!parent || parent.closest("script,style,noscript")) continue;
    const current = textNode.nodeValue ?? "";
    const trimmed = current.trim();
    if (!trimmed) continue;
    const translated = map[trimmed];
    if (translated && translated !== trimmed) {
      const start = current.indexOf(trimmed);
      textNode.nodeValue = `${current.slice(0, start)}${translated}${current.slice(start + trimmed.length)}`;
    }
  }

  for (const element of Array.from(root.querySelectorAll<HTMLElement>("*"))) {
    for (const attribute of TRANSLATABLE_ATTRIBUTES) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      const translated = map[value.trim()];
      if (translated && translated !== value) element.setAttribute(attribute, translated);
    }
  }
}

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const stored = window.localStorage.getItem("core-system-locale");
    const next = stored === "ar" || stored === "en" ? stored : initialLocale;
    setLocaleState(next);
    applyLocale(next);
    translateDocument(next);

    const observer = new MutationObserver(() => translateDocument(nextLocaleRef.current));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: [...TRANSLATABLE_ATTRIBUTES] });
    return () => observer.disconnect();
  }, [initialLocale]);

  const nextLocaleRef = useMemo(() => ({ current: locale as Locale }), []);
  nextLocaleRef.current = locale;

  useEffect(() => {
    applyLocale(locale);
    translateDocument(locale);
  }, [locale]);

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
