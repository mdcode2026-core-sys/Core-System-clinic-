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
import { getSubscriptionMessages } from "./subscriptionMessages";
import { getSuperAdminMessages } from "./superAdminMessages";
import { getRoomsMessages } from "./roomsMessages";
import { getRolesMessages } from "./rolesMessages";
import { getMedicalFilesMessages } from "./medicalFilesMessages";
import { getFollowupMessages } from "./followupMessages";
import { getAgendaFormMessages } from "./agendaFormMessages";
import { getAnalyticsMessages } from "./analyticsMessages";
import { getRoleErrorMessage } from "./roleErrorMessages";
import { getAuditMessages } from "./auditMessages";
import { getVisitErrorMessage } from "./visitErrorMessages";
type BaseTerminology = ReturnType<typeof getTerminology>; type UnifiedTerminology = BaseTerminology & { clinical: BaseTerminology["clinical"] & { followUp: string } };
export interface I18nContextValue { locale: Locale; messages: ReturnType<typeof getMessages>; admin: ReturnType<typeof getAdminMessages>; auth: ReturnType<typeof getAuthMessages>; queue: ReturnType<typeof getQueueMessages>; kiosk: ReturnType<typeof getKioskMessages>; reportViewer: ReturnType<typeof getReportViewerMessages>; procedures: ReturnType<typeof getProcedureMessages>; appointment: ReturnType<typeof getAppointmentMessages>; workspace: ReturnType<typeof getWorkspaceMessages>; invoice: ReturnType<typeof getInvoiceMessages>; portal: ReturnType<typeof getPortalMessages>; systemPreferences: ReturnType<typeof getSystemPreferencesMessages>; subscription: ReturnType<typeof getSubscriptionMessages>; superAdmin: ReturnType<typeof getSuperAdminMessages>; rooms: ReturnType<typeof getRoomsMessages>; roles: ReturnType<typeof getRolesMessages>; medicalFiles: ReturnType<typeof getMedicalFilesMessages>; followup: ReturnType<typeof getFollowupMessages>; agendaForm: ReturnType<typeof getAgendaFormMessages>; analytics: ReturnType<typeof getAnalyticsMessages>; audit: ReturnType<typeof getAuditMessages>; roleError: (code: string | null | undefined) => string; visitError: (code: string | null | undefined) => string; terminology: UnifiedTerminology; setLocale: (locale: Locale) => void; }
const I18nContext = createContext<I18nContextValue | null>(null); const LOCALE_COOKIE = "core-system-locale"; const DIRECTION_COOKIE = "core-system-direction"; const LOCALE_STORAGE_KEY = "core-system-locale";
function isLocale(value: string | null | undefined): value is Locale { return value === "ar" || value === "en"; }
function readCookie(name: string): string | null { if (typeof document === "undefined") return null; const prefix = `${name}=`; return document.cookie.split(";").map(part => part.trim()).find(part => part.startsWith(prefix))?.slice(prefix.length) ?? null; }
function applyDocumentLocale(locale: Locale) { if (typeof document === "undefined") return; const direction = locale === "ar" ? "rtl" : "ltr"; document.documentElement.lang = locale; document.documentElement.dir = direction; document.documentElement.dataset.locale = locale; document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`; document.cookie = `${DIRECTION_COOKIE}=${direction}; path=/; max-age=31536000; SameSite=Lax`; window.localStorage.setItem(LOCALE_STORAGE_KEY, locale); }
function getUnifiedTerminology(locale: Locale): UnifiedTerminology { const base = getTerminology(locale); const messages = getMessages(locale); return { ...base, clinical: { ...base.clinical, followUp: messages.followUp.title } } as UnifiedTerminology; }
export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) { const [locale, setLocaleState] = useState<Locale>(() => { if (typeof window === "undefined") return initialLocale; const cookieLocale = readCookie(LOCALE_COOKIE); if (isLocale(cookieLocale)) return cookieLocale; const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY); return isLocale(stored) ? stored : initialLocale; }); useEffect(() => { applyDocumentLocale(locale); }, [locale]); const setLocale = useCallback((nextLocale: Locale) => { setLocaleState(nextLocale); applyDocumentLocale(nextLocale); }, []); const value = useMemo(() => ({ locale, messages: getMessages(locale), admin: getAdminMessages(locale), auth: getAuthMessages(locale), queue: getQueueMessages(locale), kiosk: getKioskMessages(locale), reportViewer: getReportViewerMessages(locale), procedures: getProcedureMessages(locale), appointment: getAppointmentMessages(locale), workspace: getWorkspaceMessages(locale), invoice: getInvoiceMessages(locale), portal: getPortalMessages(locale), systemPreferences: getSystemPreferencesMessages(locale), subscription: getSubscriptionMessages(locale), superAdmin: getSuperAdminMessages(locale), rooms: getRoomsMessages(locale), roles: getRolesMessages(locale), medicalFiles: getMedicalFilesMessages(locale), followup: getFollowupMessages(locale), agendaForm: getAgendaFormMessages(locale), analytics: getAnalyticsMessages(locale), audit: getAuditMessages(locale), roleError: (code: string | null | undefined) => getRoleErrorMessage(locale, code), visitError: (code: string | null | undefined) => getVisitErrorMessage(locale, code), terminology: getUnifiedTerminology(locale), setLocale }), [locale, setLocale]); return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>; }
export function useI18n() { const context = useContext(I18nContext); if (!context) throw new Error("useI18n must be used inside I18nProvider"); return context; }
