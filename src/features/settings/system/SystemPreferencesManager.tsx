"use client";

import { useState, useCallback } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useTenantId } from "@/core/auth/useTenantId";
import { useSystemPreferences, updateSystemPreferences } from "@/domain/system-preferences";
import { SUPPORTED_LANGUAGES, SUPPORTED_DIRECTIONS, SUPPORTED_TIMEZONES, SUPPORTED_CURRENCIES, type SupportedLanguage, type SupportedDirection } from "@/domain/system-preferences/system-preferences.types";
import { useI18n } from "@/core/i18n/I18nProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Loader2, AlertCircle, Settings } from "lucide-react";
import { toast } from "sonner";

const LANGUAGE_LABELS = { ar: { ar: "العربية", en: "Arabic" }, en: { ar: "الإنجليزية", en: "English" } };
const DIRECTION_LABELS = { rtl: { ar: "من اليمين إلى اليسار", en: "Right to left" }, ltr: { ar: "من اليسار إلى اليمين", en: "Left to right" } };

export function SystemPreferencesManager() {
  const { hasPermission } = usePermissions();
  const { locale, messages } = useI18n();
  const canUpdate = hasPermission("settings:update");
  const { tenantId, isLoading: tenantLoading } = useTenantId();
  const { data: preferences, isLoading: prefsLoading, error: prefsError } = useSystemPreferences(tenantId);
  const [saving, setSaving] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<{ language: SupportedLanguage; direction: SupportedDirection; timezone: string; currency: string } | null>(null);
  const t = messages.settings; const common = messages.common; const direction = locale === "ar" ? "rtl" : "ltr";
  const current = localPrefs ?? preferences;
  const tr = (ar: string, en: string) => locale === "ar" ? ar : en;
  const handleChange = useCallback((field: string, value: string) => { setLocalPrefs((prev) => { const base = prev ?? preferences; return base ? { ...base, [field]: value } as typeof base : prev; }); }, [preferences]);
  async function handleSave() {
    if (!current || !canUpdate) return; setSaving(true);
    const result = await updateSystemPreferences({ language: current.language, direction: current.direction, timezone: current.timezone, currency: current.currency }); setSaving(false);
    if (result.success) { toast.success(tr("تم حفظ التفضيلات بنجاح", "Preferences saved successfully"), { description: tr("سيتم تطبيق تغييرات اللغة والاتجاه بعد إعادة تحميل الصفحة.", "Language and direction changes will apply after the page reloads.") }); setTimeout(() => window.location.reload(), 1200); }
    else toast.error(tr("فشل حفظ التفضيلات", "Failed to save preferences"), { description: result.error ?? common.unexpectedError });
  }
  if (tenantLoading || prefsLoading) return <div className="flex items-center justify-center py-12" dir={direction}><Loader2 className="me-3 h-8 w-8 animate-spin text-primary" /><span className="text-muted-foreground">{common.loading}</span></div>;
  if (prefsError) return <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800" dir={direction}><AlertCircle className="h-5 w-5 shrink-0" /><p>{tr("فشل تحميل تفضيلات النظام. يرجى المحاولة مرة أخرى.", "Failed to load system preferences. Please try again.")}</p></div>;
  if (!current) return <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800" dir={direction}><AlertCircle className="h-5 w-5 shrink-0" /><p>{tr("لم يتم العثور على تفضيلات النظام.", "System preferences were not found.")}</p></div>;
  const hasChanges = !!(localPrefs && preferences && (localPrefs.language !== preferences.language || localPrefs.direction !== preferences.direction || localPrefs.timezone !== preferences.timezone || localPrefs.currency !== preferences.currency));
  const currencyLabel = (value: string) => { const item = SUPPORTED_CURRENCIES.find((x) => x.value === value); return item ? item.value === "JOD" ? tr("دينار أردني (JOD)", "Jordanian Dinar (JOD)") : item.value === "SAR" ? tr("ريال سعودي (SAR)", "Saudi Riyal (SAR)") : item.value === "AED" ? tr("درهم إماراتي (AED)", "UAE Dirham (AED)") : `${item.value} (${item.value})` : value; };
  return <div className="space-y-6" dir={direction}>
    <div className="flex items-center gap-2"><Settings className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">{tr("تفضيلات النظام", "System Preferences")}</h2></div>
    <p className="text-sm text-muted-foreground">{tr("إدارة إعدادات النظام الأساسية للعيادة، بما في ذلك اللغة واتجاه النص والمنطقة الزمنية والعملة.", "Manage core clinic settings including language, text direction, time zone, and currency.")}</p>
    <Card><CardHeader><CardTitle className="text-base">{tr("الإعدادات العامة", "General Settings")}</CardTitle></CardHeader><CardContent className="space-y-6">
      <div className="space-y-2"><Label htmlFor="language">{tr("اللغة", "Language")}</Label><Select value={current.language} onValueChange={(v) => handleChange("language", v)} disabled={!canUpdate || saving}><SelectTrigger id="language" className="w-full sm:w-[280px]"><SelectValue placeholder={tr("اختر اللغة", "Select language")} /></SelectTrigger><SelectContent>{SUPPORTED_LANGUAGES.map((lang) => <SelectItem key={lang.value} value={lang.value}>{LANGUAGE_LABELS[lang.value]?.[locale] ?? lang.label}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">{tr("لغة واجهة المستخدم.", "Application interface language.")}</p></div>
      <div className="space-y-2"><Label htmlFor="direction">{tr("اتجاه النص", "Text direction")}</Label><Select value={current.direction} onValueChange={(v) => handleChange("direction", v)} disabled={!canUpdate || saving}><SelectTrigger id="direction" className="w-full sm:w-[280px]"><SelectValue placeholder={tr("اختر الاتجاه", "Select direction")} /></SelectTrigger><SelectContent>{SUPPORTED_DIRECTIONS.map((item) => <SelectItem key={item.value} value={item.value}>{DIRECTION_LABELS[item.value]?.[locale] ?? item.label}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">{tr("يحدد اتجاه واجهة التطبيق بما يتوافق مع اللغة.", "Controls the application direction to match the selected language.")}</p></div>
      <div className="space-y-2"><Label htmlFor="timezone">{tr("المنطقة الزمنية", "Time zone")}</Label><Select value={current.timezone} onValueChange={(v) => handleChange("timezone", v)} disabled={!canUpdate || saving}><SelectTrigger id="timezone" className="w-full sm:w-[280px]"><SelectValue placeholder={tr("اختر المنطقة الزمنية", "Select time zone")} /></SelectTrigger><SelectContent>{SUPPORTED_TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="currency">{tr("العملة", "Currency")}</Label><Select value={current.currency} onValueChange={(v) => handleChange("currency", v)} disabled={!canUpdate || saving}><SelectTrigger id="currency" className="w-full sm:w-[280px]"><SelectValue placeholder={tr("اختر العملة", "Select currency")} /></SelectTrigger><SelectContent>{SUPPORTED_CURRENCIES.map((curr) => <SelectItem key={curr.value} value={curr.value}>{currencyLabel(curr.value)}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">{tr("العملة المستخدمة في الفواتير والتقارير المالية.", "Currency used for invoices and financial reports.")}</p></div>
      {canUpdate && <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><Button onClick={handleSave} disabled={saving || !hasChanges} className="w-full sm:w-auto">{saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}{common.save}</Button>{hasChanges && <Badge variant="outline" className="w-fit border-amber-300 text-amber-700"><AlertCircle className="me-1 h-3 w-3" />{tr("هناك تغييرات غير محفوظة", "Unsaved changes")}</Badge>}</div>}
      {!canUpdate && <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600"><AlertCircle className="h-4 w-4 shrink-0" /><p>{tr("ليس لديك صلاحية تعديل إعدادات النظام.", "You do not have permission to edit system settings.")}</p></div>}
    </CardContent></Card>
  </div>;
}
