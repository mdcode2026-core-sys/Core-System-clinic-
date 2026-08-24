"use client";

import { useState, useCallback } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useTenantId } from "@/core/auth/useTenantId";
import { useSystemPreferences, updateSystemPreferences } from "@/domain/system-preferences";
import { SUPPORTED_LANGUAGES, SUPPORTED_TIMEZONES, SUPPORTED_CURRENCIES, type SupportedLanguage } from "@/domain/system-preferences/system-preferences.types";
import { useI18n } from "@/core/i18n/I18nProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Loader2, AlertCircle, Settings } from "lucide-react";
import { toast } from "sonner";

export function SystemPreferencesManager() {
  const { hasPermission } = usePermissions();
  const { locale, messages, systemPreferences: t } = useI18n();
  const canUpdate = hasPermission("settings:update");
  const { tenantId, isLoading: tenantLoading } = useTenantId();
  const { data: preferences, isLoading: prefsLoading, error: prefsError } = useSystemPreferences(tenantId);
  const [saving, setSaving] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<{ language: SupportedLanguage; direction: "rtl" | "ltr"; timezone: string; currency: string } | null>(null);
  const common = messages.common;
  const direction = locale === "ar" ? "rtl" : "ltr";
  const current = localPrefs ?? preferences;

  const handleChange = useCallback((field: "language" | "timezone" | "currency", value: string) => {
    setLocalPrefs((prev) => {
      const base = prev ?? preferences;
      if (!base) return prev;
      if (field === "language") return { ...base, language: value as SupportedLanguage, direction: value === "ar" ? "rtl" : "ltr" };
      return { ...base, [field]: value } as typeof base;
    });
  }, [preferences]);

  async function handleSave() {
    if (!current || !canUpdate) return;
    setSaving(true);
    const result = await updateSystemPreferences({ language: current.language, direction: current.language === "ar" ? "rtl" : "ltr", timezone: current.timezone, currency: current.currency });
    setSaving(false);
    if (result.success) {
      toast.success(t.saved, { description: t.savedDescription });
      setTimeout(() => window.location.reload(), 1200);
    } else {
      toast.error(t.saveFailed, { description: common.unexpectedError });
    }
  }

  if (tenantLoading || prefsLoading) return <div className="flex items-center justify-center py-12" dir={direction}><Loader2 className="me-3 h-8 w-8 animate-spin text-primary" /><span className="text-muted-foreground">{common.loading}</span></div>;
  if (prefsError) return <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800" dir={direction}><AlertCircle className="h-5 w-5 shrink-0" /><p>{t.loadFailed}</p></div>;
  if (!current) return <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800" dir={direction}><AlertCircle className="h-5 w-5 shrink-0" /><p>{t.notFound}</p></div>;

  const hasChanges = !!(localPrefs && preferences && (localPrefs.language !== preferences.language || localPrefs.timezone !== preferences.timezone || localPrefs.currency !== preferences.currency));
  const currencyLabel = (value: string) => t.currencies[value as keyof typeof t.currencies] ?? value;
  const derivedDirection = current.language === "ar" ? "rtl" : "ltr";

  return <div className="space-y-6" dir={direction}>
    <div className="flex items-center gap-2"><Settings className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">{t.title}</h2></div>
    <p className="text-sm text-muted-foreground">{t.description}</p>
    <Card><CardHeader><CardTitle className="text-base">{t.generalSettings}</CardTitle></CardHeader><CardContent className="space-y-6">
      <div className="space-y-2"><Label htmlFor="language">{t.language}</Label><Select value={current.language} onValueChange={(v) => handleChange("language", v)} disabled={!canUpdate || saving}><SelectTrigger id="language" className="w-full sm:w-[280px]"><SelectValue placeholder={t.selectLanguage} /></SelectTrigger><SelectContent>{SUPPORTED_LANGUAGES.map((value) => <SelectItem key={value} value={value}>{t.languages[value]}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">{t.languageHint}</p></div>
      <div className="space-y-2"><Label>{t.direction}</Label><div className="flex min-h-10 w-full items-center gap-2 rounded-md border bg-muted/30 px-3 text-sm sm:w-[280px]"><Badge variant="secondary">{t.directions[derivedDirection]}</Badge><span className="text-muted-foreground">{t.directionHint}</span></div></div>
      <div className="space-y-2"><Label htmlFor="timezone">{t.timezone}</Label><Select value={current.timezone} onValueChange={(v) => handleChange("timezone", v)} disabled={!canUpdate || saving}><SelectTrigger id="timezone" className="w-full sm:w-[280px]"><SelectValue placeholder={t.selectTimezone} /></SelectTrigger><SelectContent>{SUPPORTED_TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="currency">{t.currency}</Label><Select value={current.currency} onValueChange={(v) => handleChange("currency", v)} disabled={!canUpdate || saving}><SelectTrigger id="currency" className="w-full sm:w-[280px]"><SelectValue placeholder={t.selectCurrency} /></SelectTrigger><SelectContent>{SUPPORTED_CURRENCIES.map((value) => <SelectItem key={value} value={value}>{currencyLabel(value)}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">{t.currencyHint}</p></div>
      {canUpdate && <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><Button onClick={handleSave} disabled={saving || !hasChanges} className="w-full sm:w-auto">{saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}{common.save}</Button>{hasChanges && <Badge variant="outline" className="w-fit border-amber-300 text-amber-700"><AlertCircle className="me-1 h-3 w-3" />{t.unsaved}</Badge>}</div>}
      {!canUpdate && <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600"><AlertCircle className="h-4 w-4 shrink-0" /><p>{t.permissionDenied}</p></div>}
    </CardContent></Card>
  </div>;
}
