"use client";

import { useState, useCallback } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useTenantId } from "@/core/auth/useTenantId";
import { useSystemPreferences, updateSystemPreferences } from "@/domain/system-preferences";
import {
  SUPPORTED_LANGUAGES,
  SUPPORTED_DIRECTIONS,
  SUPPORTED_TIMEZONES,
  SUPPORTED_CURRENCIES,
  type SupportedLanguage,
  type SupportedDirection,
} from "@/domain/system-preferences/system-preferences.types";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { toast } from "sonner";

export function SystemPreferencesManager() {
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("settings:update");

  const { tenantId, isLoading: tenantLoading } = useTenantId();
  const {
    data: preferences,
    isLoading: prefsLoading,
    error: prefsError,
  } = useSystemPreferences(tenantId);

  const [saving, setSaving] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<{
    language: SupportedLanguage;
    direction: SupportedDirection;
    timezone: string;
    currency: string;
  } | null>(null);

  const isLoading = tenantLoading || prefsLoading;

  // Initialize local state once data loads
  const current = localPrefs ?? preferences;

  const handleChange = useCallback(
    (field: string, value: string) => {
      setLocalPrefs((prev) => {
        const base = prev ?? preferences;
        if (!base) return prev;
        return { ...base, [field]: value } as typeof base;
      });
    },
    [preferences]
  );

  async function handleSave() {
    if (!current || !canUpdate) return;

    setSaving(true);

    const result = await updateSystemPreferences({
      language: current.language,
      direction: current.direction,
      timezone: current.timezone,
      currency: current.currency,
    });

    setSaving(false);

    if (result.success) {
      toast.success("تم حفظ التفضيلات بنجاح", {
        description: "جاري إعادة تحميل الصفحة لتطبيق التغييرات...",
      });
      // Reload to apply direction/language changes globally
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } else {
      toast.error("فشل حفظ التفضيلات", {
        description: result.error ?? "حدث خطأ غير متوقع",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-3 text-muted-foreground">جاري التحميل...</span>
      </div>
    );
  }

  if (prefsError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p>فشل تحميل تفضيلات النظام. يرجى المحاولة مرة أخرى.</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p>لم يتم العثور على تفضيلات النظام.</p>
      </div>
    );
  }

  const hasChanges =
    localPrefs &&
    preferences &&
    (localPrefs.language !== preferences.language ||
      localPrefs.direction !== preferences.direction ||
      localPrefs.timezone !== preferences.timezone ||
      localPrefs.currency !== preferences.currency);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">تفضيلات النظام</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        إدارة إعدادات النظام الأساسية للعيادة. تتضمن اللغة، اتجاه النص، المنطقة الزمنية، والعملة.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">الإعدادات العامة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">اللغة</Label>
            <Select
              value={current.language}
              onValueChange={(v) => handleChange("language", v)}
              disabled={!canUpdate || saving}
            >
              <SelectTrigger id="language" className="w-full sm:w-[280px]">
                <SelectValue placeholder="اختر اللغة" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              لغة واجهة المستخدم. (ملاحظة: نظام الترجمة الكامل غير مُفعَّل بعد — يتم تخزين التفضيل فقط)
            </p>
          </div>

          {/* Direction */}
          <div className="space-y-2">
            <Label htmlFor="direction">اتجاه النص</Label>
            <Select
              value={current.direction}
              onValueChange={(v) => handleChange("direction", v)}
              disabled={!canUpdate || saving}
            >
              <SelectTrigger id="direction" className="w-full sm:w-[280px]">
                <SelectValue placeholder="اختر الاتجاه" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_DIRECTIONS.map((dir) => (
                  <SelectItem key={dir.value} value={dir.value}>
                    {dir.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              يؤثر على ترتيب عناصر الواجهة واتجاه النصوص في التطبيق بالكامل.
            </p>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">المنطقة الزمنية</Label>
            <Select
              value={current.timezone}
              onValueChange={(v) => handleChange("timezone", v)}
              disabled={!canUpdate || saving}
            >
              <SelectTrigger id="timezone" className="w-full sm:w-[280px]">
                <SelectValue placeholder="اختر المنطقة الزمنية" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">العملة</Label>
            <Select
              value={current.currency}
              onValueChange={(v) => handleChange("currency", v)}
              disabled={!canUpdate || saving}
            >
              <SelectTrigger id="currency" className="w-full sm:w-[280px]">
                <SelectValue placeholder="اختر العملة" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label} ({curr.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              العملة المستخدمة في الفواتير والتقارير المالية.
            </p>
          </div>

          {/* Save button */}
          {canUpdate && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="w-full sm:w-auto"
              >
                {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                حفظ التغييرات
              </Button>

              {hasChanges && (
                <Badge variant="outline" className="w-fit border-amber-300 text-amber-700">
                  <AlertCircle className="ml-1 h-3 w-3" />
                  هناك تغييرات غير محفوظة
                </Badge>
              )}
            </div>
          )}

          {!canUpdate && (
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>ليس لديك صلاحية تعديل إعدادات النظام.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
