"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale } from "./messages";
import { getMessages } from "./messages";
import { getTerminology } from "./terminology";
import { getAdminMessages } from "./adminMessages";
import { getAuthMessages } from "./authMessages";
import { getQueueMessages } from "./queueMessages";
import { getKioskMessages } from "./kioskMessages";
import { getReportViewerMessages } from "./reportViewerMessages";
import { getProcedureMessages } from "./procedureMessages";
import { getAppointmentMessages } from "./appointmentMessages";
import { getWorkspaceMessages } from "./workspaceMessages";
import { getInvoiceMessages } from "./invoiceMessages";
import { getPortalMessages } from "./portalMessages";
import { getSystemPreferencesMessages } from "./systemPreferencesMessages";
type BaseTerminology = ReturnType<typeof getTerminology>; type UnifiedTerminology = BaseTerminology & { clinical: BaseTerminology["clinical"] & { followUp: string } };
export interface I18nContextValue { locale: Locale; messages: ReturnType<typeof getMessages>; admin: ReturnType<typeof getAdminMessages>; auth: ReturnType<typeof getAuthMessages>; queue: ReturnType<typeof getQueueMessages>; kiosk: ReturnType<typeof getKioskMessages>; reportViewer: ReturnType<typeof getReportViewerMessages>; procedures: ReturnType<typeof getProcedureMessages>; appointment: ReturnType<typeof getAppointmentMessages>; workspace: ReturnType<typeof getWorkspaceMessages>; invoice: ReturnType<typeof getInvoiceMessages>; portal: ReturnType<typeof getPortalMessages>; systemPreferences: ReturnType<typeof getSystemPreferencesMessages>; terminology: UnifiedTerminology; setLocale: (locale: Locale) => void; }
const I18nContext = createContext<I18nContextValue | null>(null); const LOCALE_COOKIE = "core-system-locale"; const DIRECTION_COOKIE = "core-system-direction"; const LOCALE_STORAGE_KEY = "core-system-locale";
function isLocale(value: string | null | undefined): value is Locale { return value === "ar" || value === "en"; }
function applyDocumentLocale(locale: Locale) { if (typeof document === "undefined") return; const direction = locale === "ar" ? "rtl" : "ltr"; document.documentElement.lang = locale; document.documentElement.dir = direction; document.documentElement.dataset.locale = locale; document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`; document.cookie = `${DIRECTION_COOKIE}=${direction}; path=/; max-age=31536000; SameSite=Lax`; window.localStorage.setItem(LOCALE_STORAGE_KEY, locale); }
function getUnifiedTerminology(locale: Locale): UnifiedTerminology { const base = getTerminology(locale); const messages = getMessages(locale); return { ...base, clinical: { ...base.clinical, followUp: messages.followUp.title } } as UnifiedTerminology; }
export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) { const [locale, setLocaleState] = useState<Locale>(() => { if (typeof window === "undefined") return initialLocale; const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY); return isLocale(stored) ? stored : initialLocale; }); useEffect(() => { applyDocumentLocale(locale); }, [locale]); const setLocale = useCallback((nextLocale: Locale) => { setLocaleState(nextLocale); applyDocumentLocale(nextLocale); }, []); const value = useMemo(() => ({ locale, messages: getMessages(locale), admin: getAdminMessages(locale), auth: getAuthMessages(locale), queue: getQueueMessages(locale), kiosk: getKioskMessages(locale), reportViewer: getReportViewerMessages(locale), procedures: getProcedureMessages(locale), appointment: getAppointmentMessages(locale), workspace: getWorkspaceMessages(locale), invoice: getInvoiceMessages(locale), portal: getPortalMessages(locale), systemPreferences: getSystemPreferencesMessages(locale), terminology: getUnifiedTerminology(locale), setLocale }), [locale, setLocale]); return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>; }
export function useI18n() { const context = useContext(I18nContext); if (!context) throw new Error("useI18n must be used inside I18nProvider"); return context; }
