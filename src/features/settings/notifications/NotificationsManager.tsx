"use client";

import { useState, useCallback } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useTenantId } from "@/core/auth/useTenantId";
import { useNotificationPreferences, updateNotificationChannelPreference } from "@/domain/notifications";
import { CHANNEL_METADATA } from "@/domain/notifications/notification.types";
import type { NotificationChannel } from "@/domain/notifications/notification.types";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Switch } from "@/shared/components/ui/switch";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Loader2, CheckCircle, AlertCircle, Bell, MessageCircle, Mail, Smartphone, Monitor } from "lucide-react";
import { toast } from "sonner";

const CHANNEL_ICONS: Record<NotificationChannel, React.ElementType> = {
  whatsapp: MessageCircle,
  sms: Smartphone,
  email: Mail,
  in_app: Monitor,
};

export function NotificationsManager() {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("notifications:manage");

  const { tenantId, isLoading: tenantLoading } = useTenantId();
  const {
    data: preferences,
    isLoading: prefsLoading,
    error: prefsError,
    refetch,
  } = useNotificationPreferences(tenantId);

  const [pendingChanges, setPendingChanges] = useState<Map<NotificationChannel, boolean>>(new Map());
  const [savingChannels, setSavingChannels] = useState<Set<NotificationChannel>>(new Set());

  const isLoading = tenantLoading || prefsLoading;

  const handleToggle = useCallback(
    (channel: NotificationChannel, nextValue: boolean) => {
      if (!canManage) return;
      setPendingChanges((prev) => {
        const next = new Map(prev);
        const currentPref = preferences?.find((p) => p.channel === channel);
        if (currentPref && currentPref.is_enabled === nextValue) {
          next.delete(channel);
        } else {
          next.set(channel, nextValue);
        }
        return next;
      });
    },
    [canManage, preferences]
  );

  const getEffectiveValue = useCallback(
    (channel: NotificationChannel): boolean => {
      if (pendingChanges.has(channel)) {
        return pendingChanges.get(channel)!;
      }
      return preferences?.find((p) => p.channel === channel)?.is_enabled ?? true;
    },
    [pendingChanges, preferences]
  );

  const hasChanges = pendingChanges.size > 0;

  async function handleSave() {
    if (!canManage || !tenantId || pendingChanges.size === 0) return;

    const channelsToSave = Array.from(pendingChanges.entries());
    const newSaving = new Set<NotificationChannel>();
    for (const [ch] of channelsToSave) newSaving.add(ch);
    setSavingChannels(newSaving);

    let successCount = 0;
    let failCount = 0;
    let lastError: string | null = null;

    for (const [channel, is_enabled] of channelsToSave) {
      const result = await updateNotificationChannelPreference({ channel, is_enabled });
      if (result.success) {
        successCount++;
      } else {
        failCount++;
        lastError = result.error;
      }
    }

    setSavingChannels(new Set());
    setPendingChanges(new Map());
    await refetch();

    if (failCount === 0) {
      toast.success("تم حفظ التفضيلات بنجاح", {
        description: `تم تحديث ${successCount} قناة تنبيهات.`,
      });
    } else if (successCount === 0) {
      toast.error("فشل حفظ التفضيلات", {
        description: lastError ?? "حدث خطأ أثناء الحفظ.",
      });
    } else {
      toast.warning("تم الحفظ جزئياً", {
        description: `نجح ${successCount}، فشل ${failCount}.`,
      });
    }
  }

  function handleReset() {
    setPendingChanges(new Map());
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-3 text-muted-foreground">جاري تحميل تفضيلات التنبيهات...</span>
      </div>
    );
  }

  if (prefsError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-destructive font-medium">فشل تحميل تفضيلات التنبيهات</p>
        <p className="text-muted-foreground text-sm">{prefsError instanceof Error ? prefsError.message : "حدث خطأ غير متوقع"}</p>
        <Button variant="outline" onClick={() => refetch()}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  if (!preferences || preferences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Bell className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground font-medium">لا توجد قنوات تنبيهات متاحة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">تفضيلات التنبيهات</h2>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة القنوات المستخدمة لإرسال التنبيهات داخل العيادة.
          </p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset} disabled={savingChannels.size > 0}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={savingChannels.size > 0 || !canManage}>
              {savingChannels.size > 0 ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {!canManage && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-amber-800 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          ليس لديك صلاحية تعديل تفضيلات التنبيهات. يمكنك فقط عرض الإعدادات الحالية.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {preferences.map((pref) => {
          const meta = CHANNEL_METADATA[pref.channel];
          const Icon = CHANNEL_ICONS[pref.channel];
          const effectiveValue = getEffectiveValue(pref.channel);
          const isSaving = savingChannels.has(pref.channel);
          const hasPending = pendingChanges.has(pref.channel);

          return (
            <Card
              key={pref.channel}
              className={`transition-colors ${hasPending ? "border-primary/50 bg-primary/5" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{meta.labelAr}</CardTitle>
                      <CardDescription className="text-xs">{meta.descriptionAr}</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={effectiveValue}
                    onCheckedChange={(checked) => handleToggle(pref.channel, checked)}
                    disabled={!canManage || isSaving}
                    aria-label={`تفعيل قناة ${meta.labelAr}`}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {effectiveValue ? (
                      <span className="text-emerald-600 font-medium">مفعّلة</span>
                    ) : (
                      <span className="text-red-500 font-medium">معطّلة</span>
                    )}
                  </span>
                  {hasPending && (
                    <span className="text-primary font-medium">تغيير غير محفوظ</span>
                  )}
                  {isSaving && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      جاري الحفظ...
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
